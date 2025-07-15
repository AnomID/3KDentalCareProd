<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\Schedule;
use App\Models\ScheduleException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ScheduleExceptionController extends Controller
{
    /**
     * Display a listing of the schedule exceptions.
     */
    public function index(Request $request)
    {
        try {
            // Get filter parameters
            $search = $request->input('search', '');
            $reasonFilter = $request->input('reason_filter', 'all');
            $dateFilter = $request->input('date_filter', 'all');
            $doctorFilter = $request->input('doctor_filter', 'all');
            $perPage = $request->input('per_page', 15);

            // Start query with doctor relationship
            $query = ScheduleException::with('doctor')
                ->select(
                    'id',
                    'doctor_id',
                    'exception_date_start',
                    'exception_date_end',
                    'is_full_day',
                    'start_time',
                    'end_time',
                    'reason',
                    'notes',
                    'created_at'
                );

            // Apply search (doctor name)
            if (!empty($search)) {
                $query->whereHas('doctor', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('specialization', 'like', "%{$search}%");
                });
            }

            // Apply reason filter
            if ($reasonFilter !== 'all') {
                $query->where('reason', $reasonFilter);
            }

            // Apply date filter
            if ($dateFilter !== 'all') {
                $today = now()->toDateString();

                switch ($dateFilter) {
                    case 'upcoming':
                        $query->where('exception_date_start', '>', $today);
                        break;
                    case 'current':
                        $query->where('exception_date_start', '<=', $today)
                            ->where('exception_date_end', '>=', $today);
                        break;
                    case 'past':
                        $query->where('exception_date_end', '<', $today);
                        break;
                }
            }

            // Apply doctor filter
            if ($doctorFilter !== 'all') {
                $query->where('doctor_id', $doctorFilter);
            }

            // Order by exception start date
            $exceptions = $query->orderBy('exception_date_start', 'desc')
                ->paginate($perPage)
                ->withQueryString();

            // Get available doctors for filter
            $doctors = Doctor::orderBy('name')->get(['id', 'name', 'specialization']);

            // Get available reasons
            $reasons = ScheduleException::select('reason')
                ->distinct()
                ->whereNotNull('reason')
                ->orderBy('reason')
                ->pluck('reason');

            return Inertia::render('Karyawan/DoctorSection/ScheduleException/Index', [
                'exceptions' => $exceptions,
                'doctors' => $doctors,
                'reasons' => $reasons,
                'filters' => [
                    'search' => $search,
                    'reason_filter' => $reasonFilter,
                    'date_filter' => $dateFilter,
                    'doctor_filter' => $doctorFilter,
                    'per_page' => $perPage,
                ],
                'stats' => [
                    'total_exceptions' => ScheduleException::count(),
                    'upcoming_exceptions' => ScheduleException::where('exception_date_start', '>', now()->toDateString())->count(),
                    'current_exceptions' => ScheduleException::where('exception_date_start', '<=', now()->toDateString())
                        ->where('exception_date_end', '>=', now()->toDateString())->count(),
                    'by_reason' => ScheduleException::select('reason', DB::raw('count(*) as count'))
                        ->whereNotNull('reason')
                        ->groupBy('reason')
                        ->pluck('count', 'reason'),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('ScheduleExceptionController::index - Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);

            return Inertia::render('Karyawan/DoctorSection/ScheduleException/Index', [
                'exceptions' => collect([]),
                'doctors' => collect([]),
                'reasons' => collect([]),
                'filters' => $request->only(['search', 'reason_filter', 'date_filter', 'doctor_filter']),
                'error' => 'An error occurred while loading schedule exceptions data.'
            ]);
        }
    }


    /**
     * Show the form for creating a new schedule exception.
     */
    public function create()
    {
        $doctors = Doctor::orderBy('name')->get();

        return Inertia::render('Karyawan/DoctorSection/ScheduleException/Create', [
            'doctors' => $doctors
        ]);
    }

    /**
     * Store a newly created schedule exception in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'doctor_id' => 'required|exists:doctors,id',
            'exception_date_start' => 'required|date|after_or_equal:today',
            'exception_date_end' => 'required|date|after_or_equal:exception_date_start',
            'is_full_day' => 'required|boolean',
            'start_time' => 'required_if:is_full_day,false|date_format:H:i|nullable',
            'end_time' => 'required_if:is_full_day,false|date_format:H:i|after:start_time|nullable',
            'reason' => 'required|string|max:100',
            'notes' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        // Check for overlapping exceptions for the same doctor
        $hasOverlap = $this->checkForOverlap(
            $request->doctor_id,
            $request->exception_date_start,
            $request->exception_date_end,
            $request->is_full_day,
            $request->start_time,
            $request->end_time,
            null
        );

        if ($hasOverlap) {
            return redirect()->back()
                ->withErrors(['overlap' => 'Ada pengecualian jadwal lain yang tumpang tindih dengan periode ini.'])
                ->withInput();
        }

        // Create the schedule exception
        $exception = ScheduleException::create([
            'doctor_id' => $request->doctor_id,
            'exception_date_start' => $request->exception_date_start,
            'exception_date_end' => $request->exception_date_end,
            'is_full_day' => $request->is_full_day,
            'start_time' => $request->is_full_day ? null : $request->start_time,
            'end_time' => $request->is_full_day ? null : $request->end_time,
            'reason' => $request->reason,
            'notes' => $request->notes,
        ]);

        return redirect()->route('schedule-exceptions.index')
            ->with('success', 'Pengecualian jadwal berhasil dibuat.');
    }

    /**
     * Display the specified schedule exception.
     */
    public function show($id)
    {
        $exception = ScheduleException::with('doctor')->findOrFail($id);

        return Inertia::render('Karyawan/DoctorSection/ScheduleException/Show', [
            'exception' => $exception
        ]);
    }

    /**
     * Show the form for editing the specified schedule exception.
     */
    public function edit($id)
    {
        $exception = ScheduleException::findOrFail($id);
        $doctors = Doctor::orderBy('name')->get();

        return Inertia::render('Karyawan/DoctorSection/ScheduleException/Edit', [
            'exception' => $exception,
            'doctors' => $doctors
        ]);
    }

    /**
     * Update the specified schedule exception in storage.
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'doctor_id' => 'required|exists:doctors,id',
            'exception_date_start' => 'required|date',
            'exception_date_end' => 'required|date|after_or_equal:exception_date_start',
            'is_full_day' => 'required|boolean',
            'start_time' => 'required_if:is_full_day,false|date_format:H:i|nullable',
            'end_time' => 'required_if:is_full_day,false|date_format:H:i|after:start_time|nullable',
            'reason' => 'required|string|max:100',
            'notes' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $exception = ScheduleException::findOrFail($id);

        // Don't allow changes to past exceptions
        if ($exception->exception_date_end < now()->format('Y-m-d')) {
            return redirect()->back()
                ->withErrors(['error' => 'Pengecualian jadwal yang sudah berlalu tidak dapat diubah.'])
                ->withInput();
        }

        // Check for overlapping exceptions for the same doctor (excluding current exception)
        $hasOverlap = $this->checkForOverlap(
            $request->doctor_id,
            $request->exception_date_start,
            $request->exception_date_end,
            $request->is_full_day,
            $request->start_time,
            $request->end_time,
            $id
        );

        if ($hasOverlap) {
            return redirect()->back()
                ->withErrors(['overlap' => 'Ada pengecualian jadwal lain yang tumpang tindih dengan periode ini.'])
                ->withInput();
        }

        // Update the exception
        $exception->update([
            'doctor_id' => $request->doctor_id,
            'exception_date_start' => $request->exception_date_start,
            'exception_date_end' => $request->exception_date_end,
            'is_full_day' => $request->is_full_day,
            'start_time' => $request->is_full_day ? null : $request->start_time,
            'end_time' => $request->is_full_day ? null : $request->end_time,
            'reason' => $request->reason,
            'notes' => $request->notes,
        ]);

        return redirect()->route('schedule-exceptions.index')
            ->with('success', 'Pengecualian jadwal berhasil diperbarui.');
    }

    /**
     * Remove the specified schedule exception from storage.
     */
    public function destroy($id)
    {
        $exception = ScheduleException::findOrFail($id);

        // Don't allow deletion of past exceptions
        if ($exception->exception_date_end < now()->format('Y-m-d')) {
            return redirect()->back()
                ->with('error', 'Pengecualian jadwal yang sudah berlalu tidak dapat dihapus.');
        }

        $exception->delete();

        return redirect()->route('schedule-exceptions.index')
            ->with('success', 'Pengecualian jadwal berhasil dihapus.');
    }

    /**
     * Check for overlapping exceptions
     */
    private function checkForOverlap($doctorId, $startDate, $endDate, $isFullDay, $startTime, $endTime, $exceptId = null)
    {
        $query = ScheduleException::where('doctor_id', $doctorId);

        // Exclude current exception if updating
        if ($exceptId) {
            $query->where('id', '!=', $exceptId);
        }

        // Check for date overlap
        $query->where(function ($q) use ($startDate, $endDate) {
            $q->whereBetween('exception_date_start', [$startDate, $endDate])
                ->orWhereBetween('exception_date_end', [$startDate, $endDate])
                ->orWhere(function ($subQ) use ($startDate, $endDate) {
                    $subQ->where('exception_date_start', '<=', $startDate)
                        ->where('exception_date_end', '>=', $endDate);
                });
        });

        // If this is a full-day exception, any overlapping date is a conflict
        if ($isFullDay) {
            return $query->exists();
        }

        // If this is a partial-day exception, check for time overlap with other partial-day exceptions
        return $query->where(function ($q) use ($isFullDay, $startTime, $endTime) {
            // Either the other exception is full-day
            $q->where('is_full_day', true)
                // Or there's a time overlap
                ->orWhere(function ($subQ) use ($startTime, $endTime) {
                    $subQ->where('is_full_day', false)
                        ->where(function ($timeQ) use ($startTime, $endTime) {
                            $timeQ->whereBetween('start_time', [$startTime, $endTime])
                                ->orWhereBetween('end_time', [$startTime, $endTime])
                                ->orWhere(function ($innerQ) use ($startTime, $endTime) {
                                    $innerQ->where('start_time', '<=', $startTime)
                                        ->where('end_time', '>=', $endTime);
                                });
                        });
                });
        })->exists();
    }

    /**
     * Get doctor's exceptions for a given date range
     */
    public function getDoctorExceptions(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'doctor_id' => 'required|exists:doctors,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
            ], 422);
        }

        $exceptions = ScheduleException::where('doctor_id', $request->doctor_id)
            ->where(function ($query) use ($request) {
                $query->whereBetween('exception_date_start', [$request->start_date, $request->end_date])
                    ->orWhereBetween('exception_date_end', [$request->start_date, $request->end_date])
                    ->orWhere(function ($q) use ($request) {
                        $q->where('exception_date_start', '<=', $request->start_date)
                            ->where('exception_date_end', '>=', $request->end_date);
                    });
            })
            ->get();

        return response()->json([
            'exceptions' => $exceptions
        ]);
    }

    /**
     * Get upcoming exceptions for a doctor
     */
    public function upcomingExceptions($doctorId)
    {
        $doctor = Doctor::findOrFail($doctorId);

        $exceptions = ScheduleException::where('doctor_id', $doctorId)
            ->where('exception_date_end', '>=', now()->format('Y-m-d'))
            ->orderBy('exception_date_start')
            ->get();

        return response()->json([
            'doctor' => $doctor->only(['id', 'name', 'specialization']),
            'exceptions' => $exceptions
        ]);
    }
}
