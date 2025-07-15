<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Schedule;
use App\Models\ScheduleException;
use App\Models\ScheduleQuota;
use App\Models\Queue;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Carbon\Carbon;
use Exception;

class PatientAppointmentController extends Controller
{
    /**
     * Display a listing of the patient's appointments
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();

            // Find the patient record associated with this user
            $patient = Patient::where('user_id', $user->id)->first();

            // Check if patient record exists
            if (!$patient) {
                return Inertia::render('Error', [
                    'status' => 400,
                    'message' => 'Your patient profile is not set up properly. Please contact support.',
                ]);
            }

            // Start query with eager loading relationships
            $query = Appointment::with(['patient', 'doctor', 'schedule', 'queue'])
                ->where('patient_id', $patient->id);

            // Apply date filter if provided
            if ($request->has('date')) {
                $query->whereDate('appointment_date', $request->date);
            }

            // Apply status filter if provided
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Get paginated data
            $appointments = $query->orderBy('appointment_date', 'desc')
                ->orderBy('appointment_time', 'asc')
                ->paginate(10)
                ->withQueryString();

            return Inertia::render('Pasien/Appointments/Index', [
                'appointments' => $appointments,
                'filters' => $request->only(['date', 'status']),
            ]);
        } catch (Exception $e) {
            Log::error('PatientAppointmentController::index - Error: ' . $e->getMessage());

            return Inertia::render('Error', [
                'status' => 500,
                'message' => 'Error loading appointments: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Show the form for creating a new appointment
     */
    public function create()
    {
        try {
            $user = Auth::user();

            // Get patient record
            $patient = Patient::where('user_id', $user->id)->first();

            if (!$patient) {
                return Inertia::render('Error', [
                    'status' => 400,
                    'message' => 'Your patient profile is not set up properly. Please contact support.',
                ]);
            }

            return Inertia::render('Pasien/Appointments/Create', [
                'patient' => $patient,
            ]);
        } catch (Exception $e) {
            Log::error('PatientAppointmentController::create - Error: ' . $e->getMessage());

            return Inertia::render('Error', [
                'message' => 'Error loading appointment form: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Store a newly created appointment for patient
     */
    public function store(Request $request)
    {
        try {
            Log::info('PatientAppointmentController::store - Starting appointment creation', [
                'request_data' => $request->all(),
                'user_id' => Auth::id()
            ]);

            // Enhanced validation
            $validator = Validator::make($request->all(), [
                'doctor_id' => 'required|exists:doctors,id',
                'schedule_id' => 'required|exists:schedules,id',
                'appointment_date' => 'required|date|after_or_equal:today',
                'chief_complaint' => 'required|string|max:1000',
                'notes' => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                Log::error('PatientAppointmentController::store - Validation failed', [
                    'errors' => $validator->errors()->toArray(),
                    'request_data' => $request->all()
                ]);

                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput()
                    ->with('error', 'Data yang dimasukkan tidak valid. Silakan periksa kembali.');
            }

            Log::info('PatientAppointmentController::store - Validation passed');

            $user = Auth::user();

            // Get patient record
            $patient = Patient::where('user_id', $user->id)->first();
            if (!$patient) {
                Log::error('Patient profile not found', ['user_id' => $user->id]);
                return redirect()->back()
                    ->with('error', 'Profil pasien tidak ditemukan.')
                    ->withInput();
            }

            // Verify doctor exists
            $doctor = Doctor::find($request->doctor_id);
            if (!$doctor) {
                Log::error('Doctor not found', ['doctor_id' => $request->doctor_id]);
                return redirect()->back()
                    ->with('error', 'Dokter tidak ditemukan.')
                    ->withInput();
            }

            // Get and verify the selected schedule
            $schedule = Schedule::with('scheduleQuota')->find($request->schedule_id);
            if (!$schedule) {
                Log::error('Schedule not found', ['schedule_id' => $request->schedule_id]);
                return redirect()->back()
                    ->with('error', 'Jadwal tidak ditemukan.')
                    ->withInput();
            }

            // Verify doctor and schedule match
            if ($schedule->doctor_id != $request->doctor_id) {
                Log::error('Doctor and schedule mismatch', [
                    'schedule_doctor_id' => $schedule->doctor_id,
                    'request_doctor_id' => $request->doctor_id
                ]);
                return redirect()->back()
                    ->with('error', 'Jadwal yang dipilih tidak sesuai dengan dokter.')
                    ->withInput();
            }

            Log::info('PatientAppointmentController::store - Initial validation completed', [
                'schedule_id' => $schedule->id,
                'doctor_id' => $schedule->doctor_id,
                'patient_id' => $patient->id
            ]);

            // Check if this doctor is available on the selected date
            $isAvailable = $this->isDoctorAvailable($request->doctor_id, $request->schedule_id, $request->appointment_date);

            if (!$isAvailable) {
                Log::warning('Doctor not available', [
                    'doctor_id' => $request->doctor_id,
                    'schedule_id' => $request->schedule_id,
                    'date' => $request->appointment_date
                ]);
                return redirect()->back()
                    ->with('error', 'Dokter tidak tersedia pada jadwal yang dipilih atau kuota sudah penuh.')
                    ->withInput();
            }

            // Start database transaction
            DB::beginTransaction();

            try {
                // Generate queue number
                $queueNumber = $this->generateQueueNumber($request->appointment_date, $request->schedule_id);

                Log::info('PatientAppointmentController::store - Queue number generated', [
                    'queue_number' => $queueNumber
                ]);

                // Create the queue first
                $queue = Queue::create([
                    'patient_id' => $patient->id,
                    'doctor_id' => $request->doctor_id,
                    'schedule_id' => $request->schedule_id,
                    'appointment_date' => $request->appointment_date,
                    'queue_number' => $queueNumber,
                    'status' => 'waiting', // Queue::STATUS_WAITING
                    'is_active' => true,
                ]);

                Log::info('PatientAppointmentController::store - Queue created successfully', [
                    'queue_id' => $queue->id,
                    'queue_number' => $queue->queue_number
                ]);

                // Create the appointment
                $appointment = Appointment::create([
                    'patient_id' => $patient->id,
                    'doctor_id' => $request->doctor_id,
                    'schedule_id' => $request->schedule_id,
                    'queue_id' => $queue->id,
                    'created_by_user_id' => $user->id,
                    'appointment_date' => $request->appointment_date,
                    'appointment_time' => $schedule->start_time,
                    'status' => 'scheduled', // Appointment::STATUS_SCHEDULED
                    'chief_complaint' => $request->chief_complaint,
                    'notes' => $request->notes ?? null,
                ]);

                Log::info('PatientAppointmentController::store - Appointment created successfully', [
                    'appointment_id' => $appointment->id,
                    'appointment_date' => $appointment->appointment_date,
                    'appointment_time' => $appointment->appointment_time
                ]);


                // Commit the transaction
                DB::commit();

                Log::info('PatientAppointmentController::store - Transaction committed successfully', [
                    'appointment_id' => $appointment->id,
                    'queue_id' => $queue->id
                ]);

                // Redirect to patient appointment show page
                return redirect()->route('patient.appointments.show', $appointment->id)
                    ->with('success', 'Janji temu berhasil dibuat untuk tanggal ' . Carbon::parse($request->appointment_date)->format('d/m/Y') . ' jam ' . $schedule->start_time . '. Nomor antrian: ' . $queueNumber . '.');
            } catch (Exception $e) {
                DB::rollBack();

                Log::error('PatientAppointmentController::store - Database transaction failed', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'request_data' => $request->all()
                ]);

                return redirect()->back()
                    ->with('error', 'Terjadi kesalahan saat menyimpan data: ' . $e->getMessage())
                    ->withInput();
            }
        } catch (Exception $e) {
            Log::error('PatientAppointmentController::store - General error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Get available doctors for a specific date (Patient API)
     */
    public function getAvailableDoctors(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'date' => 'required|date_format:Y-m-d|after_or_equal:today',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                ], 422);
            }

            $selectedDate = Carbon::parse($request->date);
            $dayOfWeek = $selectedDate->dayOfWeek;

            Log::info('PatientAppointmentController::getAvailableDoctors', [
                'date' => $selectedDate->format('Y-m-d'),
                'day_of_week' => $dayOfWeek
            ]);

            // Get doctors who have schedules for this day
            $doctorsWithSchedules = Doctor::whereHas('schedules', function ($query) use ($dayOfWeek) {
                $query->where('day_of_week', $dayOfWeek)
                    ->where('status', true);
            })
                ->where(function ($query) use ($selectedDate) {
                    // Only active doctors with valid licenses
                    $query->whereNull('license_expiry_date')
                        ->orWhere('license_expiry_date', '>=', $selectedDate->format('Y-m-d'));
                })
                ->get();

            // Filter out doctors who have full-day exceptions on this date
            $availableDoctors = $doctorsWithSchedules->filter(function ($doctor) use ($selectedDate) {
                $hasFullDayException = ScheduleException::where('doctor_id', $doctor->id)
                    ->where('exception_date_start', '<=', $selectedDate->format('Y-m-d'))
                    ->where('exception_date_end', '>=', $selectedDate->format('Y-m-d'))
                    ->where('is_full_day', true)
                    ->exists();

                return !$hasFullDayException;
            });

            // Transform the data and count available schedules
            $doctors = $availableDoctors->map(function ($doctor) use ($selectedDate, $dayOfWeek) {
                // Count available schedules manually by checking each schedule
                $schedules = Schedule::where('doctor_id', $doctor->id)
                    ->where('day_of_week', $dayOfWeek)
                    ->where('status', true)
                    ->get();

                $availableSchedulesCount = 0;

                foreach ($schedules as $schedule) {
                    // Check if this schedule has exceptions on the selected date
                    $hasException = ScheduleException::where('doctor_id', $doctor->id)
                        ->where('exception_date_start', '<=', $selectedDate->format('Y-m-d'))
                        ->where('exception_date_end', '>=', $selectedDate->format('Y-m-d'))
                        ->where(function ($query) use ($schedule) {
                            $query->where('is_full_day', true)
                                ->orWhere(function ($timeQuery) use ($schedule) {
                                    $timeQuery->where('is_full_day', false)
                                        ->where(function ($overlapQuery) use ($schedule) {
                                            $overlapQuery->where(function ($q) use ($schedule) {
                                                $q->whereBetween('start_time', [$schedule->start_time, $schedule->end_time])
                                                    ->orWhereBetween('end_time', [$schedule->start_time, $schedule->end_time]);
                                            })
                                                ->orWhere(function ($containsQuery) use ($schedule) {
                                                    $containsQuery->where('start_time', '<=', $schedule->start_time)
                                                        ->where('end_time', '>=', $schedule->end_time);
                                                });
                                        });
                                });
                        })
                        ->exists();

                    if (!$hasException) {
                        // Check quota availability
                        $totalQuota = $schedule->scheduleQuota ? $schedule->scheduleQuota->quota : 10;
                        $bookedAppointments = Queue::where('schedule_id', $schedule->id)
                            ->whereDate('appointment_date', $selectedDate->format('Y-m-d'))
                            ->count();

                        if ($bookedAppointments < $totalQuota) {
                            $availableSchedulesCount++;
                        }
                    }
                }

                return [
                    'id' => $doctor->id,
                    'name' => $doctor->name,
                    'specialization' => $doctor->specialization ?? 'General',
                    'available_schedules_count' => $availableSchedulesCount,
                ];
            })->filter(function ($doctor) {
                return $doctor['available_schedules_count'] > 0;
            })->values();

            Log::info('PatientAppointmentController::getAvailableDoctors - Result', [
                'doctors_count' => $doctors->count()
            ]);

            return response()->json([
                'success' => true,
                'date' => $selectedDate->format('Y-m-d'),
                'day_name' => $this->getDayName($dayOfWeek),
                'doctors' => $doctors,
            ]);
        } catch (Exception $e) {
            Log::error('PatientAppointmentController::getAvailableDoctors - Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error retrieving available doctors: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get available schedules for a specific doctor and date (Patient API)
     */
    public function getAvailableSchedules(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'date' => 'required|date_format:Y-m-d|after_or_equal:today',
                'doctor_id' => 'required|exists:doctors,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                ], 422);
            }

            $selectedDate = Carbon::parse($request->date);
            $dayOfWeek = $selectedDate->dayOfWeek;
            $doctorId = $request->doctor_id;

            // Get doctor info
            $doctor = Doctor::findOrFail($doctorId);

            // Verify doctor is available (license check)
            if ($doctor->license_expiry_date && $doctor->license_expiry_date < $selectedDate->format('Y-m-d')) {
                return response()->json([
                    'success' => true,
                    'date' => $selectedDate->format('Y-m-d'),
                    'day_name' => $this->getDayName($dayOfWeek),
                    'doctor' => [
                        'id' => $doctor->id,
                        'name' => $doctor->name,
                        'specialization' => $doctor->specialization ?? 'General',
                    ],
                    'schedules' => [],
                    'message' => 'Dokter ini tidak tersedia karena lisensi telah berakhir.',
                ]);
            }

            // Get active schedules for this doctor on this day
            $availableSchedules = Schedule::with(['scheduleQuota'])
                ->where('doctor_id', $doctorId)
                ->where('day_of_week', $dayOfWeek)
                ->where('status', true)
                ->get();

            // Filter out schedules that have exceptions on this date
            $filteredSchedules = $availableSchedules->filter(function ($schedule) use ($selectedDate) {
                $hasException = ScheduleException::where('doctor_id', $schedule->doctor_id)
                    ->where('exception_date_start', '<=', $selectedDate->format('Y-m-d'))
                    ->where('exception_date_end', '>=', $selectedDate->format('Y-m-d'))
                    ->where(function ($query) use ($schedule) {
                        $query->where('is_full_day', true)
                            ->orWhere(function ($timeQuery) use ($schedule) {
                                $timeQuery->where('is_full_day', false)
                                    ->where(function ($overlapQuery) use ($schedule) {
                                        $overlapQuery->where(function ($q) use ($schedule) {
                                            $q->whereBetween('start_time', [$schedule->start_time, $schedule->end_time])
                                                ->orWhereBetween('end_time', [$schedule->start_time, $schedule->end_time]);
                                        })
                                            ->orWhere(function ($containsQuery) use ($schedule) {
                                                $containsQuery->where('start_time', '<=', $schedule->start_time)
                                                    ->where('end_time', '>=', $schedule->end_time);
                                            });
                                    });
                            });
                    })
                    ->exists();

                return !$hasException;
            });

            // For each available schedule, check booked appointments and calculate remaining quota
            $schedulesWithQuota = $filteredSchedules->map(function ($schedule) use ($selectedDate) {
                $totalQuota = $schedule->scheduleQuota ? $schedule->scheduleQuota->quota : 10;

                // Count existing appointments for this schedule on the selected date
                $bookedAppointments = Queue::where('schedule_id', $schedule->id)
                    ->whereDate('appointment_date', $selectedDate->format('Y-m-d'))
                    ->count();

                $remainingQuota = $totalQuota - $bookedAppointments;

                return [
                    'id' => $schedule->id,
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'formatted_time' => $schedule->start_time . ' - ' . $schedule->end_time,
                    'total_quota' => $totalQuota,
                    'remaining_quota' => max(0, $remainingQuota),
                    'is_available' => $remainingQuota > 0,
                    'notes' => $schedule->notes,
                ];
            });

            // Filter out schedules with no remaining quota
            $availableSchedulesWithQuota = $schedulesWithQuota->filter(function ($schedule) {
                return $schedule['is_available'];
            })->values();

            return response()->json([
                'success' => true,
                'date' => $selectedDate->format('Y-m-d'),
                'day_name' => $this->getDayName($dayOfWeek),
                'doctor' => [
                    'id' => $doctor->id,
                    'name' => $doctor->name,
                    'specialization' => $doctor->specialization ?? 'General',
                ],
                'schedules' => $availableSchedulesWithQuota,
            ]);
        } catch (Exception $e) {
            Log::error('PatientAppointmentController::getAvailableSchedules - Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error retrieving available schedules: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check if doctor is available (simplified version)
     */
    private function isDoctorAvailable($doctorId, $scheduleId, $appointmentDate)
    {
        try {
            // Get the schedule
            $schedule = Schedule::with('scheduleQuota')->find($scheduleId);
            if (!$schedule) {
                return false;
            }

            // Check if schedule belongs to doctor
            if ($schedule->doctor_id != $doctorId) {
                return false;
            }

            // Check if schedule is active
            if (!$schedule->status) {
                return false;
            }

            // Get the day of week for the selected date
            $dayOfWeek = Carbon::parse($appointmentDate)->dayOfWeek;

            // Check if schedule matches the day of week
            if ($schedule->day_of_week != $dayOfWeek) {
                return false;
            }

            // Check for schedule exceptions
            $hasException = ScheduleException::where('doctor_id', $doctorId)
                ->where('exception_date_start', '<=', $appointmentDate)
                ->where('exception_date_end', '>=', $appointmentDate)
                ->exists();

            if ($hasException) {
                return false;
            }

            // Check quota availability
            $maxQuota = $schedule->scheduleQuota ? $schedule->scheduleQuota->quota : 10;

            // Count existing appointments for this schedule and date
            $bookedAppointments = Queue::where('schedule_id', $scheduleId)
                ->whereDate('appointment_date', $appointmentDate)
                ->count();

            return $bookedAppointments < $maxQuota;
        } catch (Exception $e) {
            Log::error('Error checking doctor availability', [
                'doctor_id' => $doctorId,
                'schedule_id' => $scheduleId,
                'date' => $appointmentDate,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Generate queue number
     */
    private function generateQueueNumber($date, $scheduleId)
    {
        try {
            $lastQueue = Queue::whereDate('appointment_date', $date)
                ->where('schedule_id', $scheduleId)
                ->orderBy('queue_number', 'desc')
                ->first();

            if ($lastQueue) {
                return $lastQueue->queue_number + 1;
            }

            return 1;
        } catch (Exception $e) {
            Log::error('Error generating queue number', [
                'date' => $date,
                'schedule_id' => $scheduleId,
                'error' => $e->getMessage()
            ]);
            return 1; // Default to 1 if error
        }
    }

    /**
     * Helper method to get Indonesian day name
     */
    private function getDayName($dayOfWeek)
    {
        $days = [
            0 => 'Minggu',
            1 => 'Senin',
            2 => 'Selasa',
            3 => 'Rabu',
            4 => 'Kamis',
            5 => 'Jumat',
            6 => 'Sabtu',
        ];

        return $days[$dayOfWeek] ?? '';
    }
}
