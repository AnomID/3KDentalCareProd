<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Guardian;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 15);

            // Get filter parameters
            $search = $request->input('search', '');
            $sortField = $request->input('sort', 'created_at');
            $sortDirection = $request->input('direction', 'desc');
            $filterGender = $request->input('filter_gender', 'all');
            $filterAge = $request->input('filter_age', 'all');
            $filterBloodType = $request->input('filter_blood_type', 'all');
            $filterGuardian = $request->input('filter_guardian', 'all');
            $filterRM = $request->input('filter_rm', 'all');
            $filterAppointment = $request->input('filter_appointment', 'all');
            $period = $request->input('period', '');

            // Start query with optimized relationships
            $query = Patient::query()
                ->with([
                    'user:id,name,email',
                    'guardian:id,name,relationship,phone_number',
                    'medicalHistory:id,patient_id,blood_type'
                ])
                ->select([
                    'id',
                    'no_rm',
                    'name',
                    'gender',
                    'birth_date',
                    'phone',
                    'address',
                    'blood_type',
                    'guardian_id',
                    'user_id',
                    'created_at'
                ]);

            // Apply search with improved logic
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('no_rm', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($userQuery) use ($search) {
                            $userQuery->where('email', 'like', "%{$search}%");
                        });
                });
            }

            // Apply gender filter
            if ($filterGender !== 'all') {
                $query->where('gender', $filterGender);
            }

            // Apply blood type filter
            if ($filterBloodType !== 'all') {
                $query->where(function ($q) use ($filterBloodType) {
                    $q->where('blood_type', $filterBloodType)
                        ->orWhereHas('medicalHistory', function ($mhQuery) use ($filterBloodType) {
                            $mhQuery->where('blood_type', $filterBloodType);
                        });
                });
            }

            // Apply guardian filter
            if ($filterGuardian !== 'all') {
                if ($filterGuardian === 'with_guardian') {
                    $query->whereNotNull('guardian_id');
                } elseif ($filterGuardian === 'without_guardian') {
                    $query->whereNull('guardian_id');
                }
            }

            // Apply RM filter
            if ($filterRM !== 'all') {
                if ($filterRM === 'with_rm') {
                    $query->whereNotNull('no_rm');
                } elseif ($filterRM === 'without_rm') {
                    $query->whereNull('no_rm');
                }
            }

            // Apply appointment filter
            if ($filterAppointment !== 'all') {
                if ($filterAppointment === 'with_appointments') {
                    $query->whereHas('appointments');
                } elseif ($filterAppointment === 'without_appointments') {
                    $query->whereDoesntHave('appointments');
                } elseif ($filterAppointment === 'active_appointments') {
                    $query->whereHas('appointments', function ($q) {
                        $q->whereIn('status', [
                            'scheduled',
                            'confirmed',
                            'in_progress'
                        ]);
                    });
                }
            }

            // Apply age filter with improved calculation
            if ($filterAge !== 'all') {
                switch ($filterAge) {
                    case 'child':
                        $query->whereRaw('EXTRACT(YEAR FROM AGE(birth_date)) < 18');
                        break;
                    case 'adult':
                        $query->whereRaw('EXTRACT(YEAR FROM AGE(birth_date)) BETWEEN 18 AND 60');
                        break;
                    case 'senior':
                        $query->whereRaw('EXTRACT(YEAR FROM AGE(birth_date)) > 60');
                        break;
                }
            }

            // Time period filtering
            if ($period) {
                switch ($period) {
                    case 'today':
                        $query->whereDate('created_at', today());
                        break;
                    case 'this_week':
                        $query->whereBetween('created_at', [
                            now()->startOfWeek(),
                            now()->endOfWeek()
                        ]);
                        break;
                    case 'this_month':
                        $query->whereMonth('created_at', now()->month)
                            ->whereYear('created_at', now()->year);
                        break;
                    case 'this_year':
                        $query->whereYear('created_at', now()->year);
                        break;
                }
            }

            // Apply sorting
            $allowedSortFields = ['id', 'no_rm', 'name', 'gender', 'birth_date', 'phone', 'blood_type', 'created_at'];
            if (in_array($sortField, $allowedSortFields)) {
                $query->orderBy($sortField, $sortDirection);
            }

            // Add secondary sorting for consistency
            if ($sortField !== 'id') {
                $query->orderBy('id', 'desc');
            }

            // Get paginated results
            $patients = $query->paginate($perPage)->withQueryString();

            // Add computed attributes and appointment statistics
            $patients->getCollection()->transform(function ($patient) {
                // Calculate age more reliably
                if ($patient->birth_date) {
                    try {
                        $patient->age = Carbon::parse($patient->birth_date)->age;
                    } catch (Exception $e) {
                        $patient->age = null;
                    }
                } else {
                    $patient->age = null;
                }

                // Get appointment statistics for each patient - optimized query
                $appointmentStats = DB::table('appointments')
                    ->where('patient_id', $patient->id)
                    ->selectRaw('
                        COUNT(*) as total_appointments,
                        COUNT(CASE WHEN status = ? THEN 1 END) as completed_appointments,
                        COUNT(CASE WHEN status IN (?, ?, ?) THEN 1 END) as active_appointments,
                        COUNT(DISTINCT doctor_id) as total_doctors,
                        MAX(appointment_date) as last_appointment_date
                    ', [
                        'completed',
                        'scheduled',
                        'confirmed',
                        'in_progress'
                    ])
                    ->first();

                $patient->appointment_stats = [
                    'total' => $appointmentStats->total_appointments ?? 0,
                    'completed' => $appointmentStats->completed_appointments ?? 0,
                    'active' => $appointmentStats->active_appointments ?? 0,
                    'total_doctors' => $appointmentStats->total_doctors ?? 0,
                    'last_appointment' => $appointmentStats->last_appointment_date
                ];

                // Get most recent appointment with doctor info - optimized
                $patient->latest_appointment = Appointment::where('patient_id', $patient->id)
                    ->with('doctor:id,name')
                    ->orderBy('appointment_date', 'desc')
                    ->orderBy('appointment_time', 'desc')
                    ->first();

                // Ensure blood_type is available from either patient or medical history
                if (!$patient->blood_type && $patient->medicalHistory) {
                    $patient->blood_type = $patient->medicalHistory->blood_type;
                }

                return $patient;
            });

            // Generate statistics - POSTGRESQL FIXED VERSION
            Log::info('About to generate statistics for PostgreSQL...');

            // Add debugging first
            $this->debugPatientData();
            $this->testPatientRelationships();

            $statistics = $this->generatePatientStatisticsPostgreSQL($request);

            Log::info('Statistics generated:', [
                'statistics_keys' => array_keys($statistics),
                'total' => $statistics['total'] ?? 'not_set',
                'genders_count' => count($statistics['genders'] ?? []),
                'blood_types_count' => count($statistics['blood_types'] ?? []),
                'has_error' => isset($statistics['_error'])
            ]);

            // Get filter options
            $filterOptions = $this->getPatientFilterOptions();

            Log::info('PatientController::index (Employee) - Patients loaded successfully', [
                'total_patients' => $patients->total(),
                'current_page' => $patients->currentPage(),
                'statistics_data' => $statistics,
                'filters_applied' => array_filter([
                    'search' => $search,
                    'gender' => $filterGender !== 'all' ? $filterGender : null,
                    'age' => $filterAge !== 'all' ? $filterAge : null,
                    'period' => $period
                ])
            ]);

            return Inertia::render('Karyawan/PatientSection/Index', [
                'patients' => $patients,
                'statistics' => $statistics,
                'filterOptions' => $filterOptions,
                'filters' => [
                    'search' => $search,
                    'filter_gender' => $filterGender,
                    'filter_age' => $filterAge,
                    'filter_blood_type' => $filterBloodType,
                    'filter_guardian' => $filterGuardian,
                    'filter_rm' => $filterRM,
                    'filter_appointment' => $filterAppointment,
                    'period' => $period,
                    'per_page' => $perPage,
                ],
                'sorting' => [
                    'field' => $sortField,
                    'direction' => $sortDirection,
                ],
                'debug' => [
                    'statistics_passed' => !empty($statistics),
                    'statistics_total' => $statistics['total'] ?? 0,
                    'statistics_keys' => array_keys($statistics ?? [])
                ]
            ]);
        } catch (Exception $e) {
            Log::error('PatientController::index (Employee) - Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);

            return Inertia::render('Karyawan/PatientSection/Index', [
                'patients' => collect([]),
                'statistics' => $this->getEmptyStatistics(),
                'filterOptions' => $this->getPatientFilterOptions(),
                'filters' => $request->only([
                    'search',
                    'filter_gender',
                    'filter_age',
                    'filter_blood_type',
                    'filter_guardian',
                    'filter_rm',
                    'filter_appointment',
                    'period',
                    'per_page'
                ]),
                'sorting' => [
                    'field' => $sortField,
                    'direction' => $sortDirection,
                ],
                'error' => 'An error occurred while loading patients data.'
            ]);
        }
    }

    /**
     * POSTGRESQL FIXED VERSION - Handle PostgreSQL specific issues
     */
    private function generatePatientStatisticsPostgreSQL(Request $request)
    {
        try {
            Log::info('Starting POSTGRESQL patient statistics generation...');

            // Get total patients using Eloquent
            $totalPatients = Patient::count();
            Log::info('POSTGRESQL - Total patients from Patient model: ' . $totalPatients);

            if ($totalPatients === 0) {
                Log::warning('POSTGRESQL - No patients found in database');
                return $this->getEmptyStatistics();
            }

            // Basic counts using Eloquent
            $withGuardians = Patient::whereNotNull('guardian_id')->count();
            $withRM = Patient::whereNotNull('no_rm')->count();

            Log::info('POSTGRESQL - Basic counts', [
                'total' => $totalPatients,
                'with_guardians' => $withGuardians,
                'with_rm' => $withRM
            ]);

            // Count appointments using proper relationship
            $patientsWithAppointments = Patient::has('appointments')->count();

            Log::info('POSTGRESQL - Patients with appointments: ' . $patientsWithAppointments);

            // Time-based statistics
            $todayCount = Patient::whereDate('created_at', today())->count();
            $todayWithGuardians = Patient::whereDate('created_at', today())
                ->whereNotNull('guardian_id')->count();

            $thisWeekStart = now()->startOfWeek();
            $thisWeekEnd = now()->endOfWeek();
            $thisWeekCount = Patient::whereBetween('created_at', [$thisWeekStart, $thisWeekEnd])->count();
            $thisWeekWithGuardians = Patient::whereBetween('created_at', [$thisWeekStart, $thisWeekEnd])
                ->whereNotNull('guardian_id')->count();

            $thisMonthCount = Patient::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)->count();
            $thisMonthWithGuardians = Patient::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->whereNotNull('guardian_id')->count();

            Log::info('POSTGRESQL - Time-based counts', [
                'today' => $todayCount,
                'this_week' => $thisWeekCount,
                'this_month' => $thisMonthCount
            ]);

            // Gender statistics - using Eloquent groupBy with PostgreSQL compatible conditions
            $genderStatsCollection = Patient::whereNotNull('gender')
                ->whereRaw("gender != ''")  // PostgreSQL compatible
                ->groupBy('gender')
                ->selectRaw('gender, count(*) as count')
                ->get();

            $genderStats = [];
            foreach ($genderStatsCollection as $item) {
                $genderStats[$item->gender] = $item->count;
            }

            Log::info('POSTGRESQL - Gender stats: ', $genderStats);

            // Age group statistics - FIXED for PostgreSQL
            $patientsWithBirthDate = Patient::whereNotNull('birth_date')
                ->whereRaw("birth_date IS NOT NULL")  // Extra safety for PostgreSQL
                ->select('birth_date')
                ->get();

            $ageStats = [
                'child' => 0,
                'adult' => 0,
                'senior' => 0,
            ];

            foreach ($patientsWithBirthDate as $patient) {
                try {
                    if ($patient->birth_date && $patient->birth_date != '') {
                        $age = Carbon::parse($patient->birth_date)->age;
                        if ($age < 18) {
                            $ageStats['child']++;
                        } elseif ($age <= 60) {
                            $ageStats['adult']++;
                        } else {
                            $ageStats['senior']++;
                        }
                    }
                } catch (Exception $e) {
                    Log::warning('POSTGRESQL - Invalid birth date for patient: ' . $patient->id);
                    continue;
                }
            }

            Log::info('POSTGRESQL - Age stats: ', $ageStats);

            // Blood type statistics - FIXED for PostgreSQL
            $bloodTypeStatsCollection = Patient::whereNotNull('blood_type')
                ->whereRaw("blood_type != '' AND blood_type IS NOT NULL")  // PostgreSQL compatible
                ->groupBy('blood_type')
                ->selectRaw('blood_type, count(*) as count')
                ->get();

            $bloodTypeStats = [];
            foreach ($bloodTypeStatsCollection as $item) {
                $bloodTypeStats[$item->blood_type] = $item->count;
            }

            Log::info('POSTGRESQL - Blood type stats from patients: ', $bloodTypeStats);

            // Also check medical history if available and merge
            try {
                $medicalHistoryBloodTypes = DB::table('medical_histories')
                    ->whereNotNull('blood_type')
                    ->whereRaw("blood_type != '' AND blood_type IS NOT NULL")
                    ->groupBy('blood_type')
                    ->selectRaw('blood_type, count(*) as count')
                    ->get();

                foreach ($medicalHistoryBloodTypes as $item) {
                    if (isset($bloodTypeStats[$item->blood_type])) {
                        // Keep the higher count (avoid duplicates)
                        $bloodTypeStats[$item->blood_type] = max($bloodTypeStats[$item->blood_type], $item->count);
                    } else {
                        $bloodTypeStats[$item->blood_type] = $item->count;
                    }
                }

                Log::info('POSTGRESQL - Blood type stats after medical history merge: ', $bloodTypeStats);
            } catch (Exception $e) {
                Log::info('POSTGRESQL - Medical history table not available: ' . $e->getMessage());
            }

            // Calculate rates
            $guardianRate = $totalPatients > 0 ? round(($withGuardians / $totalPatients) * 100, 1) : 0;
            $appointmentRate = $totalPatients > 0 ? round(($patientsWithAppointments / $totalPatients) * 100, 1) : 0;
            $rmCompletionRate = $totalPatients > 0 ? round(($withRM / $totalPatients) * 100, 1) : 0;

            // Recent statistics
            $recentRegistrations = Patient::where('created_at', '>=', now()->subDays(7))->count();
            $patientsLast30Days = Patient::where('created_at', '>=', now()->subDays(30))->count();
            $avgNewPerDay = $patientsLast30Days > 0 ? round($patientsLast30Days / 30, 1) : 0;

            $statistics = [
                // Overall statistics
                'total' => $totalPatients,
                'with_guardians' => $withGuardians,
                'without_guardians' => $totalPatients - $withGuardians,
                'with_appointments' => $patientsWithAppointments,
                'without_appointments' => $totalPatients - $patientsWithAppointments,

                // Time-based statistics
                'today' => [
                    'total' => $todayCount,
                    'with_guardians' => $todayWithGuardians,
                ],

                'this_week' => [
                    'total' => $thisWeekCount,
                    'with_guardians' => $thisWeekWithGuardians,
                ],

                'this_month' => [
                    'total' => $thisMonthCount,
                    'with_guardians' => $thisMonthWithGuardians,
                ],

                // Demographics
                'genders' => $genderStats,
                'age_groups' => $ageStats,
                'blood_types' => $bloodTypeStats,

                // RM Number statistics
                'rm_status' => [
                    'with_rm' => $withRM,
                    'without_rm' => $totalPatients - $withRM,
                ],

                // Rates
                'guardian_rate' => $guardianRate,
                'appointment_rate' => $appointmentRate,
                'rm_completion_rate' => $rmCompletionRate,

                // Trends
                'avg_new_per_day' => $avgNewPerDay,
                'recent_registrations' => $recentRegistrations,
            ];

            Log::info('POSTGRESQL - Final statistics generated successfully', [
                'total_patients' => $statistics['total'],
                'gender_count' => count($statistics['genders']),
                'blood_type_count' => count($statistics['blood_types']),
                'guardian_rate' => $statistics['guardian_rate'],
                'appointment_rate' => $statistics['appointment_rate'],
            ]);

            return $statistics;
        } catch (Exception $e) {
            Log::error('POSTGRESQL - Error generating patient statistics: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);

            // Return empty statistics with error indication
            $emptyStats = $this->getEmptyStatistics();
            $emptyStats['_error'] = $e->getMessage();
            return $emptyStats;
        }
    }

    /**
     * Debug method to check what's in the database - PostgreSQL compatible
     */
    private function debugPatientData()
    {
        Log::info('=== DEBUGGING PATIENT DATA (PostgreSQL) ===');

        // Check total patients
        $totalPatients = Patient::count();
        Log::info('Total patients in database: ' . $totalPatients);

        if ($totalPatients > 0) {
            // Get first few patients to see their structure
            $samplePatients = Patient::take(3)->get([
                'id',
                'name',
                'gender',
                'blood_type',
                'birth_date',
                'guardian_id',
                'no_rm',
                'created_at'
            ]);

            Log::info('Sample patients data: ', $samplePatients->toArray());

            // Check gender distribution - PostgreSQL safe
            try {
                $genderCheck = Patient::selectRaw('gender, count(*) as count')
                    ->whereNotNull('gender')
                    ->groupBy('gender')
                    ->get();
                Log::info('Gender distribution: ', $genderCheck->toArray());
            } catch (Exception $e) {
                Log::error('Error checking gender distribution: ' . $e->getMessage());
            }

            // Check blood type distribution - PostgreSQL safe
            try {
                $bloodTypeCheck = Patient::selectRaw('blood_type, count(*) as count')
                    ->whereNotNull('blood_type')
                    ->groupBy('blood_type')
                    ->get();
                Log::info('Blood type distribution: ', $bloodTypeCheck->toArray());
            } catch (Exception $e) {
                Log::error('Error checking blood type distribution: ' . $e->getMessage());
            }

            // Check guardian distribution
            $guardianCheck = [
                'with_guardian' => Patient::whereNotNull('guardian_id')->count(),
                'without_guardian' => Patient::whereNull('guardian_id')->count(),
            ];
            Log::info('Guardian distribution: ', $guardianCheck);

            // Check appointments relationship
            try {
                $appointmentCheck = Patient::has('appointments')->count();
                Log::info('Patients with appointments: ' . $appointmentCheck);
            } catch (Exception $e) {
                Log::error('Error checking appointments: ' . $e->getMessage());
            }

            // Check birth date issues specifically
            try {
                $birthDateCheck = [
                    'total_records' => Patient::count(),
                    'not_null_birth_date' => Patient::whereNotNull('birth_date')->count(),
                    'empty_string_birth_date' => DB::table('patients')->whereRaw("birth_date = ''")->count(),
                    'valid_birth_date' => DB::table('patients')->whereRaw("birth_date IS NOT NULL AND birth_date != ''")->count(),
                ];
                Log::info('Birth date analysis: ', $birthDateCheck);
            } catch (Exception $e) {
                Log::error('Error analyzing birth dates: ' . $e->getMessage());
            }
        }

        Log::info('=== END DEBUG ===');
    }

    /**
     * Test relationships and model setup
     */
    private function testPatientRelationships()
    {
        Log::info('=== TESTING PATIENT RELATIONSHIPS ===');

        try {
            // Test basic Patient model
            $patientCount = Patient::count();
            Log::info('Patient model works, count: ' . $patientCount);

            if ($patientCount > 0) {
                $firstPatient = Patient::first();
                Log::info('First patient data: ', [
                    'id' => $firstPatient->id,
                    'name' => $firstPatient->name,
                    'birth_date' => $firstPatient->birth_date,
                    'birth_date_type' => gettype($firstPatient->birth_date),
                    'has_appointments_method' => method_exists($firstPatient, 'appointments'),
                    'guardian_id' => $firstPatient->guardian_id,
                ]);

                // Test appointments relationship
                try {
                    $appointmentsCount = $firstPatient->appointments()->count();
                    Log::info('First patient appointments count: ' . $appointmentsCount);
                } catch (Exception $e) {
                    Log::error('Appointments relationship error: ' . $e->getMessage());
                }

                // Test guardian relationship
                try {
                    $guardian = $firstPatient->guardian;
                    Log::info('First patient guardian: ' . ($guardian ? $guardian->name : 'null'));
                } catch (Exception $e) {
                    Log::error('Guardian relationship error: ' . $e->getMessage());
                }
            }
        } catch (Exception $e) {
            Log::error('Patient model test error: ' . $e->getMessage());
        }

        Log::info('=== END RELATIONSHIP TEST ===');
    }

    /**
     * Get filter options for dropdowns
     */
    private function getPatientFilterOptions()
    {
        return [
            'genders' => [
                ['value' => 'all', 'label' => 'All Genders'],
                ['value' => 'Male', 'label' => 'Male'],
                ['value' => 'Female', 'label' => 'Female'],
            ],
            'age_groups' => [
                ['value' => 'all', 'label' => 'All Ages'],
                ['value' => 'child', 'label' => 'Child (< 18 years)'],
                ['value' => 'adult', 'label' => 'Adult (18-60 years)'],
                ['value' => 'senior', 'label' => 'Senior (> 60 years)'],
            ],
            'blood_types' => collect(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
                ->map(fn($type) => ['value' => $type, 'label' => $type])
                ->prepend(['value' => 'all', 'label' => 'All Blood Types']),
            'guardians' => [
                ['value' => 'all', 'label' => 'All Patients'],
                ['value' => 'with_guardian', 'label' => 'With Guardian'],
                ['value' => 'without_guardian', 'label' => 'Without Guardian'],
            ],
            'rm_status' => [
                ['value' => 'all', 'label' => 'All Patients'],
                ['value' => 'with_rm', 'label' => 'With RM Number'],
                ['value' => 'without_rm', 'label' => 'Without RM Number'],
            ],
            'appointments' => [
                ['value' => 'all', 'label' => 'All Patients'],
                ['value' => 'with_appointments', 'label' => 'With Appointments'],
                ['value' => 'without_appointments', 'label' => 'Without Appointments'],
                ['value' => 'active_appointments', 'label' => 'With Active Appointments'],
            ],
            'periods' => [
                ['value' => '', 'label' => 'All Time'],
                ['value' => 'today', 'label' => 'Registered Today'],
                ['value' => 'this_week', 'label' => 'This Week'],
                ['value' => 'this_month', 'label' => 'This Month'],
                ['value' => 'this_year', 'label' => 'This Year'],
            ],
            'per_page_options' => [10, 15, 25, 50, 100],
        ];
    }

    /**
     * Get empty statistics structure
     */
    private function getEmptyStatistics()
    {
        return [
            'total' => 0,
            'with_guardians' => 0,
            'without_guardians' => 0,
            'with_appointments' => 0,
            'without_appointments' => 0,
            'today' => ['total' => 0, 'with_guardians' => 0],
            'this_week' => ['total' => 0, 'with_guardians' => 0],
            'this_month' => ['total' => 0, 'with_guardians' => 0],
            'genders' => [],
            'age_groups' => ['child' => 0, 'adult' => 0, 'senior' => 0],
            'blood_types' => [],
            'rm_status' => ['with_rm' => 0, 'without_rm' => 0],
            'guardian_rate' => 0,
            'appointment_rate' => 0,
            'rm_completion_rate' => 0,
            'avg_new_per_day' => 0,
            'recent_registrations' => 0,
        ];
    }

    // Rest of your existing methods (show, createProfile, storeProfile, etc.)
    // ... keep all your existing methods as they are ...

    public function show($id)
    {
        try {
            // Get patient with comprehensive relationships
            $patient = Patient::with([
                'user',
                'guardian',
                'medicalHistory'
            ])->findOrFail($id);

            // Get complete appointment history for this patient
            $appointmentHistory = Appointment::where('patient_id', $id)
                ->with([
                    'doctor:id,name',
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

            // Get appointment statistics
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

            // Get unique doctors this patient has had appointments with
            $doctorsCount = $appointmentHistory->pluck('doctor_id')->unique()->count();
            $appointmentStats['total_doctors'] = $doctorsCount;

            // Group appointments by doctor for better organization
            $appointmentsByDoctor = $appointmentHistory->groupBy('doctor_id')->map(function ($doctorAppointments) {
                $doctor = $doctorAppointments->first()->doctor;
                return [
                    'doctor' => $doctor,
                    'appointments' => $doctorAppointments,
                    'stats' => [
                        'total' => $doctorAppointments->count(),
                        'completed' => $doctorAppointments->where('status', Appointment::STATUS_COMPLETED)->count(),
                        'active' => $doctorAppointments->whereIn('status', [
                            Appointment::STATUS_SCHEDULED,
                            Appointment::STATUS_CONFIRMED,
                            Appointment::STATUS_IN_PROGRESS
                        ])->count(),
                        'last_appointment' => $doctorAppointments->first()->appointment_date,
                    ]
                ];
            });

            // Calculate age if birth_date exists
            if ($patient->birth_date) {
                $patient->age = Carbon::parse($patient->birth_date)->age;
            }

            // Get blood types for medical history form
            $bloodTypes = [
                'A+',
                'A-',
                'B+',
                'B-',
                'AB+',
                'AB-',
                'O+',
                'O-'
            ];

            Log::info('PatientController::show (Employee) - Patient loaded', [
                'patient_id' => $id,
                'appointment_count' => $appointmentHistory->count(),
                'doctors_count' => $doctorsCount,
                'has_medical_history' => (bool)$patient->medicalHistory
            ]);

            return Inertia::render('Karyawan/PatientSection/Show', [
                'patient' => $patient,
                'appointmentHistory' => $appointmentHistory,
                'appointmentStats' => $appointmentStats,
                'appointmentsByDoctor' => $appointmentsByDoctor,
                'bloodTypes' => $bloodTypes,
                'medicalHistory' => $patient->medicalHistory,
            ]);
        } catch (Exception $e) {
            Log::error('PatientController::show (Employee) - Error', [
                'patient_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('patients.index')
                ->with('error', 'Terjadi kesalahan saat memuat informasi pasien: ' . $e->getMessage());
        }
    }

    public function createProfile()
    {
        $patient = Patient::where('user_id', Auth::id())->first();

        if ($patient) {
            return redirect()->route('patient.dashboard');
        }
        return Inertia::render('Pasien/PatientProfileForm', [
            'patient' => $patient,
        ]);
    }

    public function storeProfile(Request $request)
    {
        // Validasi inputan
        $request->validate([
            'name' => 'required|string|max:255',
            'birth_place' => 'required|string|max:255',
            'birth_date' => 'required|date',
            'citizenship' => 'required|string|max:100',
            'gender' => 'required|string|max:10',
            'occupation' => 'nullable|string|max:255',
            'address' => 'required|string',
            'phone' => 'required|string|max:15',
            'blood_type' => 'required|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
        ]);

        if (Auth::user()->role == 'patient') {

            $existingPatient = Patient::where('user_id', Auth::id())->first();

            if ($existingPatient) {
                return redirect()->route('patient.profile');
            }

            // Create New Profile
            $patient = new Patient();
            $patient->user_id = Auth::id();
            $patient->name = $request->name;
            $patient->birth_place = $request->birth_place;
            $patient->birth_date = $request->birth_date;
            $patient->citizenship = $request->citizenship;
            $patient->gender = $request->gender;
            $patient->occupation = $request->occupation;
            $patient->address = $request->address;
            $patient->phone = $request->phone;
            $patient->blood_type = $request->blood_type;

            $patient->save();

            return redirect()->route('patient.profile', ['patient' => $patient]);
        }
        abort(403, 'Tidak memiliki hak akses');
    }

    public function showProfile()
    {
        $patient = Patient::where('user_id', Auth::id())->first();

        if (!$patient) {
            return redirect()->route('patient.form');
        }

        return Inertia::render('Pasien/PatientProfileShow', [
            'patient' => $patient,
        ]);
    }

    public function edit($id)
    {
        $patient = Patient::with('guardian')->findOrFail($id);
        $otherPatients = Patient::where('id', '!=', $id)->get();

        return Inertia::render('Karyawan/PatientSection/Edit', [
            'patient' => $patient,
            'patients' => $otherPatients
        ]);
    }

    public function update(Request $request, $id)
    {
        try {
            // Validate request data
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'birth_place' => 'required|string|max:255',
                'birth_date' => 'required|date',
                'citizenship' => 'required|string|max:100',
                'gender' => 'required|string|in:Male,Female',
                'occupation' => 'nullable|string|max:255',
                'address' => 'required|string',
                'phone' => 'required|string|max:15',
                'blood_type' => 'required|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
                'identity_type' => 'nullable|string|in:KTP,PASSPORT,GUARDIAN',
                'no_identity' => [
                    'nullable',
                    'required_if:identity_type,KTP,PASSPORT',
                    'string',
                    'max:16',
                    Rule::unique('patients', 'no_identity')->ignore($id)
                ],
                // Guardian validation
                'guardian_status' => 'nullable|string|in:Patient,Non Patient,None,Available Guardian',
                'guardian_name' => 'nullable|required_if:guardian_status,Non Patient|string|max:255',
                'guardian_relationship' => 'nullable|required_if:guardian_status,Patient,Non Patient|string|max:100',
                'guardian_phone_number' => 'nullable|required_if:guardian_status,Non Patient|string|max:15',
                'guardian_address' => 'nullable|required_if:guardian_status,Non Patient|string',
                'guardian_identity_type' => 'nullable|required_if:guardian_status,Non Patient|string|in:KTP,PASSPORT',
                'guardian_identity_number' => 'nullable|required_if:guardian_status,Non Patient|string|max:16',
                'guardian_patient_id' => 'nullable|required_if:guardian_status,Patient|exists:patients,id',
                'guardian_id' => 'nullable|exists:guardians,id',
            ]);

            $patient = Patient::findOrFail($id);

            // If identity type is empty, clear identity number
            if (empty($validated['identity_type'])) {
                $validated['no_identity'] = null;
            }

            // Generate RM number if null
            if (!$patient->no_rm) {
                $year = now()->format('y');
                $month = now()->format('m');

                // Find highest RM number with current year-month pattern
                $latestRM = Patient::where('no_rm', 'like', "RM-{$year}-{$month}-%")
                    ->orderBy('no_rm', 'desc')
                    ->value('no_rm');

                $sequence = 1;
                if ($latestRM) {
                    $parts = explode('-', $latestRM);
                    if (count($parts) >= 4) {
                        $sequence = (int) $parts[3] + 1;
                    }
                }

                $formattedSequence = str_pad($sequence, 2, '0', STR_PAD_LEFT);
                $no_rm = "RM-{$year}-{$month}-{$formattedSequence}";

                // Ensure the RM number is unique
                while (Patient::where('no_rm', $no_rm)->exists()) {
                    $sequence++;
                    $formattedSequence = str_pad($sequence, 2, '0', STR_PAD_LEFT);
                    $no_rm = "RM-{$year}-{$month}-{$formattedSequence}";
                }

                $patient->no_rm = $no_rm;
            }

            // Update patient data
            $patient->fill([
                'name' => $validated['name'],
                'birth_place' => $validated['birth_place'],
                'birth_date' => $validated['birth_date'],
                'citizenship' => $validated['citizenship'],
                'gender' => $validated['gender'],
                'occupation' => $validated['occupation'] ?? null,
                'address' => $validated['address'],
                'phone' => $validated['phone'],
                'blood_type' => $validated['blood_type'],
                'identity_type' => $validated['identity_type'],
                'no_identity' => $validated['no_identity'],
            ]);

            // Handle guardian logic (existing logic remains the same)
            if ($validated['guardian_status'] === 'Available Guardian') {
                if (isset($validated['guardian_id']) && $validated['guardian_id']) {
                    $patient->guardian_id = $validated['guardian_id'];
                }
            }

            if ($validated['identity_type'] === 'GUARDIAN') {
                if ($validated['guardian_status'] === 'None') {
                    $patient->guardian_id = null;
                } else if ($validated['guardian_status'] === 'Non Patient') {
                    if ($patient->guardian_id) {
                        $guardian = Guardian::findOrFail($patient->guardian_id);
                        $guardian->update([
                            'patient_id' => null,
                            'name' => $validated['guardian_name'],
                            'relationship' => $validated['guardian_relationship'],
                            'phone_number' => $validated['guardian_phone_number'],
                            'address' => $validated['guardian_address'],
                            'identity_type' => $validated['guardian_identity_type'],
                            'identity_number' => $validated['guardian_identity_number'],
                        ]);
                    } else {
                        $guardian = Guardian::create([
                            'name' => $validated['guardian_name'],
                            'relationship' => $validated['guardian_relationship'],
                            'phone_number' => $validated['guardian_phone_number'],
                            'address' => $validated['guardian_address'],
                            'identity_type' => $validated['guardian_identity_type'],
                            'identity_number' => $validated['guardian_identity_number'],
                        ]);

                        $patient->guardian_id = $guardian->id;
                    }
                } else if ($validated['guardian_status'] === 'Patient' && isset($validated['guardian_patient_id'])) {
                    $guardianPatient = Patient::find($validated['guardian_patient_id']);

                    if ($guardianPatient) {
                        if ($patient->guardian_id) {
                            $guardian = Guardian::findOrFail($patient->guardian_id);
                            $guardian->update([
                                'patient_id' => $guardianPatient->id,
                                'name' => $guardianPatient->name,
                                'phone_number' => $guardianPatient->phone,
                                'address' => $guardianPatient->address,
                                'identity_type' => $guardianPatient->identity_type,
                                'identity_number' => $guardianPatient->no_identity,
                                'relationship' => $validated['guardian_relationship'],
                            ]);
                        } else {
                            $guardian = Guardian::create([
                                'patient_id' => $guardianPatient->id,
                                'name' => $guardianPatient->name,
                                'phone_number' => $guardianPatient->phone,
                                'address' => $guardianPatient->address,
                                'identity_type' => $guardianPatient->identity_type,
                                'identity_number' => $guardianPatient->no_identity,
                                'relationship' => $validated['guardian_relationship'],
                            ]);

                            $patient->guardian_id = $guardian->id;
                        }
                    }
                }
            } else {
                $patient->guardian_id = null;
            }

            $patient->save();

            return redirect()->route('patients.show', $patient->id)
                ->with('success', 'Patient information updated successfully');
        } catch (ValidationException $e) {
            return redirect()->back()
                ->withErrors($e->validator)
                ->withInput()
                ->with('error', 'Please check the form for errors.');
        } catch (Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Error updating patient: ' . $e->getMessage());
        }
    }

    public function showAppointment($patientId, $appointmentId)
    {
        try {
            // Verify appointment belongs to this patient
            $appointment = Appointment::where('id', $appointmentId)
                ->where('patient_id', $patientId)
                ->with(['patient', 'doctor'])
                ->firstOrFail();

            Log::info('PatientController::showAppointment (Employee) - Navigation', [
                'patient_id' => $patientId,
                'appointment_id' => $appointmentId,
                'doctor_id' => $appointment->doctor_id
            ]);

            // Redirect to employee appointment show page (read-only)
            return redirect()->route('employee.appointments.show', $appointmentId)
                ->with('success', 'Membuka appointment yang dipilih dari riwayat pasien.');
        } catch (Exception $e) {
            Log::error('PatientController::showAppointment (Employee) - Error', [
                'patient_id' => $patientId,
                'appointment_id' => $appointmentId,
                'error' => $e->getMessage()
            ]);

            return redirect()->route('patients.show', $patientId)
                ->with('error', 'Terjadi kesalahan saat membuka appointment: ' . $e->getMessage());
        }
    }

    /**
     * Get patient appointment history for AJAX calls (Employee access)
     */
    public function getAppointmentHistory($patientId)
    {
        try {
            // Verify patient exists
            $patient = Patient::findOrFail($patientId);

            // Get appointment history for this patient
            $appointmentHistory = Appointment::where('patient_id', $patientId)
                ->with([
                    'doctor:id,name',
                    'schedule',
                    'queue',
                    'odontogram' => function ($query) {
                        $query->select('id', 'appointment_id', 'examination_date', 'is_finalized', 'd_value', 'm_value', 'f_value');
                    }
                ])
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

            // Get appointment statistics
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
            ];

            return response()->json([
                'success' => true,
                'appointmentHistory' => $appointmentHistory,
                'appointmentStats' => $appointmentStats,
                'patientId' => $patientId,
            ]);
        } catch (Exception $e) {
            Log::error('PatientController::getAppointmentHistory (Employee) - Error', [
                'patient_id' => $patientId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to load appointment history'
            ], 500);
        }
    }

    /**
     * Get patient medical summary for dashboard widgets
     */
    public function getMedicalSummary($patientId)
    {
        try {
            $patient = Patient::with(['medicalHistory', 'appointments.doctor'])
                ->findOrFail($patientId);

            // Calculate medical summary statistics
            $appointmentCount = $patient->appointments->count();
            $doctorCount = $patient->appointments->pluck('doctor_id')->unique()->count();
            $lastAppointment = $patient->appointments->sortByDesc('appointment_date')->first();

            $summary = [
                'patient_id' => $patientId,
                'patient_name' => $patient->name,
                'blood_type' => $patient->blood_type,
                'age' => $patient->birth_date ? Carbon::parse($patient->birth_date)->age : null,
                'has_medical_history' => (bool) $patient->medicalHistory,
                'appointment_count' => $appointmentCount,
                'doctor_count' => $doctorCount,
                'last_appointment_date' => $lastAppointment?->appointment_date,
                'last_appointment_doctor' => $lastAppointment?->doctor->name,
                'medical_alerts' => [],
            ];

            // Add medical alerts if medical history exists
            if ($patient->medicalHistory) {
                if ($patient->medicalHistory->allergies) {
                    $summary['medical_alerts'][] = [
                        'type' => 'allergy',
                        'message' => 'Alergi: ' . $patient->medicalHistory->allergies
                    ];
                }

                if ($patient->medicalHistory->chronic_diseases) {
                    $summary['medical_alerts'][] = [
                        'type' => 'chronic',
                        'message' => 'Penyakit Kronis: ' . $patient->medicalHistory->chronic_diseases
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'summary' => $summary
            ]);
        } catch (Exception $e) {
            Log::error('PatientController::getMedicalSummary (Employee) - Error', [
                'patient_id' => $patientId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to load medical summary'
            ], 500);
        }
    }

    /**
     * Enhanced patient search with filters for employee dashboard
     */
    public function searchPatients(Request $request)
    {
        try {
            $query = $request->input('query', '');
            $limit = $request->input('limit', 10);
            $includeStats = $request->boolean('include_stats', false);

            $patients = Patient::query()
                ->when($query, function ($q) use ($query) {
                    return $q->where(function ($subQ) use ($query) {
                        $subQ->where('name', 'like', "%{$query}%")
                            ->orWhere('phone', 'like', "%{$query}%")
                            ->orWhere('no_rm', 'like', "%{$query}%");
                    });
                })
                ->with(['user:id,email', 'guardian:id,name'])
                ->select(['id', 'name', 'phone', 'no_rm', 'blood_type', 'gender', 'birth_date', 'user_id', 'guardian_id'])
                ->limit($limit)
                ->get();

            // Add statistics if requested
            if ($includeStats) {
                $patients->each(function ($patient) {
                    $appointmentStats = Appointment::where('patient_id', $patient->id)
                        ->selectRaw('
                        COUNT(*) as total,
                        COUNT(CASE WHEN status = ? THEN 1 END) as completed,
                        COUNT(CASE WHEN status IN (?, ?, ?) THEN 1 END) as active
                    ', [
                            Appointment::STATUS_COMPLETED,
                            Appointment::STATUS_SCHEDULED,
                            Appointment::STATUS_CONFIRMED,
                            Appointment::STATUS_IN_PROGRESS
                        ])
                        ->first();

                    $patient->appointment_stats = [
                        'total' => $appointmentStats->total ?? 0,
                        'completed' => $appointmentStats->completed ?? 0,
                        'active' => $appointmentStats->active ?? 0,
                    ];

                    // Calculate age
                    if ($patient->birth_date) {
                        $patient->age = Carbon::parse($patient->birth_date)->age;
                    }
                });
            }

            return response()->json([
                'success' => true,
                'patients' => $patients,
                'count' => $patients->count()
            ]);
        } catch (Exception $e) {
            Log::error('PatientController::searchPatients (Employee) - Error', [
                'error' => $e->getMessage(),
                'query' => $request->input('query')
            ]);

            return response()->json([
                'error' => 'Failed to search patients'
            ], 500);
        }
    }
}
