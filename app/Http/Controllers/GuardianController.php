<?php

namespace App\Http\Controllers;

use App\Models\Guardian;
use App\Models\Patient;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GuardianController extends Controller
{
    /**
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        try {
            // Get filter parameters
            $search = $request->input('search', '');
            $sortField = $request->input('sort_field', 'id');
            $sortDirection = $request->input('sort_direction', 'asc');
            $filterPatient = $request->input('filter_patient', 'all');
            $perPage = $request->input('per_page', 10);

            // Start query with patient count
            $query = Guardian::query()
                ->select('guardians.*')
                ->addSelect(DB::raw('(SELECT COUNT(*) FROM patients WHERE patients.guardian_id = guardians.id) as patient_count'));

            // Apply search
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('phone_number', 'like', "%{$search}%")
                        ->orWhere('identity_number', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%")
                        ->orWhere('relationship', 'like', "%{$search}%");
                });
            }

            // Apply patient filter
            if ($filterPatient !== 'all') {
                if ($filterPatient === 'yes') {
                    $query->whereExists(function ($subquery) {
                        $subquery->select(DB::raw(1))
                            ->from('patients')
                            ->whereColumn('patients.guardian_id', 'guardians.id');
                    });
                } elseif ($filterPatient === 'no') {
                    $query->whereNotExists(function ($subquery) {
                        $subquery->select(DB::raw(1))
                            ->from('patients')
                            ->whereColumn('patients.guardian_id', 'guardians.id');
                    });
                }
            }

            // Apply sorting
            $allowedSortFields = ['id', 'name', 'phone_number', 'identity_type', 'relationship', 'created_at'];
            if (in_array($sortField, $allowedSortFields)) {
                $query->orderBy($sortField, $sortDirection);
            }

            // Add secondary sorting for consistency
            $query->orderBy('id', 'asc');

            // Get paginated results
            $guardians = $query->paginate($perPage)->withQueryString();

            // Add row numbers for each page
            $guardians->getCollection()->transform(function ($guardian, $index) use ($guardians) {
                $guardian->row_number = (($guardians->currentPage() - 1) * $guardians->perPage()) + $index + 1;
                return $guardian;
            });

            // Return response
            return Inertia::render('Karyawan/GuardianSection/Index', [
                'guardians' => $guardians,
                'filters' => [
                    'search' => $search,
                    'sort_field' => $sortField,
                    'sort_direction' => $sortDirection,
                    'filter_patient' => $filterPatient,
                    'per_page' => $perPage,
                ],
                'stats' => [
                    'total_guardians' => Guardian::count(),
                    'with_patients' => Guardian::whereExists(function ($query) {
                        $query->select(DB::raw(1))
                            ->from('patients')
                            ->whereColumn('patients.guardian_id', 'guardians.id');
                    })->count(),
                    'without_patients' => Guardian::whereNotExists(function ($query) {
                        $query->select(DB::raw(1))
                            ->from('patients')
                            ->whereColumn('patients.guardian_id', 'guardians.id');
                    })->count(),
                ]
            ]);
        } catch (Exception $e) {
            Log::error('GuardianController::index - Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);

            return Inertia::render('Karyawan/GuardianSection/Index', [
                'guardians' => collect([]),
                'filters' => $request->only(['search', 'sort_field', 'sort_direction', 'filter_patient']),
                'error' => 'An error occurred while loading guardians data.'
            ]);
        }
    }

    /**
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        return Inertia::render('Karyawan/GuardianSection/Create');
    }

    /**
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'relationship' => 'nullable|string|max:100',
            'identity_type' => 'nullable|string|in:KTP,PASSPORT',
            'identity_number' => 'nullable|string|max:16',
            'phone_number' => 'nullable|string|max:15',
            'address' => 'nullable|string',
        ]);

        Guardian::create($validated);

        return redirect()->route('guardians.index')
            ->with('success', 'Guardian created successfully');
    }

    /**
     *
     * @param  \App\Models\Guardian  $guardian
     * @return \Inertia\Response
     */
    public function show(Guardian $guardian)
    {
        // Load patients related to this guardian
        $patients = Patient::where('guardian_id', $guardian->id)
            ->select('id', 'name', 'no_rm', 'gender', 'birth_date', 'phone', 'address')
            ->get()
            ->map(function ($patient) {
                return [
                    'id' => $patient->id,
                    'name' => $patient->name,
                    'no_rm' => $patient->no_rm,
                    'gender' => $patient->gender,
                    'age' => $patient->age,
                    'phone' => $patient->phone,
                    'address' => $patient->address,
                ];
            });

        return Inertia::render('Karyawan/GuardianSection/Show', [
            'guardian' => [
                'id' => $guardian->id,
                'name' => $guardian->name,
                'relationship' => $guardian->relationship,
                'identity_type' => $guardian->identity_type,
                'identity_number' => $guardian->identity_number,
                'phone_number' => $guardian->phone_number,
                'address' => $guardian->address,
                'created_at' => $guardian->created_at,
                'patients' => $patients,
            ],
        ]);
    }

    /**
     *
     * @param  \App\Models\Guardian  $guardian
     * @return \Inertia\Response
     */
    public function edit(Guardian $guardian)
    {
        return Inertia::render('Karyawan/GuardianSection/Edit', [
            'guardian' => $guardian,
        ]);
    }

    /**
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Guardian  $guardian
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Guardian $guardian)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'relationship' => 'nullable|string|max:100',
            'identity_type' => 'nullable|string|in:KTP,PASSPORT',
            'identity_number' => 'nullable|string|max:16',
            'phone_number' => 'nullable|string|max:15',
            'address' => 'nullable|string',
        ]);

        $guardian->update($validated);

        return redirect()->route('guardians.show', $guardian->id)
            ->with('success', 'Guardian updated successfully');
    }

    /**
     *
     * @param  \App\Models\Guardian  $guardian
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Guardian $guardian)
    {
        $patientCount = Patient::where('guardian_id', $guardian->id)->count();

        if ($patientCount > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete guardian because they are associated with patients');
        }

        $guardian->delete();

        return redirect()->route('guardians.index')
            ->with('success', 'Guardian deleted successfully');
    }
}
