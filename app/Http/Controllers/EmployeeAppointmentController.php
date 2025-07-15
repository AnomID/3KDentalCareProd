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

class EmployeeAppointmentController extends Controller
{
    /**
     * Display a listing of all appointments
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            $perPage = $request->get('per_page', 10); // Default to 10 items per page

            // Build the query based on user role
            $query = Appointment::with(['patient.user', 'doctor', 'schedule', 'queue'])
                ->select('appointments.*');

            // Apply role-based filtering
            if ($user->role === 'patient') {
                $patient = Patient::where('user_id', $user->id)->first();
                if ($patient) {
                    $query->where('patient_id', $patient->id);
                }
            } elseif ($user->role === 'doctor') {
                $doctor = Doctor::where('user_id', $user->id)->first();
                if ($doctor) {
                    $query->where('doctor_id', $doctor->id);
                }
            }
            // Employee and admin can see all appointments

            // Search functionality - Fixed
            if ($request->filled('search')) {
                $searchTerm = $request->search;
                $query->where(function ($q) use ($searchTerm) {
                    $q->whereHas('patient', function ($patientQuery) use ($searchTerm) {
                        $patientQuery->where('name', 'like', "%{$searchTerm}%")
                            ->orWhere('no_rm', 'like', "%{$searchTerm}%")
                            ->orWhere('phone', 'like', "%{$searchTerm}%")
                            // Fixed: Search email through user relation instead of direct email column
                            ->orWhereHas('user', function ($userQuery) use ($searchTerm) {
                                $userQuery->where('email', 'like', "%{$searchTerm}%");
                            });
                    })
                        ->orWhereHas('doctor', function ($doctorQuery) use ($searchTerm) {
                            $doctorQuery->where('name', 'like', "%{$searchTerm}%")
                                ->orWhere('specialization', 'like', "%{$searchTerm}%");
                        })
                        // Fixed: Remove appointment_number search since it doesn't exist in appointments table
                        // ->orWhere('appointment_number', 'like', "%{$searchTerm}%")
                        ->orWhere('notes', 'like', "%{$searchTerm}%")
                        ->orWhere('chief_complaint', 'like', "%{$searchTerm}%");
                });
            }

            // Date range filtering
            if ($request->filled('date_from')) {
                $query->whereDate('appointment_date', '>=', $request->date_from);
            }

            if ($request->filled('date_to')) {
                $query->whereDate('appointment_date', '<=', $request->date_to);
            }

            // Single date filtering (for backward compatibility)
            if ($request->filled('date') && !$request->filled('date_from') && !$request->filled('date_to')) {
                $query->whereDate('appointment_date', $request->date);
            }

            // Status filtering
            if ($request->filled('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Doctor filtering
            if ($request->filled('doctor_id') && $request->doctor_id !== 'all') {
                $query->where('doctor_id', $request->doctor_id);
            }

            // Time period filtering
            if ($request->filled('period')) {
                switch ($request->period) {
                    case 'today':
                        $query->whereDate('appointment_date', today());
                        break;
                    case 'tomorrow':
                        $query->whereDate('appointment_date', today()->addDay());
                        break;
                    case 'this_week':
                        $query->whereBetween('appointment_date', [
                            now()->startOfWeek(),
                            now()->endOfWeek()
                        ]);
                        break;
                    case 'next_week':
                        $query->whereBetween('appointment_date', [
                            now()->addWeek()->startOfWeek(),
                            now()->addWeek()->endOfWeek()
                        ]);
                        break;
                    case 'this_month':
                        $query->whereMonth('appointment_date', now()->month)
                            ->whereYear('appointment_date', now()->year);
                        break;
                }
            }

            // Enhanced Sorting
            $sortField = $request->get('sort', 'appointment_date');
            $sortDirection = $request->get('direction', 'desc');

            // Validate sort fields
            $allowedSortFields = [
                'appointment_date',
                'appointment_time',
                'status',
                'created_at',
                'patient_name',
                'doctor_name'
            ];

            if (in_array($sortField, $allowedSortFields)) {
                if ($sortField === 'patient_name') {
                    $query->join('patients', 'appointments.patient_id', '=', 'patients.id')
                        ->orderBy('patients.name', $sortDirection)
                        ->select('appointments.*');
                } elseif ($sortField === 'doctor_name') {
                    $query->join('doctors', 'appointments.doctor_id', '=', 'doctors.id')
                        ->orderBy('doctors.name', $sortDirection)
                        ->select('appointments.*');
                } else {
                    $query->orderBy($sortField, $sortDirection);
                }
            } else {
                // Default sorting
                $query->orderBy('appointment_date', 'desc')
                    ->orderBy('appointment_time', 'asc');
            }

            // Get paginated results
            $appointments = $query->paginate($perPage)->withQueryString();

            // Generate statistics
            $statistics = $this->generateStatistics($request);

            // Get filter options
            $filterOptions = $this->getFilterOptions($user);

            return Inertia::render('Karyawan/Appointment/Index', [
                'appointments' => $appointments,
                'statistics' => $statistics,
                'filterOptions' => $filterOptions,
                'filters' => [
                    'search' => $request->search,
                    'date_from' => $request->date_from,
                    'date_to' => $request->date_to,
                    'date' => $request->date,
                    'status' => $request->status ?? 'all',
                    'doctor_id' => $request->doctor_id ?? 'all',
                    'period' => $request->period,
                    'per_page' => $perPage,
                ],
                'sorting' => [
                    'field' => $sortField,
                    'direction' => $sortDirection,
                ],
            ]);
        } catch (Exception $e) {
            Log::error('EmployeeAppointmentController::index - Error: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('Error', [
                'message' => 'Error loading appointments: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Generate appointment statistics
     */
    private function generateStatistics(Request $request)
    {
        $user = Auth::user();
        $baseQuery = Appointment::query();

        // Apply role-based filtering for statistics
        if ($user->role === 'patient') {
            $patient = Patient::where('user_id', $user->id)->first();
            if ($patient) {
                $baseQuery->where('patient_id', $patient->id);
            }
        } elseif ($user->role === 'doctor') {
            $doctor = Doctor::where('user_id', $user->id)->first();
            if ($doctor) {
                $baseQuery->where('doctor_id', $doctor->id);
            }
        }

        // Apply same filters as main query for relevant statistics
        if ($request->filled('date_from')) {
            $baseQuery->whereDate('appointment_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $baseQuery->whereDate('appointment_date', '<=', $request->date_to);
        }

        if ($request->filled('doctor_id') && $request->doctor_id !== 'all') {
            $baseQuery->where('doctor_id', $request->doctor_id);
        }

        // Get today's statistics
        $todayQuery = (clone $baseQuery)->whereDate('appointment_date', today());

        // Get this week's statistics
        $thisWeekQuery = (clone $baseQuery)->whereBetween('appointment_date', [
            now()->startOfWeek(),
            now()->endOfWeek()
        ]);

        return [
            // Overall statistics (based on current filters)
            'total' => (clone $baseQuery)->count(),
            'scheduled' => (clone $baseQuery)->where('status', 'scheduled')->count(),
            'confirmed' => (clone $baseQuery)->where('status', 'confirmed')->count(),
            'completed' => (clone $baseQuery)->where('status', 'completed')->count(),
            'canceled' => (clone $baseQuery)->where('status', 'canceled')->count(),
            'no_show' => (clone $baseQuery)->where('status', 'no_show')->count(),

            // Today's statistics
            'today' => [
                'total' => $todayQuery->count(),
                'scheduled' => (clone $todayQuery)->where('status', 'scheduled')->count(),
                'confirmed' => (clone $todayQuery)->where('status', 'confirmed')->count(),
                'completed' => (clone $todayQuery)->where('status', 'completed')->count(),
                'canceled' => (clone $todayQuery)->where('status', 'canceled')->count(),
                'no_show' => (clone $todayQuery)->where('status', 'no_show')->count(),
            ],

            // This week statistics
            'this_week' => [
                'total' => $thisWeekQuery->count(),
                'completed' => (clone $thisWeekQuery)->where('status', 'completed')->count(),
                'scheduled' => (clone $thisWeekQuery)->where('status', 'scheduled')->count(),
                'confirmed' => (clone $thisWeekQuery)->where('status', 'confirmed')->count(),
            ],

            // Completion rate
            'completion_rate' => $this->calculateCompletionRate($baseQuery),

            // Average appointments per day (last 30 days)
            'avg_per_day' => $this->calculateAveragePerDay($baseQuery),

            // Additional useful metrics
            'pending_today' => (clone $todayQuery)->whereIn('status', ['scheduled', 'confirmed'])->count(),
            'upcoming_this_week' => (clone $thisWeekQuery)->whereIn('status', ['scheduled', 'confirmed'])->count(),
        ];
    }

    /**
     * Calculate completion rate
     */
    private function calculateCompletionRate($baseQuery)
    {
        $totalFinished = (clone $baseQuery)->whereIn('status', ['completed', 'canceled', 'no_show'])->count();
        $completed = (clone $baseQuery)->where('status', 'completed')->count();

        if ($totalFinished === 0) {
            return 0;
        }

        return round(($completed / $totalFinished) * 100, 1);
    }

    /**
     * Calculate average appointments per day
     */
    private function calculateAveragePerDay($baseQuery)
    {
        $thirtyDaysAgo = now()->subDays(30);
        $appointmentsLast30Days = (clone $baseQuery)->where('appointment_date', '>=', $thirtyDaysAgo)->count();

        return round($appointmentsLast30Days / 30, 1);
    }

    /**
     * Get filter options for dropdowns
     */
    private function getFilterOptions($user)
    {
        $options = [
            'statuses' => [
                ['value' => 'all', 'label' => 'All Status'],
                ['value' => 'scheduled', 'label' => 'Scheduled'],
                ['value' => 'confirmed', 'label' => 'Confirmed'],
                ['value' => 'completed', 'label' => 'Completed'],
                ['value' => 'canceled', 'label' => 'Canceled'],
                ['value' => 'no_show', 'label' => 'No Show'],
            ],
            'periods' => [
                ['value' => '', 'label' => 'All Time'],
                ['value' => 'today', 'label' => 'Today'],
                ['value' => 'tomorrow', 'label' => 'Tomorrow'],
                ['value' => 'this_week', 'label' => 'This Week'],
                ['value' => 'next_week', 'label' => 'Next Week'],
                ['value' => 'this_month', 'label' => 'This Month'],
            ],
            'per_page_options' => [10, 15, 25, 50, 100],
        ];

        // Get doctors for dropdown (only for non-doctor users)
        if ($user->role !== 'doctor') {
            $doctors = Doctor::select('id', 'name', 'specialization')
                ->orderBy('name')
                ->get()
                ->map(function ($doctor) {
                    return [
                        'value' => $doctor->id,
                        'label' => "dr. {$doctor->name}" . ($doctor->specialization ? " - {$doctor->specialization}" : '')
                    ];
                });

            $options['doctors'] = collect([['value' => 'all', 'label' => 'All Doctors']])
                ->concat($doctors)
                ->toArray();
        }

        return $options;
    }
    /**
     * Display today's appointments
     */
    public function today(Request $request)
    {
        try {
            // Start query with eager loading relationships
            $query = Appointment::with(['patient', 'doctor', 'schedule'])
                ->whereDate('appointment_date', Carbon::today());

            // Apply status filter if provided
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Get paginated data
            $appointments = $query->orderBy('appointment_time', 'asc')
                ->paginate(10)
                ->withQueryString();

            return Inertia::render('Karyawan/Appointment/Today', [
                'appointments' => $appointments,
                'filters' => $request->only(['status']),
                'today' => Carbon::today()->format('Y-m-d'),
            ]);
        } catch (Exception $e) {
            Log::error('EmployeeAppointmentController::today - Error: ' . $e->getMessage());

            return Inertia::render('Error', [
                'status' => 500,
                'message' => 'Error loading today\'s appointments: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Show the form for creating a new appointment for a patient
     */
    public function createForPatient()
    {
        try {
            // Get list of patients
            $patients = Patient::orderBy('name')->get();

            return Inertia::render('Karyawan/Appointment/Create', [
                'patients' => $patients,
            ]);
        } catch (Exception $e) {
            Log::error('EmployeeAppointmentController::createForPatient - Error: ' . $e->getMessage());

            return Inertia::render('Error', [
                'message' => 'Error loading form: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Store a newly created appointment
     */
    public function store(Request $request)
    {
        try {
            Log::info('EmployeeAppointmentController::store - Starting appointment creation', [
                'request_data' => $request->all(),
                'user_id' => Auth::id(),
                'timestamp' => now()
            ]);

            // Enhanced validation
            $validator = Validator::make($request->all(), [
                'patient_id' => 'required|exists:patients,id',
                'doctor_id' => 'required|exists:doctors,id',
                'schedule_id' => 'required|exists:schedules,id',
                'appointment_date' => 'required|date|after_or_equal:today',
                'chief_complaint' => 'required|string|max:1000',
                'notes' => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                Log::error('EmployeeAppointmentController::store - Validation failed', [
                    'errors' => $validator->errors()->toArray(),
                    'request_data' => $request->all()
                ]);

                return redirect()->back()
                    ->withErrors($validator)
                    ->withInput()
                    ->with('error', 'Data yang dimasukkan tidak valid. Silakan periksa kembali.');
            }

            Log::info('EmployeeAppointmentController::store - Validation passed');

            $user = Auth::user();

            // Verify patient exists
            $patient = Patient::find($request->patient_id);
            if (!$patient) {
                Log::error('Patient not found', ['patient_id' => $request->patient_id]);
                return redirect()->back()
                    ->with('error', 'Pasien tidak ditemukan.')
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

            Log::info('EmployeeAppointmentController::store - Initial validation completed', [
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

                Log::info('EmployeeAppointmentController::store - Queue number generated', [
                    'queue_number' => $queueNumber
                ]);

                // Create the queue first
                $queue = Queue::create([
                    'patient_id' => $request->patient_id,
                    'doctor_id' => $request->doctor_id,
                    'schedule_id' => $request->schedule_id,
                    'appointment_date' => $request->appointment_date,
                    'queue_number' => $queueNumber,
                    'status' => 'waiting', // Queue::STATUS_WAITING
                    'is_active' => true,
                ]);

                Log::info('EmployeeAppointmentController::store - Queue created successfully', [
                    'queue_id' => $queue->id,
                    'queue_number' => $queue->queue_number
                ]);

                // Create the appointment
                $appointment = Appointment::create([
                    'patient_id' => $request->patient_id,
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

                Log::info('EmployeeAppointmentController::store - Appointment created successfully', [
                    'appointment_id' => $appointment->id,
                    'appointment_date' => $appointment->appointment_date,
                    'appointment_time' => $appointment->appointment_time
                ]);


                // Commit the transaction
                DB::commit();

                Log::info('EmployeeAppointmentController::store - Transaction committed successfully', [
                    'appointment_id' => $appointment->id,
                    'queue_id' => $queue->id
                ]);

                // Redirect to employee appointment show page
                return redirect()->route('employee.appointments.show', $appointment->id)
                    ->with('success', 'Janji temu berhasil dibuat untuk ' . $patient->name . ' pada tanggal ' . Carbon::parse($request->appointment_date)->format('d/m/Y') . ' jam ' . $schedule->start_time . '. Nomor antrian: ' . $queueNumber . '.');
            } catch (Exception $e) {
                DB::rollBack();

                Log::error('EmployeeAppointmentController::store - Database transaction failed', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'request_data' => $request->all()
                ]);

                return redirect()->back()
                    ->with('error', 'Terjadi kesalahan saat menyimpan data: ' . $e->getMessage())
                    ->withInput();
            }
        } catch (Exception $e) {
            Log::error('EmployeeAppointmentController::store - General error', [
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
     * Display the specified appointment for employee
     */
    // public function show($id)
    // {
    //     try {
    //         $appointment = Appointment::with([
    //             'patient',
    //             'doctor',
    //             'schedule.scheduleQuota',
    //             'queue',
    //             'createdBy',
    //         ])->findOrFail($id);

    //         // Determine what actions are available
    //         $canCancel = $appointment->canBeCanceled();
    //         $canComplete = $appointment->canBeCompleted();
    //         $canMarkNoShow = $appointment->canBeMarkedAsNoShow();

    //         Log::info('EmployeeAppointmentController::show - Loading appointment', [
    //             'appointment_id' => $appointment->id,
    //             'patient' => $appointment->patient->name,
    //             'doctor' => $appointment->doctor->name,
    //             'status' => $appointment->status
    //         ]);

    //         return Inertia::render('Karyawan/Appointment/Show', [
    //             'appointment' => $appointment,
    //             'canCancel' => $canCancel,
    //             'canComplete' => $canComplete,
    //             'canMarkNoShow' => $canMarkNoShow,
    //         ]);
    //     } catch (Exception $e) {
    //         Log::error('EmployeeAppointmentController::show - Error: ' . $e->getMessage());

    //         return redirect()->route('employee.appointments.index')
    //             ->with('error', 'Appointment tidak ditemukan.');
    //     }
    // }

    /**
     * Update appointment status
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $appointment = Appointment::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'status' => 'required|in:scheduled,confirmed,completed,canceled,no_show',
            ]);

            if ($validator->fails()) {
                return redirect()->back()
                    ->with('error', 'Status tidak valid.');
            }

            $oldStatus = $appointment->status;
            $newStatus = $request->status;

            Log::info('EmployeeAppointmentController::updateStatus - Updating status', [
                'appointment_id' => $appointment->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'updated_by' => Auth::id()
            ]);

            // Start transaction
            DB::beginTransaction();

            try {
                // Update appointment status
                $appointment->update(['status' => $newStatus]);

                // Update queue status if exists
                if ($appointment->queue) {
                    $queueStatus = $this->mapAppointmentStatusToQueueStatus($newStatus);
                    $appointment->queue->update(['status' => $queueStatus]);
                }

                DB::commit();

                $statusLabels = [
                    'scheduled' => 'terjadwal',
                    'confirmed' => 'dikonfirmasi',
                    'completed' => 'selesai',
                    'canceled' => 'dibatalkan',
                    'no_show' => 'tidak hadir',
                ];

                Log::info('EmployeeAppointmentController::updateStatus - Status updated successfully', [
                    'appointment_id' => $appointment->id,
                    'new_status' => $newStatus
                ]);

                return redirect()->back()
                    ->with('success', 'Status appointment berhasil diubah menjadi ' . $statusLabels[$newStatus] . '.');
            } catch (Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (Exception $e) {
            Log::error('EmployeeAppointmentController::updateStatus - Error: ' . $e->getMessage(), [
                'appointment_id' => $id,
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat mengubah status appointment.');
        }
    }

    /**
     * Map appointment status to queue status
     */
    private function mapAppointmentStatusToQueueStatus($appointmentStatus)
    {
        switch ($appointmentStatus) {
            case 'scheduled':
                return 'waiting';
            case 'confirmed':
                return 'waiting';
            case 'completed':
                return 'completed';
            case 'canceled':
                return 'canceled';
            case 'no_show':
                return 'no_show';
            default:
                return 'waiting';
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


    public function show($appointmentId)
    {
        try {
            // Get appointment with all related data
            $appointment = Appointment::with([
                'patient.guardian',
                'patient.medicalHistory',
                'doctor',
                'schedule',
                'queue',
                'odontogram',
                'createdBy'
            ])->findOrFail($appointmentId);

            // Get complete appointment history for this patient-doctor combination
            $appointmentHistory = Appointment::where('patient_id', $appointment->patient_id)
                ->where('doctor_id', $appointment->doctor_id)
                ->with([
                    'schedule',
                    'queue',
                    'odontogram' => function ($query) {
                        $query->select('id', 'appointment_id', 'examination_date', 'is_finalized', 'd_value', 'm_value', 'f_value');
                    }
                ])
                ->orderBy('appointment_date', 'desc')
                ->orderBy('appointment_time', 'desc')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($appointment) {
                    // Add formatted dates for display
                    $appointment->formatted_date = $appointment->appointment_date
                        ? Carbon::parse($appointment->appointment_date)->format('d F Y')
                        : '';
                    $appointment->formatted_time = $appointment->appointment_time
                        ? Carbon::parse($appointment->appointment_time)->format('H:i')
                        : '';

                    // Add status label in Indonesian
                    $statuses = Appointment::getStatusesIndonesian();
                    $appointment->status_label = $statuses[$appointment->status] ?? 'Unknown';

                    return $appointment;
                });

            // Get appointment statistics for this patient-doctor combination
            $appointmentStats = [
                'total' => $appointmentHistory->count(),
                'completed' => $appointmentHistory->where('status', Appointment::STATUS_COMPLETED)->count(),
                'active' => $appointmentHistory->whereIn('status', [
                    Appointment::STATUS_SCHEDULED,
                    Appointment::STATUS_CONFIRMED,
                    Appointment::STATUS_IN_PROGRESS
                ])->count(),
                'cancelled' => $appointmentHistory->whereIn('status', [
                    Appointment::STATUS_CANCELED,
                    Appointment::STATUS_NO_SHOW
                ])->count(),
                'first_appointment' => $appointmentHistory->last()?->appointment_date,
                'last_appointment' => $appointmentHistory->first()?->appointment_date,
            ];

            // Format current appointment data
            $appointment->formatted_date = $appointment->appointment_date
                ? Carbon::parse($appointment->appointment_date)->format('d F Y')
                : '';
            $appointment->formatted_time = $appointment->appointment_time
                ? Carbon::parse($appointment->appointment_time)->format('H:i')
                : '';

            // Add status label in Indonesian
            $statuses = Appointment::getStatusesIndonesian();
            $appointment->status_label = $statuses[$appointment->status] ?? 'Unknown';

            // Get queue information if exists
            $queueInfo = null;
            if ($appointment->queue) {
                $queueInfo = [
                    'number' => $appointment->queue->queue_number,
                    'status' => $appointment->queue->status,
                    'estimated_time' => $appointment->queue->estimated_time,
                ];
            }

            // Check if appointment has examination data (odontogram)
            $hasExaminationData = $appointment->odontogram !== null;

            // Get related appointments (previous and next in sequence)
            $previousAppointment = Appointment::where('patient_id', $appointment->patient_id)
                ->where('doctor_id', $appointment->doctor_id)
                ->where('appointment_date', '<', $appointment->appointment_date)
                ->orWhere(function ($query) use ($appointment) {
                    $query->where('appointment_date', $appointment->appointment_date)
                        ->where('appointment_time', '<', $appointment->appointment_time);
                })
                ->orderBy('appointment_date', 'desc')
                ->orderBy('appointment_time', 'desc')
                ->first();

            $nextAppointment = Appointment::where('patient_id', $appointment->patient_id)
                ->where('doctor_id', $appointment->doctor_id)
                ->where('appointment_date', '>', $appointment->appointment_date)
                ->orWhere(function ($query) use ($appointment) {
                    $query->where('appointment_date', $appointment->appointment_date)
                        ->where('appointment_time', '>', $appointment->appointment_time);
                })
                ->orderBy('appointment_date', 'asc')
                ->orderBy('appointment_time', 'asc')
                ->first();

            Log::info('EmployeeAppointmentController::show - Appointment loaded', [
                'appointment_id' => $appointmentId,
                'patient_id' => $appointment->patient_id,
                'doctor_id' => $appointment->doctor_id,
                'appointment_date' => $appointment->appointment_date,
                'has_examination_data' => $hasExaminationData,
                'history_count' => $appointmentHistory->count()
            ]);

            return Inertia::render('Karyawan/AppointmentSection/Show', [
                'appointment' => $appointment,
                'appointmentHistory' => $appointmentHistory,
                'appointmentStats' => $appointmentStats,
                'queueInfo' => $queueInfo,
                'hasExaminationData' => $hasExaminationData,
                'previousAppointment' => $previousAppointment,
                'nextAppointment' => $nextAppointment,
                'canViewExamination' => true, // Employee can view examination data
                'canEditExamination' => false, // Employee cannot edit examination data
            ]);
        } catch (Exception $e) {
            Log::error('EmployeeAppointmentController::show - Error', [
                'appointment_id' => $appointmentId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('employee.appointments.index')
                ->with('error', 'Terjadi kesalahan saat memuat appointment: ' . $e->getMessage());
        }
    }

    /**
     * Get appointment history for AJAX calls
     */
    public function getAppointmentHistory($appointmentId)
    {
        try {
            $appointment = Appointment::findOrFail($appointmentId);

            // Get appointment history
            $appointmentHistory = Appointment::where('patient_id', $appointment->patient_id)
                ->where('doctor_id', $appointment->doctor_id)
                ->with(['schedule', 'queue', 'odontogram'])
                ->orderBy('appointment_date', 'desc')
                ->orderBy('appointment_time', 'desc')
                ->get()
                ->map(function ($appointment) {
                    $appointment->formatted_date = $appointment->appointment_date
                        ? Carbon::parse($appointment->appointment_date)->format('d F Y')
                        : '';
                    $appointment->formatted_time = $appointment->appointment_time
                        ? Carbon::parse($appointment->appointment_time)->format('H:i')
                        : '';

                    $statuses = Appointment::getStatusesIndonesian();
                    $appointment->status_label = $statuses[$appointment->status] ?? 'Unknown';

                    return $appointment;
                });

            return response()->json([
                'success' => true,
                'appointmentHistory' => $appointmentHistory,
                'patientId' => $appointment->patient_id,
                'doctorId' => $appointment->doctor_id,
            ]);
        } catch (Exception $e) {
            Log::error('EmployeeAppointmentController::getAppointmentHistory - Error', [
                'appointment_id' => $appointmentId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to load appointment history'
            ], 500);
        }
    }

    /**
     * Navigate to specific appointment from appointment view
     */
    public function showAppointment($appointmentId, $targetAppointmentId)
    {
        try {
            // Verify both appointments exist
            $currentAppointment = Appointment::findOrFail($appointmentId);
            $targetAppointment = Appointment::findOrFail($targetAppointmentId);

            // Verify both appointments are for the same patient-doctor combination
            if (
                $currentAppointment->patient_id !== $targetAppointment->patient_id ||
                $currentAppointment->doctor_id !== $targetAppointment->doctor_id
            ) {
                return redirect()->route('employee.appointments.show', $appointmentId)
                    ->with('error', 'Appointment tersebut bukan untuk kombinasi pasien-dokter yang sama.');
            }

            Log::info('EmployeeAppointmentController::showAppointment - Navigation', [
                'from_appointment_id' => $appointmentId,
                'to_appointment_id' => $targetAppointmentId,
                'patient_id' => $currentAppointment->patient_id,
                'doctor_id' => $currentAppointment->doctor_id,
            ]);

            // Redirect to target appointment show page
            return redirect()->route('employee.appointments.show', $targetAppointmentId)
                ->with('success', 'Berhasil berpindah ke appointment yang dipilih.');
        } catch (Exception $e) {
            Log::error('EmployeeAppointmentController::showAppointment - Error', [
                'from_appointment_id' => $appointmentId,
                'to_appointment_id' => $targetAppointmentId,
                'error' => $e->getMessage()
            ]);

            return redirect()->route('employee.appointments.index')
                ->with('error', 'Terjadi kesalahan saat berpindah appointment: ' . $e->getMessage());
        }
    }
}
