<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\Schedule;
use App\Models\ScheduleException;
use App\Models\ScheduleQuota;
use App\Models\Queue;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Log;

class ScheduleController extends Controller
{
    /**
     * Convert time from various formats to H:i format
     */
    private function convertTimeFormat($time)
    {
        if (empty($time)) {
            return null;
        }

        try {
            // Try to parse the time in different formats
            $parsedTime = Carbon::createFromFormat('H:i', $time);
            return $parsedTime->format('H:i');
        } catch (Exception $e1) {
            try {
                // Try parsing with seconds
                $parsedTime = Carbon::createFromFormat('H:i:s', $time);
                return $parsedTime->format('H:i');
            } catch (Exception $e2) {
                try {
                    // Try parsing AM/PM format
                    $parsedTime = Carbon::createFromFormat('h:i A', $time);
                    return $parsedTime->format('H:i');
                } catch (Exception $e3) {
                    try {
                        // Try parsing AM/PM format without space
                        $parsedTime = Carbon::createFromFormat('h:iA', $time);
                        return $parsedTime->format('H:i');
                    } catch (Exception $e4) {
                        try {
                            // Try parsing with g:i A format (single digit hour)
                            $parsedTime = Carbon::createFromFormat('g:i A', $time);
                            return $parsedTime->format('H:i');
                        } catch (Exception $e5) {
                            // If all formats fail, return original time
                            return $time;
                        }
                    }
                }
            }
        }
    }

    /**
     * Custom validation for time format
     */
    private function validateTimeFormat($time)
    {
        $convertedTime = $this->convertTimeFormat($time);
        return preg_match('/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/', $convertedTime);
    }

    /**
     * Display a listing of the schedules.
     */
    public function index(Request $request)
    {
        try {
            // Get filter parameters
            $search = $request->input('search', '');
            $dayFilter = $request->input('day_filter', 'all');
            $statusFilter = $request->input('status_filter', 'all');
            $doctorFilter = $request->input('doctor_filter', 'all');

            // Start query with relationships
            $query = Schedule::with(['doctor', 'scheduleQuota'])
                ->select('id', 'doctor_id', 'day_of_week', 'start_time', 'end_time', 'status', 'notes', 'created_at');

            // Apply search (doctor name or specialization)
            if (!empty($search)) {
                $query->whereHas('doctor', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('specialization', 'like', "%{$search}%");
                });
            }

            // Apply day filter
            if ($dayFilter !== 'all') {
                $query->where('day_of_week', $dayFilter);
            }

            // Apply status filter
            if ($statusFilter !== 'all') {
                if ($statusFilter === 'active') {
                    $query->where('status', true);
                } elseif ($statusFilter === 'inactive') {
                    $query->where('status', false);
                }
            }

            // Apply doctor filter
            if ($doctorFilter !== 'all') {
                $query->where('doctor_id', $doctorFilter);
            }

            // Order by day of week, then start time
            $schedules = $query->orderBy('day_of_week')
                ->orderBy('start_time')
                ->get();

            // Get available doctors for filter
            $doctors = Doctor::orderBy('name')->get(['id', 'name', 'specialization']);

            return Inertia::render('Karyawan/DoctorSection/Schedule/Index', [
                'schedules' => $schedules,
                'doctors' => $doctors,
                'filters' => [
                    'search' => $search,
                    'day_filter' => $dayFilter,
                    'status_filter' => $statusFilter,
                    'doctor_filter' => $doctorFilter,
                ],
                'stats' => [
                    'total_schedules' => Schedule::count(),
                    'active_schedules' => Schedule::where('status', true)->count(),
                    'by_day' => Schedule::select('day_of_week', DB::raw('count(*) as count'))
                        ->groupBy('day_of_week')
                        ->pluck('count', 'day_of_week'),
                ]
            ]);
        } catch (Exception $e) {
            Log::error('ScheduleController::index - Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);

            return Inertia::render('Karyawan/DoctorSection/Schedule/Index', [
                'schedules' => collect([]),
                'doctors' => collect([]),
                'filters' => $request->only(['search', 'day_filter', 'status_filter', 'doctor_filter']),
                'error' => 'An error occurred while loading schedules data.'
            ]);
        }
    }

