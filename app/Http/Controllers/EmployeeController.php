<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Employee;
use App\Models\Doctor;
use App\Models\Guardian;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class EmployeeController extends Controller
{
    /**
     * Enhanced index with filtering, sorting, statistics, and pagination
     */
    public function index(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 10);

            // Get filter parameters
            $search = $request->input('search', '');
            $sortField = $request->input('sort', 'created_at');
            $sortDirection = $request->input('direction', 'desc');
            $filterPosition = $request->input('filter_position', 'all');
            $filterUserStatus = $request->input('filter_user_status', 'all');
            $period = $request->input('period', '');

            // Start query with relationships
            $query = Employee::query()
                ->with(['user'])
                ->select([
                    'id',
                    'code',
                    'name',
                    'position',
                    'phone',
                    'address',
                    'user_id',
                    'created_at'
                ]);

            // Apply search
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('position', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%");
                });
            }

            // Apply position filter
            if ($filterPosition !== 'all') {
                $query->where('position', $filterPosition);
            }

            // Apply user status filter
            if ($filterUserStatus !== 'all') {
                if ($filterUserStatus === 'with_user') {
                    $query->whereHas('user');
                } elseif ($filterUserStatus === 'without_user') {
                    $query->whereDoesntHave('user');
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
            $allowedSortFields = ['id', 'code', 'name', 'position', 'phone', 'created_at'];
            if (in_array($sortField, $allowedSortFields)) {
                $query->orderBy($sortField, $sortDirection);
            }

            // Add secondary sorting for consistency
            $query->orderBy('id', 'asc');

            // Get paginated results
            $employees = $query->paginate($perPage)->withQueryString();

            // Add computed attributes
            $employees->getCollection()->transform(function ($employee) {
                // Get email from user relationship
                $employee->email = $employee->user ? $employee->user->email : null;

                // Check if user account exists
                $employee->has_user_account = $employee->user !== null;

                // Get user verification status
                $employee->user_verified = $employee->user && $employee->user->email_verified_at !== null;

                return $employee;
            });

            // Generate statistics
            $statistics = $this->generateStatistics($request);

            // Get filter options
            $filterOptions = $this->getFilterOptions();

            // Return response
            return Inertia::render('Karyawan/EmployeeSection/Index', [
                'employees' => $employees,
                'statistics' => $statistics,
                'filterOptions' => $filterOptions,
                'filters' => [
                    'search' => $search,
                    'filter_position' => $filterPosition,
                    'filter_user_status' => $filterUserStatus,
                    'period' => $period,
                    'per_page' => $perPage,
                ],
                'sorting' => [
                    'field' => $sortField,
                    'direction' => $sortDirection,
                ],
            ]);
        } catch (Exception $e) {
            Log::error('EmployeeController::index - Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);

            return Inertia::render('Karyawan/EmployeeSection/Index', [
                'employees' => collect([]),
                'statistics' => [],
                'filterOptions' => [],
                'filters' => $request->only(['search', 'filter_position', 'filter_user_status', 'period']),
                'error' => 'An error occurred while loading employees data.'
            ]);
        }
    }

    /**
     * Generate employee statistics
     */
    private function generateStatistics(Request $request)
    {
        $baseQuery = Employee::query();

        // Apply same filters as main query for relevant statistics
        if ($request->filled('filter_position') && $request->filter_position !== 'all') {
            $baseQuery->where('position', $request->filter_position);
        }

        // Get today's new employees
        $todayQuery = (clone $baseQuery)->whereDate('created_at', today());

        // Get this week's new employees
        $thisWeekQuery = (clone $baseQuery)->whereBetween('created_at', [
            now()->startOfWeek(),
            now()->endOfWeek()
        ]);

        // Get this month's new employees
        $thisMonthQuery = (clone $baseQuery)->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year);

        // User account statistics
        $withUserQuery = (clone $baseQuery)->whereHas('user');
        $withoutUserQuery = (clone $baseQuery)->whereDoesntHave('user');

        return [
            // Overall statistics (based on current filters)
            'total' => (clone $baseQuery)->count(),
            'with_users' => $withUserQuery->count(),
            'without_users' => $withoutUserQuery->count(),

            // Time-based statistics
            'today' => [
                'total' => $todayQuery->count(),
                'with_users' => (clone $todayQuery)->whereHas('user')->count(),
            ],

            'this_week' => [
                'total' => $thisWeekQuery->count(),
                'with_users' => (clone $thisWeekQuery)->whereHas('user')->count(),
            ],

            'this_month' => [
                'total' => $thisMonthQuery->count(),
                'with_users' => (clone $thisMonthQuery)->whereHas('user')->count(),
            ],

            // Position statistics
            'positions' => $this->getPositionStats($baseQuery),

            // User account rate
            'user_account_rate' => $this->calculateUserAccountRate($baseQuery),

            // User verification statistics
            'user_verification' => [
                'verified' => $this->getVerifiedUserCount($baseQuery),
                'unverified' => $this->getUnverifiedUserCount($baseQuery),
            ],

            // Verification rate
            'verification_rate' => $this->calculateVerificationRate($baseQuery),

            // Average new employees per day (last 30 days)
            'avg_new_per_day' => $this->calculateAverageNewPerDay(),

            // Recent registrations
            'recent_registrations' => (clone $baseQuery)->where('created_at', '>=', now()->subDays(7))->count(),
        ];
    }

    /**
     * Get position statistics
     */
    private function getPositionStats($baseQuery)
    {
        return (clone $baseQuery)
            ->select('position', DB::raw('count(*) as count'))
            ->whereNotNull('position')
            ->groupBy('position')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->pluck('count', 'position');
    }

    /**
     * Calculate user account rate
     */
    private function calculateUserAccountRate($baseQuery)
    {
        $total = (clone $baseQuery)->count();
        $withUsers = (clone $baseQuery)->whereHas('user')->count();

        if ($total === 0) {
            return 0;
        }

        return round(($withUsers / $total) * 100, 1);
    }

    /**
     * Get verified user count
     */
    private function getVerifiedUserCount($baseQuery)
    {
        return (clone $baseQuery)
            ->whereHas('user', function ($query) {
                $query->whereNotNull('email_verified_at');
            })
            ->count();
    }

    /**
     * Get unverified user count
     */
    private function getUnverifiedUserCount($baseQuery)
    {
        return (clone $baseQuery)
            ->whereHas('user', function ($query) {
                $query->whereNull('email_verified_at');
            })
            ->count();
    }

    /**
     * Calculate verification rate
     */
    private function calculateVerificationRate($baseQuery)
    {
        $totalWithUsers = (clone $baseQuery)->whereHas('user')->count();
        $verifiedUsers = $this->getVerifiedUserCount($baseQuery);

        if ($totalWithUsers === 0) {
            return 0;
        }

        return round(($verifiedUsers / $totalWithUsers) * 100, 1);
    }

    /**
     * Calculate average new employees per day
     */
    private function calculateAverageNewPerDay()
    {
        $thirtyDaysAgo = now()->subDays(30);
        $employeesLast30Days = Employee::where('created_at', '>=', $thirtyDaysAgo)->count();

        return round($employeesLast30Days / 30, 1);
    }

    /**
     * Get filter options for dropdowns
     */
    private function getFilterOptions()
    {
        $positions = Employee::select('position')
            ->distinct()
            ->whereNotNull('position')
            ->orderBy('position')
            ->pluck('position')
            ->map(function ($position) {
                return ['value' => $position, 'label' => $position];
            })
            ->prepend(['value' => 'all', 'label' => 'All Positions']);

        return [
            'positions' => $positions,
            'user_status' => [
                ['value' => 'all', 'label' => 'All Employees'],
                ['value' => 'with_user', 'label' => 'With User Account'],
                ['value' => 'without_user', 'label' => 'Without User Account'],
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
     * Show employee details
     */
    public function show(Employee $employee)
    {
        $employee->load('user:id,email,created_at');

        return Inertia::render('Karyawan/EmployeeSection/Show', [
            'employee' => [
                'id' => $employee->id,
                'code' => $employee->code,
                'name' => $employee->name,
                'position' => $employee->position,
                'phone' => $employee->phone,
                'address' => $employee->address,
                'user' => $employee->user ? [
                    'email' => $employee->user->email,
                    'created_at' => $employee->user->created_at,
                ] : null,
                'created_at' => $employee->created_at,
            ],
        ]);
    }

    /**
     * Show edit form
     */
    public function edit(Employee $employee)
    {
        $employee->load('user:id,email');

        return Inertia::render('Karyawan/EmployeeSection/Edit', [
            'employee' => $employee,
        ]);
    }

    /**
     * Update employee
     */
    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'phone' => 'required|string|max:15|unique:employees,phone,' . $employee->id,
            'address' => 'required|string',
        ]);

        $employee->update($validated);

        return redirect()->route('employees.show', $employee->id)
            ->with('success', 'Employee updated successfully');
    }

    // ===== USER CREATION METHODS (unchanged) =====

    public function createUser()
    {
        return Inertia::render('Karyawan/UserSection/CreateUser');
    }

    public function storeUser(Request $request)
    {
        try {
            // Validate User
            $validationRules = [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:8',
                'role' => 'required|string|in:employee,doctor,patient',
            ];

            // Validate Patient
            if ($request->input('role') === 'patient') {
                $validationRules = array_merge($validationRules, [
                    'birth_place' => 'required|string|max:255',
                    'birth_date' => 'required|date',
                    'citizenship' => 'required|string|max:100',
                    'gender' => 'required|string|in:Male,Female',
                    'occupation' => 'nullable|string|max:255',
                    'address' => 'nullable|string',
                    'phone' => 'nullable|string|max:15|unique:patients,phone',
                    'blood_type' => 'required|string|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
                    'identity_type' => 'nullable|string|in:KTP,PASSPORT,GUARDIAN',
                    'no_identity' => 'nullable|string|max:16|unique:patients,no_identity',
                ]);

                if ($request->input('identity_type') === 'KTP' || $request->input('identity_type') === 'PASSPORT') {
                    $validationRules['no_identity'] = 'required|string|max:16|unique:patients,no_identity';
                }

                // Validate Guardian
                if ($request->input('identity_type') === 'GUARDIAN') {
                    $validationRules['guardian_status'] = 'required|string|in:None,Patient,Non Patient,Available Guardian';

                    if ($request->input('guardian_status') === 'Non Patient') {
                        $validationRules = array_merge($validationRules, [
                            'guardian_name' => 'required|string|max:255',
                            'guardian_relationship' => 'required|string|max:100',
                            'guardian_phone_number' => 'required|string|max:15',
                            'guardian_address' => 'required|string',
                            'guardian_identity_type' => 'required|string|in:KTP,PASSPORT',
                            'guardian_identity_number' => 'required|string|max:16',
                        ]);
                    } elseif ($request->input('guardian_status') === 'Patient') {
                        $validationRules = array_merge($validationRules, [
                            'guardian_relationship' => 'required|string|max:100',
                            'guardian_patient_id' => 'required|exists:patients,id',
                        ]);
                    } elseif ($request->input('guardian_status') === 'Available Guardian') {
                        $validationRules = array_merge($validationRules, [
                            'guardian_relationship' => 'required|string|max:100',
                            'guardian_id' => 'required|exists:guardians,id',
                        ]);
                    }
                }
                // Validate Doctor
            } elseif ($request->input('role') === 'doctor') {
                $validationRules = array_merge($validationRules, [
                    'specialization' => 'required|string|max:255',
                    'license_number' => 'required|string|max:255|unique:doctors,license_number',
                    'license_start_date' => 'required|date',
                    'license_expiry_date' => 'required|date|after:license_start_date',
                    'address' => 'required|string',
                    'phone' => 'required|string|max:15|unique:doctors,phone',
                ]);
                // Validate Employee
            } elseif ($request->input('role') === 'employee') {
                $validationRules = array_merge($validationRules, [
                    'position' => 'required|string|max:255',
                    'address' => 'required|string',
                    'phone' => 'required|string|max:15|unique:employees,phone',
                ]);
            }

            // Validate the request
            $validated = $request->validate($validationRules);

            DB::beginTransaction();

            // Create User
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
            ]);

            // Employee
            if ($validated['role'] === 'employee') {
                Employee::create([
                    'user_id' => $user->id,
                    'code' => 'EMP-' . strtoupper(Str::random(5)),
                    'name' => $validated['name'],
                    'position' => $validated['position'],
                    'phone' => $validated['phone'],
                    'address' => $validated['address'],
                ]);
            }

            // Doctor
            if ($validated['role'] === 'doctor') {
                Doctor::create([
                    'user_id' => $user->id,
                    'code' => 'DOC-' . strtoupper(Str::random(5)),
                    'name' => $validated['name'],
                    'specialization' => $validated['specialization'],
                    'license_number' => $validated['license_number'],
                    'license_start_date' => $validated['license_start_date'],
                    'license_expiry_date' => $validated['license_expiry_date'],
                    'address' => $validated['address'],
                    'phone' => $validated['phone'],
                ]);
            }

            // Patient
            if ($validated['role'] === 'patient') {
                $year = now()->format('y');
                $month = now()->format('m');

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

                // Ensure unique RM number
                while (Patient::where('no_rm', $no_rm)->exists()) {
                    $sequence++;
                    $formattedSequence = str_pad($sequence, 2, '0', STR_PAD_LEFT);
                    $no_rm = "RM-{$year}-{$month}-{$formattedSequence}";
                }

                $patient = Patient::create([
                    'user_id' => $user->id,
                    'name' => $validated['name'],
                    'blood_type' => $validated['blood_type'],
                    'birth_place' => $validated['birth_place'],
                    'birth_date' => $validated['birth_date'],
                    'citizenship' => $validated['citizenship'],
                    'identity_type' => $validated['identity_type'] ?? null,
                    'no_identity' => $validated['no_identity'] ?? null,
                    'gender' => $validated['gender'],
                    'occupation' => $validated['occupation'] ?? null,
                    'phone' => $validated['phone'] ?? null,
                    'address' => $validated['address'] ?? null,
                    'no_rm' => $no_rm,
                ]);

                // Handle guardian logic only if identity_type is GUARDIAN
                if (isset($validated['identity_type']) && $validated['identity_type'] === 'GUARDIAN') {
                    // Handle Available Guardian
                    if ($validated['guardian_status'] === 'Available Guardian' && isset($validated['guardian_id'])) {
                        $patient->update(['guardian_id' => $validated['guardian_id']]);
                    }
                    // Handle Non-Patient Guardian
                    else if ($validated['guardian_status'] === 'Non Patient') {
                        $guardian = Guardian::create([
                            'name' => $validated['guardian_name'],
                            'relationship' => $validated['guardian_relationship'],
                            'phone_number' => $validated['guardian_phone_number'],
                            'address' => $validated['guardian_address'],
                            'identity_type' => $validated['guardian_identity_type'],
                            'identity_number' => $validated['guardian_identity_number'],
                        ]);
                        $patient->update(['guardian_id' => $guardian->id]);
                    }
                    // Handle Patient as Guardian
                    else if ($validated['guardian_status'] === 'Patient' && isset($validated['guardian_patient_id'])) {
                        $guardianPatient = Patient::find($validated['guardian_patient_id']);
                        if ($guardianPatient) {
                            $guardian = Guardian::create([
                                'patient_id' => $guardianPatient->id,
                                'name' => $guardianPatient->name,
                                'phone_number' => $guardianPatient->phone,
                                'address' => $guardianPatient->address,
                                'identity_type' => $guardianPatient->identity_type,
                                'identity_number' => $guardianPatient->no_identity,
                                'relationship' => $validated['guardian_relationship'],
                            ]);

                            $patient->update(['guardian_id' => $guardian->id]);
                        }
                    }
                }
            }

            DB::commit();

            return redirect()->route('employee.create')
                ->with('success', 'User created successfully');
        } catch (ValidationException $e) {
            // If validation fails, roll back any DB changes
            DB::rollBack();

            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput()
                ->with('error', 'Please check the form for errors.');
        } catch (Exception $e) {
            // For any other exception, roll back and show error
            DB::rollBack();

            return redirect()->back()
                ->withInput()
                ->with('error', 'Error creating user: ' . $e->getMessage());
        }
    }

    // ===== API METHODS (unchanged) =====

    public function patientsAPI(Request $request)
    {
        $query = $request->get('query', '');

        $patients = Patient::where('name', 'like', '%' . $query . '%')
            ->whereNotNull('no_rm')
            ->orWhere('no_rm', 'like', '%' . $query . '%')
            ->select('id', 'no_rm', 'name', 'identity_type', 'no_identity', 'phone', 'address')
            ->get();

        return response()->json($patients);
    }

    public function guardiansAPI(Request $request)
    {
        $query = $request->get('query', '');

        $guardians = Guardian::where('name', 'like', '%' . $query . '%')
            ->orWhere('phone_number', 'like', '%' . $query . '%')
            ->select('id', 'name', 'relationship', 'identity_type', 'identity_number', 'phone_number', 'address')
            ->get();

        return response()->json($guardians);
    }

    public function guardianShow($id)
    {
        $guardian = Guardian::findOrFail($id);
        return response()->json($guardian);
    }
}
