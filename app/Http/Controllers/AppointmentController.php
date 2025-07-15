<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Schedule;
use App\Models\ScheduleException;
use App\Models\ScheduleQuota;
use App\Models\Queue;
use App\Models\MedicalHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Log;

class AppointmentController extends Controller
{
    /**
     * Get available schedules for a doctor on a specific date
     */
    public function getAvailableSchedules(Request $request)
    {
        try {
            $request->validate([
                'doctor_id' => 'required|exists:doctors,id',
                'date' => 'required|date|after_or_equal:today',
            ]);

            $doctorId = $request->doctor_id;
            $date = $request->date;

            // Get the day of week for the selected date
            $dayOfWeek = date('w', strtotime($date));

            // Find schedules for this doctor on this day of week
            $schedules = Schedule::where('doctor_id', $doctorId)
                ->where('day_of_week', $dayOfWeek)
                ->where('status', true)
                ->get();

            // Check for schedule exceptions
            $exceptions = ScheduleException::where('doctor_id', $doctorId)
                ->where('exception_date_start', '<=', $date)
                ->where('exception_date_end', '>=', $date)
                ->get();

            // Filter out schedules that have exceptions
            $availableSchedules = $schedules->filter(function ($schedule) use ($exceptions, $date) {
                // Check if there's a full day exception
                $hasFullDayException = $exceptions->contains(function ($exception) {
                    return $exception->is_full_day;
                });

                if ($hasFullDayException) {
                    return false;
                }

                // Check for time-specific exceptions
                $hasTimeException = $exceptions->contains(function ($exception) use ($schedule) {
                    if ($exception->is_full_day) {
                        return true;
                    }

                    return $exception->affectsTimeSlot(
                        $exception->exception_date_start,
                        $schedule->start_time,
                        $schedule->end_time
                    );
                });

                if ($hasTimeException) {
                    return false;
                }

                // Check if quota is available
                $quota = $schedule->scheduleQuota;
                if (!$quota) {
                    return false;
                }

                $bookedAppointments = Appointment::where('doctor_id', $schedule->doctor_id)
                    ->where('schedule_id', $schedule->id)
                    ->whereDate('appointment_date', $date)
                    ->whereNotIn('status', [Appointment::STATUS_CANCELED, Appointment::STATUS_NO_SHOW])
                    ->count();

                return $bookedAppointments < $quota->quota;
            });

            // Add remaining quota to each schedule
            $availableSchedules = $availableSchedules->map(function ($schedule) use ($date) {
                $quota = $schedule->scheduleQuota;
                $bookedAppointments = Appointment::where('schedule_id', $schedule->id)
                    ->whereDate('appointment_date', $date)
                    ->whereNotIn('status', [Appointment::STATUS_CANCELED, Appointment::STATUS_NO_SHOW])
                    ->count();

                $schedule->remaining_quota = $quota ? ($quota->quota - $bookedAppointments) : 0;
                $schedule->day_name = $schedule->getDayNameAttribute();
                $schedule->formatted_time = $schedule->getFormattedTimeAttribute();

                return $schedule;
            });

            return response()->json([
                'schedules' => $availableSchedules,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Error getting available schedules: ' . $e->getMessage(),
            ], 500);
        }
    }