    /**
     * Show the form for creating a new schedule.
     */
    public function create()
    {
        $doctors = Doctor::orderBy('name')->get();
        $days = [
            0 => 'Minggu',
            1 => 'Senin',
            2 => 'Selasa',
            3 => 'Rabu',
            4 => 'Kamis',
            5 => 'Jumat',
            6 => 'Sabtu',
        ];

        return Inertia::render('Karyawan/DoctorSection/Schedule/Create', [
            'doctors' => $doctors,
            'days' => $days
        ]);
    }

    /**
     * Store a newly created schedule in storage.
     */
    public function store(Request $request)
    {
        // Convert time formats before validation
        $startTime = $this->convertTimeFormat($request->start_time);
        $endTime = $this->convertTimeFormat($request->end_time);

        $validator = Validator::make($request->all(), [
            'doctor_id' => 'required|exists:doctors,id',
            'day_of_week' => 'required|integer|between:0,6',
            'start_time' => [
                'required',
                function ($attribute, $value, $fail) {
                    if (!$this->validateTimeFormat($value)) {
                        $fail('The ' . $attribute . ' field must be a valid time format.');
                    }
                }
            ],
            'end_time' => [
                'required',
                function ($attribute, $value, $fail) use ($startTime) {
                    if (!$this->validateTimeFormat($value)) {
                        $fail('The ' . $attribute . ' field must be a valid time format.');
                    }

                    $convertedEndTime = $this->convertTimeFormat($value);
                    if ($convertedEndTime <= $startTime) {
                        $fail('The ' . $attribute . ' must be after start time.');
                    }
                }
            ],
            'status' => 'required|boolean',
            'quota' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        // Check if there's an overlapping schedule for this doctor
        $hasOverlap = Schedule::where('doctor_id', $request->doctor_id)
            ->where('day_of_week', $request->day_of_week)
            ->where(function ($query) use ($startTime, $endTime) {
                $query->whereBetween('start_time', [$startTime, $endTime])
                    ->orWhereBetween('end_time', [$startTime, $endTime])
                    ->orWhere(function ($q) use ($startTime, $endTime) {
                        $q->where('start_time', '<=', $startTime)
                            ->where('end_time', '>=', $endTime);
                    });
            })
            ->exists();

        if ($hasOverlap) {
            return redirect()->back()
                ->withErrors(['overlap' => 'Jadwal ini bertabrakan dengan jadwal lain yang sudah ada.'])
                ->withInput();
        }

        DB::beginTransaction();

        try {
            // Create the schedule with converted time formats
            $schedule = Schedule::create([
                'doctor_id' => $request->doctor_id,
                'day_of_week' => $request->day_of_week,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'status' => $request->status,
                'notes' => $request->notes,
            ]);

            // Create the schedule quota
            ScheduleQuota::create([
                'schedule_id' => $schedule->id,
                'quota' => $request->quota,
            ]);

            DB::commit();

            return redirect()->route('schedules.index')
                ->with('success', 'Jadwal berhasil dibuat.');
        } catch (Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withErrors(['error' => 'Terjadi kesalahan: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Display the specified schedule.
     */
    public function show($id)
    {
        $schedule = Schedule::with(['doctor', 'scheduleQuota'])->findOrFail($id);

        return Inertia::render('Karyawan/DoctorSection/Schedule/Show', [
            'schedule' => $schedule
        ]);
    }

    /**
     * Show the form for editing the specified schedule.
     */
    public function edit($id)
    {
        $schedule = Schedule::with('scheduleQuota')->findOrFail($id);
        $doctors = Doctor::orderBy('name')->get();
        $days = [
            0 => 'Minggu',
            1 => 'Senin',
            2 => 'Selasa',
            3 => 'Rabu',
            4 => 'Kamis',
            5 => 'Jumat',
            6 => 'Sabtu',
        ];

        return Inertia::render('Karyawan/DoctorSection/Schedule/Edit', [
            'schedule' => $schedule,
            'quota' => $schedule->scheduleQuota->quota,
            'doctors' => $doctors,
            'days' => $days
        ]);
    }

    /**
     * Update the specified schedule in storage.
     */
    public function update(Request $request, $id)
    {
        // Convert time formats before validation
        $startTime = $this->convertTimeFormat($request->start_time);
        $endTime = $this->convertTimeFormat($request->end_time);

        $validator = Validator::make($request->all(), [
            'doctor_id' => 'required|exists:doctors,id',
            'day_of_week' => 'required|integer|between:0,6',
            'start_time' => [
                'required',
                function ($attribute, $value, $fail) {
                    if (!$this->validateTimeFormat($value)) {
                        $fail('The ' . $attribute . ' field must be a valid time format.');
                    }
                }
            ],
            'end_time' => [
                'required',
                function ($attribute, $value, $fail) use ($startTime) {
                    if (!$this->validateTimeFormat($value)) {
                        $fail('The ' . $attribute . ' field must be a valid time format.');
                    }

                    $convertedEndTime = $this->convertTimeFormat($value);
                    if ($convertedEndTime <= $startTime) {
                        $fail('The ' . $attribute . ' must be after start time.');
                    }
                }
            ],
            'status' => 'required|boolean',
            'quota' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $schedule = Schedule::findOrFail($id);

        // Check if there's an overlapping schedule for this doctor (excluding current schedule)
        $hasOverlap = Schedule::where('doctor_id', $request->doctor_id)
            ->where('day_of_week', $request->day_of_week)
            ->where('id', '!=', $id)
            ->where(function ($query) use ($startTime, $endTime) {
                $query->whereBetween('start_time', [$startTime, $endTime])
                    ->orWhereBetween('end_time', [$startTime, $endTime])
                    ->orWhere(function ($q) use ($startTime, $endTime) {
                        $q->where('start_time', '<=', $startTime)
                            ->where('end_time', '>=', $endTime);
                    });
            })
            ->exists();

        if ($hasOverlap) {
            return redirect()->back()
                ->withErrors(['overlap' => 'Jadwal ini bertabrakan dengan jadwal lain yang sudah ada.'])
                ->withInput();
        }

        DB::beginTransaction();

        try {
            // Update the schedule with converted time formats
            $schedule->update([
                'doctor_id' => $request->doctor_id,
                'day_of_week' => $request->day_of_week,
                'start_time' => $startTime,
                'end_time' => $endTime,
                'status' => $request->status,
                'notes' => $request->notes,
            ]);

            // Update the schedule quota
            $schedule->scheduleQuota()->update([
                'quota' => $request->quota,
            ]);

            DB::commit();

            return redirect()->route('schedules.index')
                ->with('success', 'Jadwal berhasil diperbarui.');
        } catch (Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withErrors(['error' => 'Terjadi kesalahan: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Remove the specified schedule from storage.
     */
    public function destroy($id)
    {
        $schedule = Schedule::findOrFail($id);

        // Check if this schedule has any related appointments
        $hasAppointments = $schedule->appointments()->exists();

        if ($hasAppointments) {
            return redirect()->back()
                ->with('error', 'Jadwal ini tidak dapat dihapus karena sudah memiliki janji temu terkait.');
        }

        DB::beginTransaction();

        try {
            // Delete associated quota
            $schedule->scheduleQuota()->delete();

            // Delete the schedule
            $schedule->delete();

            DB::commit();

            return redirect()->route('schedules.index')
                ->with('success', 'Jadwal berhasil dihapus.');
        } catch (Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * NEW: Get available doctors for a specific date
     */
    public function getAvailableDoctors(Request $request)
    {
        try {
            Log::info('getAvailableDoctors called', ['request' => $request->all()]);

            $validator = Validator::make($request->all(), [
                'date' => 'required|date_format:Y-m-d|after_or_equal:today',
            ]);

            if ($validator->fails()) {
                Log::error('Validation failed', ['errors' => $validator->errors()]);
                return response()->json([
                    'errors' => $validator->errors(),
                ], 422);
            }

            $selectedDate = Carbon::parse($request->date);
            $dayOfWeek = $selectedDate->dayOfWeek;

            Log::info('Processing date', [
                'selected_date' => $selectedDate->format('Y-m-d'),
                'day_of_week' => $dayOfWeek
            ]);

            // Step 1: Get all doctors first
            $allDoctors = Doctor::all();
            Log::info('All doctors count', ['count' => $allDoctors->count()]);

            // Step 2: Check which doctors have schedules for this day
            $doctorsWithSchedules = Doctor::whereHas('schedules', function ($query) use ($dayOfWeek) {
                $query->where('day_of_week', $dayOfWeek)
                    ->where('status', true);
            })->get();

            Log::info('Doctors with schedules', ['count' => $doctorsWithSchedules->count()]);

            // Step 3: Filter doctors with valid licenses
            $doctorsWithValidLicense = $doctorsWithSchedules->filter(function ($doctor) use ($selectedDate) {
                // Check license validity
                if ($doctor->license_expiry_date && $doctor->license_expiry_date < $selectedDate->format('Y-m-d')) {
                    return false;
                }
                return true;
            });

            Log::info('Doctors with valid license', ['count' => $doctorsWithValidLicense->count()]);

            // Step 4: Filter out doctors who have full-day exceptions on this date
            $availableDoctors = $doctorsWithValidLicense->filter(function ($doctor) use ($selectedDate) {
                try {
                    $hasFullDayException = ScheduleException::where('doctor_id', $doctor->id)
                        ->where('exception_date_start', '<=', $selectedDate->format('Y-m-d'))
                        ->where('exception_date_end', '>=', $selectedDate->format('Y-m-d'))
                        ->where('is_full_day', true)
                        ->exists();

                    return !$hasFullDayException;
                } catch (Exception $e) {
                    Log::error('Error checking exceptions for doctor', [
                        'doctor_id' => $doctor->id,
                        'error' => $e->getMessage()
                    ]);
                    // If error checking exceptions, include the doctor (safe fallback)
                    return true;
                }
            });

            Log::info('Available doctors after exception filter', ['count' => $availableDoctors->count()]);

            // Step 5: Transform the data and count available schedules
            $doctors = $availableDoctors->map(function ($doctor) use ($selectedDate, $dayOfWeek) {
                try {
                    // Count available schedules for this doctor on this date
                    $scheduleCount = Schedule::where('doctor_id', $doctor->id)
                        ->where('day_of_week', $dayOfWeek)
                        ->where('status', true)
                        ->count();

                    // Try to count more accurately by checking exceptions
                    $availableSchedulesCount = 0;
                    $schedules = Schedule::where('doctor_id', $doctor->id)
                        ->where('day_of_week', $dayOfWeek)
                        ->where('status', true)
                        ->get();

                    foreach ($schedules as $schedule) {
                        try {
                            $hasException = ScheduleException::where('doctor_id', $doctor->id)
                                ->where('exception_date_start', '<=', $selectedDate->format('Y-m-d'))
                                ->where('exception_date_end', '>=', $selectedDate->format('Y-m-d'))
                                ->where(function ($query) use ($schedule) {
                                    $query->where('is_full_day', true)
                                        ->orWhere(function ($timeQuery) use ($schedule) {
                                            $timeQuery->where('is_full_day', false)
                                                ->where(function ($overlapQuery) use ($schedule) {
                                                    $overlapQuery->whereBetween('start_time', [$schedule->start_time, $schedule->end_time])
                                                        ->orWhereBetween('end_time', [$schedule->start_time, $schedule->end_time])
                                                        ->orWhere(function ($containsQuery) use ($schedule) {
                                                            $containsQuery->where('start_time', '<=', $schedule->start_time)
                                                                ->where('end_time', '>=', $schedule->end_time);
                                                        });
                                                });
                                        });
                                })
                                ->exists();

                            if (!$hasException) {
                                $availableSchedulesCount++;
                            }
                        } catch (Exception $e) {
                            Log::error('Error checking schedule exception', [
                                'schedule_id' => $schedule->id,
                                'error' => $e->getMessage()
                            ]);
                            // If error, count the schedule as available (safe fallback)
                            $availableSchedulesCount++;
                        }
                    }

                    return [
                        'id' => $doctor->id,
                        'name' => $doctor->name,
                        'specialization' => $doctor->specialization ?? 'General',
                        'available_schedules_count' => $availableSchedulesCount,
                        'total_schedules_count' => $scheduleCount,
                    ];
                } catch (Exception $e) {
                    Log::error('Error processing doctor', [
                        'doctor_id' => $doctor->id,
                        'error' => $e->getMessage()
                    ]);

                    // Return basic info if error
                    return [
                        'id' => $doctor->id,
                        'name' => $doctor->name,
                        'specialization' => $doctor->specialization ?? 'General',
                        'available_schedules_count' => 0,
                        'total_schedules_count' => 0,
                    ];
                }
            })->filter(function ($doctor) {
                // Only show doctors who have at least one available schedule
                return $doctor['available_schedules_count'] > 0;
            })->values();

            Log::info('Final doctors result', ['count' => $doctors->count()]);

            return response()->json([
                'date' => $selectedDate->format('Y-m-d'),
                'day_name' => $this->getDayName($dayOfWeek),
                'doctors' => $doctors,
                'debug' => [
                    'day_of_week' => $dayOfWeek,
                    'all_doctors_count' => $allDoctors->count(),
                    'doctors_with_schedules_count' => $doctorsWithSchedules->count(),
                    'doctors_with_valid_license_count' => $doctorsWithValidLicense->count(),
                    'available_doctors_count' => $availableDoctors->count(),
                    'final_doctors_count' => $doctors->count(),
                ],
            ]);
        } catch (Exception $e) {
            Log::error('getAvailableDoctors error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);

            return response()->json([
                'error' => 'Internal server error',
                'message' => $e->getMessage(),
                'debug' => config('app.debug') ? $e->getTraceAsString() : 'Enable debug mode for more details'
            ], 500);
        }
    }

    /**
     * UPDATED: Display available schedules for a specific doctor and date
     */
    public function getAvailableSchedules(Request $request)
    {
        try {
            Log::info('getAvailableSchedules called', ['request' => $request->all()]);

            $validator = Validator::make($request->all(), [
                'date' => 'required|date_format:Y-m-d|after_or_equal:today',
                'doctor_id' => 'required|exists:doctors,id',
            ]);

            if ($validator->fails()) {
                Log::error('getAvailableSchedules validation failed', ['errors' => $validator->errors()]);
                return response()->json([
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

            Log::info('Found schedules', ['count' => $availableSchedules->count()]);

            // Filter out schedules that have exceptions on this date
            $filteredSchedules = $availableSchedules->filter(function ($schedule) use ($selectedDate) {
                try {
                    $hasException = ScheduleException::where('doctor_id', $schedule->doctor_id)
                        ->where('exception_date_start', '<=', $selectedDate->format('Y-m-d'))
                        ->where('exception_date_end', '>=', $selectedDate->format('Y-m-d'))
                        ->where(function ($query) use ($schedule) {
                            // Full day exception OR time-specific exception that overlaps with schedule
                            $query->where('is_full_day', true)
                                ->orWhere(function ($timeQuery) use ($schedule) {
                                    $timeQuery->where('is_full_day', false)
                                        ->where(function ($overlapQuery) use ($schedule) {
                                            $overlapQuery->whereBetween('start_time', [$schedule->start_time, $schedule->end_time])
                                                ->orWhereBetween('end_time', [$schedule->start_time, $schedule->end_time])
                                                ->orWhere(function ($containsQuery) use ($schedule) {
                                                    $containsQuery->where('start_time', '<=', $schedule->start_time)
                                                        ->where('end_time', '>=', $schedule->end_time);
                                                });
                                        });
                                });
                        })
                        ->exists();

                    return !$hasException;
                } catch (Exception $e) {
                    Log::error('Error checking schedule exception', [
                        'schedule_id' => $schedule->id,
                        'error' => $e->getMessage()
                    ]);
                    // If error checking exceptions, include the schedule (safe fallback)
                    return true;
                }
            });

            Log::info('Filtered schedules', ['count' => $filteredSchedules->count()]);

            // For each available schedule, check booked appointments and calculate remaining quota
            $schedulesWithQuota = $filteredSchedules->map(function ($schedule) use ($selectedDate) {
                try {
                    $totalQuota = $schedule->scheduleQuota ? $schedule->scheduleQuota->quota : 10; // default quota

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
                        'booked_appointments' => $bookedAppointments,
                        'remaining_quota' => max(0, $remainingQuota),
                        'is_available' => $remainingQuota > 0,
                        'notes' => $schedule->notes,
                    ];
                } catch (Exception $e) {
                    Log::error('Error processing schedule quota', [
                        'schedule_id' => $schedule->id,
                        'error' => $e->getMessage()
                    ]);

                    // Return basic schedule info if error
                    return [
                        'id' => $schedule->id,
                        'start_time' => $schedule->start_time,
                        'end_time' => $schedule->end_time,
                        'formatted_time' => $schedule->start_time . ' - ' . $schedule->end_time,
                        'total_quota' => 10,
                        'booked_appointments' => 0,
                        'remaining_quota' => 10,
                        'is_available' => true,
                        'notes' => $schedule->notes,
                    ];
                }
            });

            // Filter out schedules with no remaining quota
            $availableSchedulesWithQuota = $schedulesWithQuota->filter(function ($schedule) {
                return $schedule['is_available'];
            })->values();

            Log::info('Available schedules with quota', ['count' => $availableSchedulesWithQuota->count()]);

            return response()->json([
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
            Log::error('getAvailableSchedules error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);

            return response()->json([
                'error' => 'Internal server error',
                'message' => $e->getMessage(),
                'debug' => config('app.debug') ? $e->getTraceAsString() : 'Enable debug mode for more details'
            ], 500);
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
