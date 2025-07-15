<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\User;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Exception;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class DoctorController extends Controller
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
            $filterSpecialization = $request->input('filter_specialization', 'all');
            $filterLicenseStatus = $request->input('filter_license_status', 'all');
            $period = $request->input('period', '');

            // Start query with relationships
            $query = Doctor::query()
                ->with(['user'])
                ->select([
                    'id',
                    'code',
                    'name',
                    'specialization',
                    'license_number',
                    'license_start_date',
                    'license_expiry_date',
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
                        ->orWhere('license_number', 'like', "%{$search}%")
                        ->orWhere('specialization', 'like', "%{$search}%");
                });
            }

            // Apply specialization filter
            if ($filterSpecialization !== 'all') {
                $query->where('specialization', $filterSpecialization);
            }

            // Apply license status filter
            if ($filterLicenseStatus !== 'all') {
                if ($filterLicenseStatus === 'active') {
                    $query->where('license_expiry_date', '>', now());
                } elseif ($filterLicenseStatus === 'expired') {
                    $query->where('license_expiry_date', '<=', now());
                } elseif ($filterLicenseStatus === 'expiring_soon') {
                    $query->whereBetween('license_expiry_date', [now(), now()->addDays(30)]);
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
            $allowedSortFields = ['id', 'code', 'name', 'specialization', 'license_expiry_date', 'created_at'];
            if (in_array($sortField, $allowedSortFields)) {
                $query->orderBy($sortField, $sortDirection);
            }

            // Add secondary sorting for consistency
            $query->orderBy('id', 'asc');

            // Get paginated results
            $doctors = $query->paginate($perPage)->withQueryString();

            // Add computed attributes
            $doctors->getCollection()->transform(function ($doctor) {
                // Check license status
                $doctor->license_status = $this->getLicenseStatus($doctor);

                // Get email from user relationship
                $doctor->email = $doctor->user ? $doctor->user->email : null;

                // Get appointment count (if needed)
                $doctor->appointment_count = $this->getAppointmentCount($doctor->id);

                return $doctor;
            });

            // Generate statistics
            $statistics = $this->generateStatistics($request);

            // Get filter options
            $filterOptions = $this->getFilterOptions();

            // Return response
            return Inertia::render('Karyawan/DoctorSection/Index', [
                'doctors' => $doctors,
                'statistics' => $statistics,
                'filterOptions' => $filterOptions,
                'filters' => [
                    'search' => $search,
                    'filter_specialization' => $filterSpecialization,
                    'filter_license_status' => $filterLicenseStatus,
                    'period' => $period,
                    'per_page' => $perPage,
                ],
                'sorting' => [
                    'field' => $sortField,
                    'direction' => $sortDirection,
                ],
            ]);
        } catch (Exception $e) {
            Log::error('DoctorController::index - Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);

            return Inertia::render('Karyawan/DoctorSection/Index', [
                'doctors' => collect([]),
                'statistics' => [],
                'filterOptions' => [],
                'filters' => $request->only(['search', 'filter_specialization', 'filter_license_status', 'period']),
                'error' => 'An error occurred while loading doctors data.'
            ]);
        }
    }

    /**
     * Get license status
     */
    private function getLicenseStatus($doctor)
    {
        if (!$doctor->license_expiry_date) {
            return 'unknown';
        }

        $expiryDate = Carbon::parse($doctor->license_expiry_date);
        $now = now();

        if ($expiryDate->isPast()) {
            return 'expired';
        } elseif ($expiryDate->diffInDays($now) <= 30) {
            return 'expiring_soon';
        } else {
            return 'active';
        }
    }

    /**
     * Get appointment count for doctor
     */
    private function getAppointmentCount($doctorId)
    {
        // Return 0 if Appointment model doesn't exist
        if (!class_exists('App\Models\Appointment')) {
            return 0;
        }

        try {
            return Appointment::where('doctor_id', $doctorId)->count();
        } catch (Exception $e) {
            return 0;
        }
    }

    /**
     * Generate doctor statistics
     */
    private function generateStatistics(Request $request)
    {
        $baseQuery = Doctor::query();

        // Apply same filters as main query for relevant statistics
        if ($request->filled('filter_specialization') && $request->filter_specialization !== 'all') {
            $baseQuery->where('specialization', $request->filter_specialization);
        }

        // Get today's new doctors
        $todayQuery = (clone $baseQuery)->whereDate('created_at', today());

        // Get this week's new doctors
        $thisWeekQuery = (clone $baseQuery)->whereBetween('created_at', [
            now()->startOfWeek(),
            now()->endOfWeek()
        ]);

        // Get this month's new doctors
        $thisMonthQuery = (clone $baseQuery)->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year);

        // License status statistics
        $activeLicenseQuery = (clone $baseQuery)->where('license_expiry_date', '>', now());
        $expiredLicenseQuery = (clone $baseQuery)->where('license_expiry_date', '<=', now());
        $expiringSoonQuery = (clone $baseQuery)->whereBetween('license_expiry_date', [now(), now()->addDays(30)]);

        return [
            // Overall statistics (based on current filters)
            'total' => (clone $baseQuery)->count(),
            'with_users' => (clone $baseQuery)->whereHas('user')->count(),
            'without_users' => (clone $baseQuery)->whereDoesntHave('user')->count(),

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

            // Specialization statistics
            'specializations' => $this->getSpecializationStats($baseQuery),

            // License status statistics
            'license_status' => [
                'active' => $activeLicenseQuery->count(),
                'expired' => $expiredLicenseQuery->count(),
                'expiring_soon' => $expiringSoonQuery->count(),
            ],

            // User account rate
            'user_account_rate' => $this->calculateUserAccountRate($baseQuery),

            // Average new doctors per day (last 30 days)
            'avg_new_per_day' => $this->calculateAverageNewPerDay(),

            // Recent registrations
            'recent_registrations' => (clone $baseQuery)->where('created_at', '>=', now()->subDays(7))->count(),

            // License expiring in next 30 days
            'licenses_expiring_30_days' => (clone $baseQuery)->whereBetween('license_expiry_date', [now(), now()->addDays(30)])->count(),
        ];
    }

    /**
     * Get specialization statistics
     */
    private function getSpecializationStats($baseQuery)
    {
        return (clone $baseQuery)
            ->select('specialization', DB::raw('count(*) as count'))
            ->whereNotNull('specialization')
            ->groupBy('specialization')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->pluck('count', 'specialization');
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
     * Calculate average new doctors per day
     */
    private function calculateAverageNewPerDay()
    {
        $thirtyDaysAgo = now()->subDays(30);
        $doctorsLast30Days = Doctor::where('created_at', '>=', $thirtyDaysAgo)->count();

        return round($doctorsLast30Days / 30, 1);
    }

    /**
     * Get filter options for dropdowns
     */
    private function getFilterOptions()
    {
        $specializations = Doctor::select('specialization')
            ->distinct()
            ->whereNotNull('specialization')
            ->orderBy('specialization')
            ->pluck('specialization')
            ->map(function ($specialization) {
                return ['value' => $specialization, 'label' => $specialization];
            })
            ->prepend(['value' => 'all', 'label' => 'All Specializations']);

        return [
            'specializations' => $specializations,
            'license_status' => [
                ['value' => 'all', 'label' => 'All License Status'],
                ['value' => 'active', 'label' => 'Active License'],
                ['value' => 'expiring_soon', 'label' => 'Expiring Soon (30 days)'],
                ['value' => 'expired', 'label' => 'Expired License'],
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
     * Show doctor details
     */
    public function show(Doctor $doctor)
    {
        $doctor->load('user:id,email,created_at');

        // Get appointment count (if available)
        $appointmentCount = $this->getAppointmentCount($doctor->id);

        return Inertia::render('Karyawan/DoctorSection/Show', [
            'doctor' => [
                'id' => $doctor->id,
                'code' => $doctor->code,
                'name' => $doctor->name,
                'specialization' => $doctor->specialization,
                'license_number' => $doctor->license_number,
                'license_start_date' => $doctor->license_start_date,
                'license_expiry_date' => $doctor->license_expiry_date,
                'license_status' => $this->getLicenseStatus($doctor),
                'phone' => $doctor->phone,
                'address' => $doctor->address,
                'user' => $doctor->user ? [
                    'email' => $doctor->user->email,
                    'created_at' => $doctor->user->created_at,
                ] : null,
                'created_at' => $doctor->created_at,
                'appointment_count' => $appointmentCount,
            ],
        ]);
    }

    /**
     * Show edit form
     */
    public function edit(Doctor $doctor)
    {
        $doctor->load('user:id,email');

        return Inertia::render('Karyawan/DoctorSection/Edit', [
            'doctor' => $doctor,
        ]);
    }

    /**
     * Update doctor
     */
    public function update(Request $request, Doctor $doctor)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'specialization' => 'required|string|max:255',
            'license_number' => 'required|string|max:255|unique:doctors,license_number,' . $doctor->id,
            'license_start_date' => 'required|date',
            'license_expiry_date' => 'required|date|after:license_start_date',
            'phone' => 'required|string|max:15|unique:doctors,phone,' . $doctor->id,
            'address' => 'required|string',
        ]);

        $doctor->update($validated);

        return redirect()->route('doctors.show', $doctor->id)
            ->with('success', 'Doctor updated successfully');
    }
}