    /**
     * Display the specified appointment
     */
    public function show(Appointment $appointment)
    {
        try {
            // Memeriksa akses secara manual
            $user = Auth::user();

            if ($user->role === 'patient') {
                $patient = Patient::where('user_id', $user->id)->first();
                if (!$patient || $appointment->patient_id !== $patient->id) {
                    abort(403, 'Anda tidak memiliki izin untuk melihat janji temu ini.');
                }
            } elseif ($user->role === 'doctor') {
                $doctor = Doctor::where('user_id', $user->id)->first();
                if (!$doctor || $appointment->doctor_id !== $doctor->id) {
                    abort(403, 'Anda tidak memiliki izin untuk melihat janji temu ini.');
                }
            }
            // Role employee memiliki akses ke semua appointment

            // Load relationships
            $appointment->load(['patient', 'doctor', 'schedule', 'queue']);

            // Get patient details
            $patientData = $appointment->patient;

            // Get medical history if exists
            $medicalHistory = $patientData->medicalHistory;


            // Get blood types for dropdown
            $bloodTypes = MedicalHistory::BLOOD_TYPES;

            // Debug log
            Log::info('AppointmentController::show - Loading data for appointment', [
                'appointment_id' => $appointment->id,
                'has_medical_history' => (bool)$medicalHistory,
                'medical_history_id' => $medicalHistory ? $medicalHistory->id : null
            ]);

            // Check if user is doctor
            $isDoctorView = $user->role === 'doctor';

            if ($user->role === 'doctor') {
                $view = 'Dokter/Appointment/Show';
            } elseif ($user->role === 'karyawan') {
                $view = 'Karyawan/Appointment/Show';
            } elseif ($user->role === 'admin') {
                $view = 'Pasien/Appointment/Show';
            } else {
                // default view kalau role tidak dikenali
                $view = 'Pasien/Appointments/Show';
            }

            return Inertia::render($view, [
                'appointment' => $appointment,
                'patientData' => $patientData,
                'medicalHistory' => $medicalHistory,
                'bloodTypes' => $bloodTypes,
                'canCancel' => $appointment->canBeCanceled(),
                'canComplete' => $isDoctorView && $appointment->canBeCompleted(),
                'canMarkNoShow' => $appointment->canBeMarkedAsNoShow(),
            ]);
        } catch (Exception $e) {
            Log::error('AppointmentController::show - Error: ' . $e->getMessage(), [
                'appointment_id' => $appointment->id,
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('Error', [
                'message' => 'Error viewing appointment: ' . $e->getMessage(),
            ]);
        }
    }
    /**
     * Update the appointment status
     */
    public function updateStatus(Request $request, Appointment $appointment)
    {
        try {
            $request->validate([
                'status' => 'required|in:confirmed,completed,canceled,no_show',
            ]);

            $user = Auth::user();

            // Check permissions based on role and action
            if ($request->status === 'canceled') {
                // Patients can only cancel their own appointments
                if ($user->role === 'patient') {
                    $patient = Patient::where('user_id', $user->id)->first();
                    if (!$patient || $appointment->patient_id !== $patient->id) {
                        throw new Exception('You are not authorized to cancel this appointment.');
                    }
                }
            } else {
                // Only doctors, employees, and admins can update to other statuses
                if (!in_array($user->role, ['doctor', 'employee'])) {
                    throw new Exception('You are not authorized to update this appointment status.');
                }

                // Doctors can only update their own appointments
                if ($user->role === 'doctor') {
                    $doctor = Doctor::where('user_id', $user->id)->first();
                    if (!$doctor || $appointment->doctor_id !== $doctor->id) {
                        throw new Exception('You are not authorized to update this appointment.');
                    }
                }
            }

            DB::beginTransaction();

            // Update appointment status
            $appointment->status = $request->status;
            $appointment->save();

            // Update queue status accordingly
            if ($appointment->queue) {
                switch ($request->status) {
                    case 'confirmed':
                        $appointment->queue->status = Queue::STATUS_WAITING;
                        break;
                    case 'completed':
                        $appointment->queue->status = Queue::STATUS_COMPLETED;
                        break;
                    case 'canceled':
                        $appointment->queue->status = Queue::STATUS_CANCELED;
                        break;
                    case 'no_show':
                        $appointment->queue->status = Queue::STATUS_NO_SHOW;
                        break;
                }
                $appointment->queue->save();
            }




            DB::commit();

            // Determine redirect based on user role
            $redirectRoute = 'appointments.show';
            if ($user->role === 'doctor') {
                $redirectRoute = 'doctor.appointments.show';
            } elseif ($user->role === 'employee') {
                $redirectRoute = 'employee.appointments.show';
            }

            return redirect()->route($redirectRoute, $appointment->id)
                ->with('success', 'Appointment status updated successfully.');
        } catch (Exception $e) {
            DB::rollBack();

            return redirect()->back()->with('error', 'Error updating appointment status: ' . $e->getMessage());
        }
    }
}
