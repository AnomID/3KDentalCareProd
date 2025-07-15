<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            $perPage = $request->get('per_page', 10); // Default to 10 items per page

            // Get filter parameters
            $search = $request->input('search', '');
            $sortField = $request->input('sort', 'created_at');
            $sortDirection = $request->input('direction', 'desc');
            $filterByRole = $request->input('filter_role', 'all');
            $filterByProfile = $request->input('filter_profile', 'all');
            $period = $request->input('period', '');

            // Start query with relationships
            $query = User::query()
                ->with(['patient', 'doctor', 'employee'])
                ->select([
                    'id',
                    'name',
                    'email',
                    'role',
                    'created_at',
                    'email_verified_at'
                ]);

            // Apply search
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('role', 'like', "%{$search}%");
                });
            }

            // Apply role filter
            if ($filterByRole !== 'all') {
                $query->where('role', $filterByRole);
            }

            // Apply profile completion filter
            if ($filterByProfile !== 'all') {
                if ($filterByProfile === 'complete') {
                    $query->where(function ($q) {
                        $q->where(function ($subQ) {
                            // Patient with profile
                            $subQ->where('role', 'patient')
                                ->whereHas('patient');
                        })->orWhere(function ($subQ) {
                            // Doctor with profile
                            $subQ->where('role', 'doctor')
                                ->whereHas('doctor');
                        })->orWhere(function ($subQ) {
                            // Employee with profile
                            $subQ->where('role', 'employee')
                                ->whereHas('employee');
                        })->orWhere('role', 'admin'); // Admin doesn't need profile
                    });
                } elseif ($filterByProfile === 'incomplete') {
                    $query->where(function ($q) {
                        $q->where(function ($subQ) {
                            // Patient without profile
                            $subQ->where('role', 'patient')
                                ->whereDoesntHave('patient');
                        })->orWhere(function ($subQ) {
                            // Doctor without profile
                            $subQ->where('role', 'doctor')
                                ->whereDoesntHave('doctor');
                        })->orWhere(function ($subQ) {
                            // Employee without profile
                            $subQ->where('role', 'employee')
                                ->whereDoesntHave('employee');
                        });
                    });
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
            $allowedSortFields = ['id', 'name', 'email', 'role', 'created_at'];
            if (in_array($sortField, $allowedSortFields)) {
                $query->orderBy($sortField, $sortDirection);
            }

            // Add secondary sorting for consistency
            $query->orderBy('id', 'asc');

            // Get paginated results
            $users = $query->paginate($perPage)->withQueryString();

            // Add computed attributes
            $users->getCollection()->transform(function ($user) {
                // Check if user has complete profile
                $user->has_complete_profile = $this->hasCompleteProfile($user);

                // Get profile data
                $user->profile_data = $this->getProfileData($user);

                return $user;
            });

            // Generate statistics
            $statistics = $this->generateStatistics($request);

            // Get filter options
            $filterOptions = $this->getFilterOptions();

            // Return response
            return Inertia::render('Karyawan/UserSection/Index', [
                'users' => $users,
                'statistics' => $statistics,
                'filterOptions' => $filterOptions,
                'filters' => [
                    'search' => $search,
                    'filter_role' => $filterByRole,
                    'filter_profile' => $filterByProfile,
                    'period' => $period,
                    'per_page' => $perPage,
                ],
                'sorting' => [
                    'field' => $sortField,
                    'direction' => $sortDirection,
                ],
            ]);
        } catch (Exception $e) {
            Log::error('UserController::index - Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);

            return Inertia::render('Karyawan/UserSection/Index', [
                'users' => collect([]),
                'statistics' => [],
                'filterOptions' => [],
                'filters' => $request->only(['search', 'filter_role', 'filter_profile', 'period']),
                'error' => 'An error occurred while loading users data.'
            ]);
        }
    }

    /**
     * Check if user has complete profile based on role
     */
    private function hasCompleteProfile($user)
    {
        switch ($user->role) {
            case 'patient':
                return $user->patient !== null;
            case 'doctor':
                return $user->doctor !== null;
            case 'employee':
                return $user->employee !== null;
            case 'admin':
                return true; // Admin doesn't need profile
            default:
                return false;
        }
    }

    /**
     * Get profile data for user
     */
    private function getProfileData($user)
    {
        switch ($user->role) {
            case 'patient':
                return $user->patient ? [
                    'name' => $user->patient->name,
                    'phone' => $user->patient->phone,
                    'no_rm' => $user->patient->no_rm,
                ] : null;
            case 'doctor':
                return $user->doctor ? [
                    'name' => $user->doctor->name,
                    'specialization' => $user->doctor->specialization,
                    'license_number' => $user->doctor->license_number,
                ] : null;
            case 'employee':
                return $user->employee ? [
                    'name' => $user->employee->name,
                    'position' => $user->employee->position,
                    'employee_id' => $user->employee->employee_id,
                ] : null;
            default:
                return null;
        }
    }

    /**
     * Generate user statistics
     */
    private function generateStatistics(Request $request)
    {
        $baseQuery = User::query();

        // Apply same filters as main query for relevant statistics
        if ($request->filled('filter_role') && $request->filter_role !== 'all') {
            $baseQuery->where('role', $request->filter_role);
        }

        // Get today's new users
        $todayQuery = (clone $baseQuery)->whereDate('created_at', today());

        // Get this week's new users
        $thisWeekQuery = (clone $baseQuery)->whereBetween('created_at', [
            now()->startOfWeek(),
            now()->endOfWeek()
        ]);

        // Get this month's new users
        $thisMonthQuery = (clone $baseQuery)->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year);

        // Role-based statistics
        $adminQuery = (clone $baseQuery)->where('role', 'admin');
        $doctorQuery = (clone $baseQuery)->where('role', 'doctor');
        $employeeQuery = (clone $baseQuery)->where('role', 'employee');
        $patientQuery = (clone $baseQuery)->where('role', 'patient');

        return [
            // Overall statistics (based on current filters)
            'total' => (clone $baseQuery)->count(),
            'verified' => (clone $baseQuery)->whereNotNull('email_verified_at')->count(),
            'unverified' => (clone $baseQuery)->whereNull('email_verified_at')->count(),

            // Time-based statistics
            'today' => [
                'total' => $todayQuery->count(),
                'verified' => (clone $todayQuery)->whereNotNull('email_verified_at')->count(),
            ],

            'this_week' => [
                'total' => $thisWeekQuery->count(),
                'verified' => (clone $thisWeekQuery)->whereNotNull('email_verified_at')->count(),
            ],

            'this_month' => [
                'total' => $thisMonthQuery->count(),
                'verified' => (clone $thisMonthQuery)->whereNotNull('email_verified_at')->count(),
            ],

            // Role-based statistics
            'roles' => [
                'admin' => $adminQuery->count(),
                'doctor' => $doctorQuery->count(),
                'employee' => $employeeQuery->count(),
                'patient' => $patientQuery->count(),
            ],

            // Profile completion statistics
            'profile_completion' => [
                'complete' => $this->getCompleteProfileCount($baseQuery),
                'incomplete' => $this->getIncompleteProfileCount($baseQuery),
            ],

            // Verification rate
            'verification_rate' => $this->calculateVerificationRate($baseQuery),

            // Average new users per day (last 30 days)
            'avg_new_per_day' => $this->calculateAverageNewPerDay(),

            // Recent activity
            'recent_registrations' => (clone $baseQuery)->where('created_at', '>=', now()->subDays(7))->count(),
        ];
    }

    /**
     * Get count of users with complete profiles
     */
    private function getCompleteProfileCount($baseQuery)
    {
        $users = (clone $baseQuery)->with(['patient', 'doctor', 'employee'])->get();
        return $users->filter(function ($user) {
            return $this->hasCompleteProfile($user);
        })->count();
    }

    /**
     * Get count of users with incomplete profiles
     */
    private function getIncompleteProfileCount($baseQuery)
    {
        $users = (clone $baseQuery)->with(['patient', 'doctor', 'employee'])->get();
        return $users->filter(function ($user) {
            return !$this->hasCompleteProfile($user);
        })->count();
    }

    /**
     * Calculate email verification rate
     */
    private function calculateVerificationRate($baseQuery)
    {
        $total = (clone $baseQuery)->count();
        $verified = (clone $baseQuery)->whereNotNull('email_verified_at')->count();

        if ($total === 0) {
            return 0;
        }

        return round(($verified / $total) * 100, 1);
    }

    /**
     * Calculate average new users per day
     */
    private function calculateAverageNewPerDay()
    {
        $thirtyDaysAgo = now()->subDays(30);
        $usersLast30Days = User::where('created_at', '>=', $thirtyDaysAgo)->count();

        return round($usersLast30Days / 30, 1);
    }

    /**
     * Get filter options for dropdowns
     */
    private function getFilterOptions()
    {
        return [
            'roles' => [
                ['value' => 'all', 'label' => 'All Roles'],
                ['value' => 'admin', 'label' => 'Admin'],
                ['value' => 'doctor', 'label' => 'Doctor'],
                ['value' => 'employee', 'label' => 'Employee'],
                ['value' => 'patient', 'label' => 'Patient'],
            ],
            'profile_status' => [
                ['value' => 'all', 'label' => 'All Users'],
                ['value' => 'complete', 'label' => 'Complete Profile'],
                ['value' => 'incomplete', 'label' => 'Incomplete Profile'],
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

    public function show($id)
    {
        $user = User::with(['patient', 'doctor', 'employee'])->findOrFail($id);

        return Inertia::render('Karyawan/UserSection/Show', [
            'user' => $user,
            'has_complete_profile' => $this->hasCompleteProfile($user),
            'profile_data' => $this->getProfileData($user),
        ]);
    }

    public function updatePassword(Request $request, $id)
    {
        $request->validate([
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::findOrFail($id);
        $user->password = Hash::make($request->new_password);
        $user->save();

        return redirect()->back()->with('success', 'Password updated successfully.');
    }
}
