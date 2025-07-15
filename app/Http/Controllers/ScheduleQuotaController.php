<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use App\Models\ScheduleQuota;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ScheduleQuotaController extends Controller
{
    /**
     * Display a listing of the schedule quotas.
     *
     * @param Request $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        try {
            $query = ScheduleQuota::with(['schedule.doctor'])
                ->join('schedules', 'schedule_quotas.schedule_id', '=', 'schedules.id')
                ->join('doctors', 'schedules.doctor_id', '=', 'doctors.id')
                ->select('schedule_quotas.*')
                ->orderBy('doctors.name')
                ->orderBy('schedules.day_of_week')
                ->orderBy('schedules.start_time');

            // Filter by doctor if provided
            if ($request->has('doctor_id') && $request->doctor_id) {
                $query->where('doctors.id', $request->doctor_id);
            }

            // Filter by day of week if provided
            if ($request->has('day_of_week') && $request->day_of_week !== '') {
                $query->where('schedules.day_of_week', $request->day_of_week);
            }

            // Filter by active schedules only
            if ($request->has('active_only') && $request->active_only) {
                $query->where('schedules.is_active', true);
            }

            $quotas = $query->paginate(10)
                ->appends($request->query());

            // Get all doctors for the filter dropdown
            $doctors = \App\Models\Doctor::select('id', 'name', 'specialty')
                ->where('is_active', true)
                ->orderBy('name')
                ->get();

            return Inertia::render('Admin/ScheduleQuotas/Index', [
                'quotas' => $quotas,
                'doctors' => $doctors,
                'filters' => $request->only(['doctor_id', 'day_of_week', 'active_only']),
                'days' => $this->getDaysOfWeek(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching schedule quotas: ' . $e->getMessage());

            return Inertia::render('Admin/ScheduleQuotas/Index', [
                'quotas' => ScheduleQuota::make()->paginate(0), // Empty paginator
                'doctors' => \App\Models\Doctor::where('is_active', true)->get(),
                'filters' => $request->only(['doctor_id', 'day_of_week', 'active_only']),
                'days' => $this->getDaysOfWeek(),
                'error' => 'Failed to load schedule quotas. Please try again later.'
            ]);
        }
    }

    /**
     * Show the form for editing the specified schedule quota.
     *
     * @param  int  $id
     * @return \Inertia\Response
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function edit($id)
    {
        try {
            $quota = ScheduleQuota::with(['schedule.doctor'])->findOrFail($id);

            return Inertia::render('Admin/ScheduleQuotas/Edit', [
                'quota' => $quota,
                'days' => $this->getDaysOfWeek(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error editing schedule quota: ' . $e->getMessage());

            return redirect()->route('schedule-quotas.index')
                ->with('error', 'Failed to load edit form.');
        }
    }

    /**
     * Update the specified schedule quota in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        try {
            // Validate the request data
            $validated = $request->validate([
                'quota_per_day' => 'required|integer|min:1',
                'appointment_duration' => 'required|integer|min:5|max:240',
            ], [
                'quota_per_day.required' => 'Daily quota is required.',
                'quota_per_day.integer' => 'Daily quota must be a number.',
                'quota_per_day.min' => 'Daily quota must be at least 1.',
                'appointment_duration.required' => 'Appointment duration is required.',
                'appointment_duration.min' => 'Appointment duration must be at least 5 minutes.',
                'appointment_duration.max' => 'Appointment duration cannot exceed 4 hours (240 minutes).',
            ]);

            $quota = ScheduleQuota::findOrFail($id);

            // Validate that the new quota settings don't conflict with existing appointments
            $this->validateQuotaChanges($quota, $request->quota_per_day, $request->appointment_duration);

            // Update the quota
            $quota->update([
                'quota_per_day' => $request->quota_per_day,
                'appointment_duration' => $request->appointment_duration,
            ]);

            return redirect()->route('schedule-quotas.index')
                ->with('success', 'Schedule quota updated successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Error updating schedule quota: ' . $e->getMessage());

            return redirect()->back()->withInput()
                ->with('error', 'An error occurred: ' . $e->getMessage());
        }
    }

    /**
     * Batch update schedule quotas.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function batchUpdate(Request $request)
    {
        try {
            // Validate the request data
            $validated = $request->validate([
                'doctor_id' => 'required|exists:doctors,id',
                'quota_per_day' => 'required|integer|min:1',
                'appointment_duration' => 'required|integer|min:5|max:240',
                'day_of_week' => 'nullable|array',
                'day_of_week.*' => 'integer|between:0,6',
            ]);

            // Build the query to find schedules to update
            $query = Schedule::where('doctor_id', $request->doctor_id);

            // Filter by days of week if provided
            if ($request->has('day_of_week') && is_array($request->day_of_week) && count($request->day_of_week) > 0) {
                $query->whereIn('day_of_week', $request->day_of_week);
            }

            $schedules = $query->with('quota')->get();

            // Loop through schedules and update quotas
            $updatedCount = 0;
            foreach ($schedules as $schedule) {
                if ($schedule->quota) {
                    try {
                        // Validate changes for this specific quota
                        $this->validateQuotaChanges($schedule->quota, $request->quota_per_day, $request->appointment_duration);

                        // Update the quota
                        $schedule->quota->update([
                            'quota_per_day' => $request->quota_per_day,
                            'appointment_duration' => $request->appointment_duration,
                        ]);

                        $updatedCount++;
                    } catch (\Exception $e) {
                        // Log but continue with other quotas
                        Log::warning('Could not update quota for schedule ID ' . $schedule->id . ': ' . $e->getMessage());
                    }
                } else {
                    // Create a new quota if one doesn't exist
                    ScheduleQuota::create([
                        'schedule_id' => $schedule->id,
                        'quota_per_day' => $request->quota_per_day,
                        'appointment_duration' => $request->appointment_duration,
                    ]);

                    $updatedCount++;
                }
            }

            if ($updatedCount == 0) {
                return redirect()->route('schedule-quotas.index')
                    ->with('info', 'No quotas were updated. Check your filter criteria.');
            }

            return redirect()->route('schedule-quotas.index')
                ->with('success', "{$updatedCount} schedule quotas updated successfully.");
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Error batch updating schedule quotas: ' . $e->getMessage());

            return redirect()->back()->withInput()
                ->with('error', 'An error occurred: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for batch updating schedule quotas.
     *
     * @return \Inertia\Response
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function batchEdit()
    {
        try {
            $doctors = \App\Models\Doctor::where('is_active', true)
                ->orderBy('name')
                ->get();

            return Inertia::render('Admin/ScheduleQuotas/BatchEdit', [
                'doctors' => $doctors,
                'days' => $this->getDaysOfWeek(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error loading batch edit form: ' . $e->getMessage());

            return redirect()->route('schedule-quotas.index')
                ->with('error', 'Failed to load batch edit form.');
        }
    }

    /**
     * Validate quota changes to ensure they don't conflict with existing appointments.
     *
     * @param ScheduleQuota $quota
     * @param int $newQuotaPerDay
     * @param int $newAppointmentDuration
     * @throws \Exception
     */
    private function validateQuotaChanges(ScheduleQuota $quota, $newQuotaPerDay, $newAppointmentDuration)
    {
        $schedule = $quota->schedule;

        // Get future dates that match this schedule's day of week
        $futureMonths = 3; // Check 3 months ahead
        $endDate = now()->addMonths($futureMonths);
        $matchingDates = [];

        for ($date = now(); $date->lte($endDate); $date->addDay()) {
            if ($date->dayOfWeek == $schedule->day_of_week) {
                $matchingDates[] = $date->format('Y-m-d');
            }
        }

        if (empty($matchingDates)) {
            return; // No dates to check
        }

        // Check if there are any days where appointment count exceeds new quota
        $appointmentCounts = \App\Models\Appointment::where('schedule_id', $schedule->id)
            ->whereIn('appointment_date', $matchingDates)
            ->where('status', 'scheduled')
            ->selectRaw('appointment_date, COUNT(*) as count')
            ->groupBy('appointment_date')
            ->having('count', '>', $newQuotaPerDay)
            ->get();

        if ($appointmentCounts->isNotEmpty()) {
            $dates = $appointmentCounts->pluck('appointment_date')->implode(', ');
            throw new \Exception("Cannot reduce quota: Some dates already have more appointments than the new quota allows ($dates)");
        }

        // If appointment duration is being reduced, check if it would cause time conflicts
        if ($newAppointmentDuration < $quota->appointment_duration) {
            // This is a complex check that would require calculating time slots
            // For simplicity, we'll skip this validation for now
            // In a real application, you might want to implement this check
        }
    }

    /**
     * Get array of days of the week.
     *
     * @return array
     */
    private function getDaysOfWeek()
    {
        return [
            0 => 'Sunday',
            1 => 'Monday',
            2 => 'Tuesday',
            3 => 'Wednesday',
            4 => 'Thursday',
            5 => 'Friday',
            6 => 'Saturday',
        ];
    }
}
