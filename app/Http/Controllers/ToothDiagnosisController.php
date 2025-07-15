<?php

namespace App\Http\Controllers;

use App\Models\ToothCondition;
use App\Models\ToothBridge;
use App\Models\ToothIndicator;
use App\Models\ToothDiagnosesPrimary;
use App\Models\ToothDiagnosesSecondary;
use App\Models\Icd10CodesDiagnoses;
use App\Models\Icd10CodesExternalCause;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Exception;

class ToothDiagnosisController extends Controller
{
    /**
     * Store a new primary diagnosis
     */
    public function storePrimary(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                // One of these must be provided
                'tooth_condition_id' => 'nullable|exists:tooth_conditions,id',
                'tooth_bridge_id' => 'nullable|exists:tooth_bridges,id',
                'tooth_indicator_id' => 'nullable|exists:tooth_indicators,id',

                // Primary diagnosis data
                'icd_10_codes_diagnoses_id' => 'required|exists:icd_10_codes_diagnoses,id',
                'diagnosis_notes' => 'nullable|string|max:65535',

                // External cause data (optional)
                'icd_10_codes_external_cause_id' => 'nullable|exists:icd_10_codes_external_cause,id',
                'external_cause_notes' => 'nullable|string|max:65535',

                // Secondary diagnoses (optional)
                'secondary_diagnoses' => 'nullable|array',
                'secondary_diagnoses.*.icd_10_codes_diagnoses_id' => 'required|exists:icd_10_codes_diagnoses,id',
                'secondary_diagnoses.*.diagnosis_notes' => 'nullable|string|max:65535',
            ]);

            if ($validator->fails()) {
                if ($request->wantsJson()) {
                    return response()->json(['errors' => $validator->errors()], 422);
                }
                return redirect()->back()->withErrors($validator)->withInput();
            }

            $validated = $validator->validated();

            // Validate that exactly one parent is provided
            $parentCount = (int)!empty($validated['tooth_condition_id']) +
                (int)!empty($validated['tooth_bridge_id']) +
                (int)!empty($validated['tooth_indicator_id']);

            if ($parentCount !== 1) {
                throw new Exception('Exactly one parent (condition, bridge, or indicator) must be provided');
            }

            $savedPrimaryDiagnosis = null;
            $savedSecondaryDiagnoses = [];

            DB::transaction(function () use ($validated, $request, &$savedPrimaryDiagnosis, &$savedSecondaryDiagnoses) {
                // Get the parent model
                $parent = $this->getParentModel($validated);

                // Check access permissions
                $this->checkParentAccess($parent);

                // Delete any existing primary diagnosis for this parent
                if (!empty($validated['tooth_condition_id'])) {
                    ToothDiagnosesPrimary::where('tooth_condition_id', $validated['tooth_condition_id'])
                        ->where('is_active', true)
                        ->delete();
                } elseif (!empty($validated['tooth_bridge_id'])) {
                    ToothDiagnosesPrimary::where('tooth_bridge_id', $validated['tooth_bridge_id'])
                        ->where('is_active', true)
                        ->delete();
                } elseif (!empty($validated['tooth_indicator_id'])) {
                    ToothDiagnosesPrimary::where('tooth_indicator_id', $validated['tooth_indicator_id'])
                        ->where('is_active', true)
                        ->delete();
                }

                // STEP 1: Create new primary diagnosis first
                $primaryDiagnosisData = [
                    'tooth_condition_id' => $validated['tooth_condition_id'] ?? null,
                    'tooth_bridge_id' => $validated['tooth_bridge_id'] ?? null,
                    'tooth_indicator_id' => $validated['tooth_indicator_id'] ?? null,
                    'icd_10_codes_diagnoses_id' => $validated['icd_10_codes_diagnoses_id'],
                    'diagnosis_notes' => $validated['diagnosis_notes'] ?? null,
                    'icd_10_codes_external_cause_id' => $validated['icd_10_codes_external_cause_id'] ?? null,
                    'external_cause_notes' => $validated['external_cause_notes'] ?? null,
                    'diagnosed_by' => Auth::id(),
                    'diagnosed_at' => now(),
                    'is_active' => true,
                ];

                $primaryDiagnosis = ToothDiagnosesPrimary::create($primaryDiagnosisData);
                $savedPrimaryDiagnosis = $primaryDiagnosis->load(['icd10Diagnosis', 'icd10ExternalCause']);

                Log::info('Primary tooth diagnosis created', [
                    'diagnosis_id' => $primaryDiagnosis->id,
                    'parent_type' => $primaryDiagnosis->parent_type,
                    'parent_id' => $this->getParentId($validated),
                    'icd_10_codes_diagnoses_id' => $validated['icd_10_codes_diagnoses_id'],
                ]);

                // STEP 2: Create secondary diagnoses if provided
                if (!empty($validated['secondary_diagnoses'])) {
                    foreach ($validated['secondary_diagnoses'] as $secondaryData) {
                        // Validate that secondary diagnosis is not the same as primary
                        if ($secondaryData['icd_10_codes_diagnoses_id'] == $validated['icd_10_codes_diagnoses_id']) {
                            continue; // Skip if same as primary
                        }

                        // Check if this secondary diagnosis already exists for this primary
                        $existingSecondary = ToothDiagnosesSecondary::where('tooth_diagnoses_primary_id', $primaryDiagnosis->id)
                            ->where('icd_10_codes_diagnoses_id', $secondaryData['icd_10_codes_diagnoses_id'])
                            ->where('is_active', true)
                            ->first();

                        if (!$existingSecondary) {
                            $secondaryDiagnosisData = [
                                'tooth_diagnoses_primary_id' => $primaryDiagnosis->id,
                                'icd_10_codes_diagnoses_id' => $secondaryData['icd_10_codes_diagnoses_id'],
                                'diagnosis_notes' => $secondaryData['diagnosis_notes'] ?? null,
                                'diagnosed_by' => Auth::id(),
                                'diagnosed_at' => now(),
                                'is_active' => true,
                            ];

                            $secondaryDiagnosis = ToothDiagnosesSecondary::create($secondaryDiagnosisData);
                            $savedSecondaryDiagnoses[] = $secondaryDiagnosis->load(['icd10Diagnosis']);

                            Log::info('Secondary tooth diagnosis created', [
                                'secondary_diagnosis_id' => $secondaryDiagnosis->id,
                                'primary_diagnosis_id' => $primaryDiagnosis->id,
                                'icd_10_codes_diagnoses_id' => $secondaryData['icd_10_codes_diagnoses_id'],
                            ]);
                        }
                    }
                }

                // Update parent status
                $parent->setHasDiagnosis();
            });

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Diagnosis berhasil disimpan',
                    'data' => [
                        'primary_diagnosis' => $savedPrimaryDiagnosis,
                        'secondary_diagnoses' => $savedSecondaryDiagnoses,
                        'total_secondary' => count($savedSecondaryDiagnoses)
                    ]
                ]);
            }

            return redirect()->back()
                ->with('success', 'Diagnosis berhasil disimpan')
                ->with('newDiagnosis', $savedPrimaryDiagnosis)
                ->with('newSecondaryDiagnoses', $savedSecondaryDiagnoses);
        } catch (Exception $e) {
            Log::error('ToothDiagnosisController::storePrimary - Error: ' . $e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Terjadi kesalahan saat menyimpan diagnosis: ' . $e->getMessage()
                ], 500);
            }

            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }



    /**
     * Store a new secondary diagnosis
     */
    public function storeSecondary(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'tooth_diagnoses_primary_id' => 'required|exists:tooth_diagnoses_primary,id',
                'icd_10_codes_diagnoses_id' => 'required|exists:icd_10_codes_diagnoses,id',
                'diagnosis_notes' => 'nullable|string|max:65535',
            ]);

            if ($validator->fails()) {
                if ($request->wantsJson()) {
                    return response()->json(['errors' => $validator->errors()], 422);
                }
                return redirect()->back()->withErrors($validator)->withInput();
            }

            $validated = $validator->validated();

            DB::transaction(function () use ($validated, $request) {
                // Get primary diagnosis
                $primaryDiagnosis = ToothDiagnosesPrimary::findOrFail($validated['tooth_diagnoses_primary_id']);

                // Check access permissions
                $this->checkParentAccess($primaryDiagnosis->parent);

                // Check if this secondary diagnosis already exists
                $existingSecondary = ToothDiagnosesSecondary::where('tooth_diagnoses_primary_id', $validated['tooth_diagnoses_primary_id'])
                    ->where('icd_10_codes_diagnoses_id', $validated['icd_10_codes_diagnoses_id'])
                    ->where('is_active', true)
                    ->first();

                if ($existingSecondary) {
                    throw new Exception('Diagnosis sekunder ini sudah ada');
                }

                // Create new secondary diagnosis
                $diagnosisData = array_merge($validated, [
                    'diagnosed_by' => Auth::id(),
                    'diagnosed_at' => now(),
                    'is_active' => true,
                ]);

                $diagnosis = ToothDiagnosesSecondary::create($diagnosisData);

                Log::info('Secondary tooth diagnosis created', [
                    'diagnosis_id' => $diagnosis->id,
                    'primary_diagnosis_id' => $validated['tooth_diagnoses_primary_id'],
                    'icd_10_codes_diagnoses_id' => $validated['icd_10_codes_diagnoses_id'],
                ]);

                // Store for response
                $request->merge(['newSecondaryDiagnosis' => $diagnosis->load(['icd10Diagnosis'])]);
            });

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Diagnosis sekunder berhasil disimpan',
                    'data' => $request->get('newSecondaryDiagnosis')
                ]);
            }

            return redirect()->back()
                ->with('success', 'Diagnosis sekunder berhasil disimpan')
                ->with('newSecondaryDiagnosis', $request->get('newSecondaryDiagnosis'));
        } catch (Exception $e) {
            Log::error('ToothDiagnosisController::storeSecondary - Error: ' . $e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Terjadi kesalahan saat menyimpan diagnosis sekunder: ' . $e->getMessage()
                ], 500);
            }

            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }


    /**
     * Update a primary diagnosis
     */
    public function updatePrimary(Request $request, ToothDiagnosesPrimary $primaryDiagnosis)
    {
        try {
            // Check access permissions
            $this->checkParentAccess($primaryDiagnosis->parent);

            $validator = Validator::make($request->all(), [
                'icd_10_codes_diagnoses_id' => 'required|exists:icd_10_codes_diagnoses,id',
                'diagnosis_notes' => 'nullable|string|max:65535',
                'icd_10_codes_external_cause_id' => 'nullable|exists:icd_10_codes_external_cause,id',
                'external_cause_notes' => 'nullable|string|max:65535',

                // Secondary diagnoses (optional)
                'secondary_diagnoses' => 'nullable|array',
                'secondary_diagnoses.*.icd_10_codes_diagnoses_id' => 'required|exists:icd_10_codes_diagnoses,id',
                'secondary_diagnoses.*.diagnosis_notes' => 'nullable|string|max:65535',
            ]);

            if ($validator->fails()) {
                if ($request->wantsJson()) {
                    return response()->json(['errors' => $validator->errors()], 422);
                }
                return redirect()->back()->withErrors($validator)->withInput();
            }

            $validated = $validator->validated();
            $savedSecondaryDiagnoses = [];

            DB::transaction(function () use ($primaryDiagnosis, $validated, $request, &$savedSecondaryDiagnoses) {
                // STEP 1: Update primary diagnosis
                $primaryUpdateData = [
                    'icd_10_codes_diagnoses_id' => $validated['icd_10_codes_diagnoses_id'],
                    'diagnosis_notes' => $validated['diagnosis_notes'] ?? null,
                    'icd_10_codes_external_cause_id' => $validated['icd_10_codes_external_cause_id'] ?? null,
                    'external_cause_notes' => $validated['external_cause_notes'] ?? null,
                ];

                $primaryDiagnosis->update($primaryUpdateData);
                $primaryDiagnosis->load(['icd10Diagnosis', 'icd10ExternalCause']);

                Log::info('Primary tooth diagnosis updated', [
                    'diagnosis_id' => $primaryDiagnosis->id,
                    'parent_type' => $primaryDiagnosis->parent_type,
                ]);

                // STEP 2: Handle secondary diagnoses
                // Delete existing secondary diagnoses
                ToothDiagnosesSecondary::where('tooth_diagnoses_primary_id', $primaryDiagnosis->id)->delete();

                // Create new secondary diagnoses if provided
                if (!empty($validated['secondary_diagnoses'])) {
                    foreach ($validated['secondary_diagnoses'] as $secondaryData) {
                        // Validate that secondary diagnosis is not the same as primary
                        if ($secondaryData['icd_10_codes_diagnoses_id'] == $validated['icd_10_codes_diagnoses_id']) {
                            continue; // Skip if same as primary
                        }

                        $secondaryDiagnosisData = [
                            'tooth_diagnoses_primary_id' => $primaryDiagnosis->id,
                            'icd_10_codes_diagnoses_id' => $secondaryData['icd_10_codes_diagnoses_id'],
                            'diagnosis_notes' => $secondaryData['diagnosis_notes'] ?? null,
                            'diagnosed_by' => Auth::id(),
                            'diagnosed_at' => now(),
                            'is_active' => true,
                        ];

                        $secondaryDiagnosis = ToothDiagnosesSecondary::create($secondaryDiagnosisData);
                        $savedSecondaryDiagnoses[] = $secondaryDiagnosis->load(['icd10Diagnosis']);

                        Log::info('Secondary tooth diagnosis created during update', [
                            'secondary_diagnosis_id' => $secondaryDiagnosis->id,
                            'primary_diagnosis_id' => $primaryDiagnosis->id,
                        ]);
                    }
                }

                // Store for response
                $request->merge([
                    'updatedDiagnosis' => $primaryDiagnosis,
                    'updatedSecondaryDiagnoses' => $savedSecondaryDiagnoses
                ]);
            });

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Diagnosis berhasil diperbarui',
                    'data' => [
                        'primary_diagnosis' => $request->get('updatedDiagnosis'),
                        'secondary_diagnoses' => $savedSecondaryDiagnoses,
                        'total_secondary' => count($savedSecondaryDiagnoses)
                    ]
                ]);
            }

            return redirect()->back()
                ->with('success', 'Diagnosis berhasil diperbarui')
                ->with('updatedDiagnosis', $request->get('updatedDiagnosis'))
                ->with('updatedSecondaryDiagnoses', $savedSecondaryDiagnoses);
        } catch (Exception $e) {
            Log::error('ToothDiagnosisController::updatePrimary - Error: ' . $e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Terjadi kesalahan saat memperbarui diagnosis: ' . $e->getMessage()
                ], 500);
            }

            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Delete a primary diagnosis (will cascade to secondary)
     */
    public function destroyPrimary(Request $request, ToothDiagnosesPrimary $primaryDiagnosis)
    {
        try {
            // ✅ FIXED: Add null check for parent
            $parent = $primaryDiagnosis->parent;
            if (!$parent) {
                throw new Exception('Primary diagnosis parent not found');
            }

            // Check access permissions
            $this->checkParentAccess($parent);

            DB::transaction(function () use ($primaryDiagnosis, $parent) {
                $primaryDiagnosis->delete();

                // Update parent diagnosis status
                if ($parent instanceof ToothCondition || $parent instanceof ToothIndicator) {
                    $parent->update(['diagnosis_status' => $parent::DIAGNOSIS_NEEDS_DIAGNOSIS]);
                } elseif ($parent instanceof ToothBridge) {
                    $parent->update(['diagnosis_status' => ToothBridge::DIAGNOSIS_NEEDS_DIAGNOSIS]);
                }

                Log::info('Primary tooth diagnosis deleted', [
                    'diagnosis_id' => $primaryDiagnosis->id,
                    'parent_type' => $primaryDiagnosis->parent_type,
                ]);
            });

            // if ($request->wantsJson()) {
            //     return response()->json([
            //         'success' => true,
            //         'message' => 'Diagnosis primer berhasil dihapus'
            //     ]);
            // }

            return redirect()->back()->with('success', 'Diagnosis primer berhasil dihapus');
        } catch (Exception $e) {
            Log::error('ToothDiagnosisController::destroyPrimary - Error: ' . $e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Terjadi kesalahan saat menghapus diagnosis primer: ' . $e->getMessage()
                ], 500);
            }

            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Delete a secondary diagnosis
     */
    public function destroySecondary(Request $request, ToothDiagnosesSecondary $secondaryDiagnosis)
    {
        try {
            // ✅ FIXED: Add null check for primary diagnosis and parent
            $primaryDiagnosis = $secondaryDiagnosis->primaryDiagnosis;
            if (!$primaryDiagnosis) {
                throw new Exception('Primary diagnosis not found for secondary diagnosis');
            }

            $parent = $primaryDiagnosis->parent;
            if (!$parent) {
                throw new Exception('Parent not found for primary diagnosis');
            }

            // Check access permissions through primary diagnosis
            $this->checkParentAccess($parent);

            DB::transaction(function () use ($secondaryDiagnosis) {
                $secondaryDiagnosis->delete();

                Log::info('Secondary tooth diagnosis deleted', [
                    'diagnosis_id' => $secondaryDiagnosis->id,
                ]);
            });

            // if ($request->wantsJson()) {
            //     return response()->json([
            //         'success' => true,
            //         'message' => 'Diagnosis sekunder berhasil dihapus'
            //     ]);
            // }

            return redirect()->back()->with('success', 'Diagnosis sekunder berhasil dihapus');
        } catch (Exception $e) {
            Log::error('ToothDiagnosisController::destroySecondary - Error: ' . $e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Terjadi kesalahan saat menghapus diagnosis sekunder: ' . $e->getMessage()
                ], 500);
            }

            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Set parent to have no diagnosis
     */
    public function setNoDiagnosis(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'tooth_condition_id' => 'nullable|exists:tooth_conditions,id',
                'tooth_bridge_id' => 'nullable|exists:tooth_bridges,id',
                'tooth_indicator_id' => 'nullable|exists:tooth_indicators,id',
            ]);

            if ($validator->fails()) {
                if ($request->wantsJson()) {
                    return response()->json(['errors' => $validator->errors()], 422);
                }
                return redirect()->back()->withErrors($validator);
            }

            $validated = $validator->validated();

            // Validate that exactly one parent is provided
            $parentCount = (int)!empty($validated['tooth_condition_id']) +
                (int)!empty($validated['tooth_bridge_id']) +
                (int)!empty($validated['tooth_indicator_id']);

            if ($parentCount !== 1) {
                throw new Exception('Exactly one parent (condition, bridge, or indicator) must be provided');
            }

            $parent = $this->getParentModel($validated);

            // Check access permissions
            $this->checkParentAccess($parent);

            DB::transaction(function () use ($parent, $validated) {
                // Delete any existing primary diagnoses (will cascade to secondary)
                if (!empty($validated['tooth_condition_id'])) {
                    ToothDiagnosesPrimary::where('tooth_condition_id', $validated['tooth_condition_id'])->delete();
                    $parent->update(['diagnosis_status' => ToothCondition::DIAGNOSIS_NO_DIAGNOSIS]);
                } elseif (!empty($validated['tooth_bridge_id'])) {
                    ToothDiagnosesPrimary::where('tooth_bridge_id', $validated['tooth_bridge_id'])->delete();
                    $parent->update(['diagnosis_status' => ToothBridge::DIAGNOSIS_NO_DIAGNOSIS]);
                } elseif (!empty($validated['tooth_indicator_id'])) {
                    ToothDiagnosesPrimary::where('tooth_indicator_id', $validated['tooth_indicator_id'])->delete();
                    $parent->update(['diagnosis_status' => ToothIndicator::DIAGNOSIS_NO_DIAGNOSIS]);
                }

                // Cancel any treatments for this parent
                if (method_exists($parent, 'treatments')) {
                    $parent->treatments()->update(['status' => 'cancelled']);
                }

                Log::info('Parent set to no diagnosis', [
                    'parent_type' => class_basename($parent),
                    'parent_id' => $parent->id,
                ]);
            });

            // if ($request->wantsJson()) {
            //     return response()->json([
            //         'success' => true,
            //         'message' => 'Status "Tanpa Diagnosa" berhasil disimpan'
            //     ]);
            // }

            return redirect()->back()->with('success', 'Status "Tanpa Diagnosa" berhasil disimpan');
        } catch (Exception $e) {
            Log::error('ToothDiagnosisController::setNoDiagnosis - Error: ' . $e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Terjadi kesalahan: ' . $e->getMessage()
                ], 500);
            }

            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Get diagnosis details (primary and secondary)
     */
    public function show(ToothDiagnosesPrimary $primaryDiagnosis)
    {
        try {
            // ✅ FIXED: Add null check for parent
            $parent = $primaryDiagnosis->parent;
            if (!$parent) {
                throw new Exception('Primary diagnosis parent not found');
            }

            // Check access permissions
            $this->checkParentAccess($parent);

            $diagnosis = $primaryDiagnosis->load([
                'icd10Diagnosis',
                'icd10ExternalCause',
                'diagnosedBy',
                'toothCondition',
                'toothBridge',
                'toothIndicator',
                'secondaryDiagnoses.icd10Diagnosis',
                'secondaryDiagnoses.diagnosedBy'
            ]);

            // return response()->json([
            //     'success' => true,
            //     'data' => [
            //         'primary_diagnosis' => $diagnosis,
            //         'secondary_diagnoses' => $diagnosis->secondaryDiagnoses,
            //         'full_description' => $diagnosis->formatted_diagnosis
            //     ]
            // ]);
        } catch (Exception $e) {
            Log::error('ToothDiagnosisController::show - Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data diagnosis'
            ], 500);
        }
    }

    // Helper methods
    private function getParentModel(array $validated)
    {
        if (!empty($validated['tooth_condition_id'])) {
            return ToothCondition::findOrFail($validated['tooth_condition_id']);
        } elseif (!empty($validated['tooth_bridge_id'])) {
            return ToothBridge::findOrFail($validated['tooth_bridge_id']);
        } elseif (!empty($validated['tooth_indicator_id'])) {
            return ToothIndicator::findOrFail($validated['tooth_indicator_id']);
        }

        throw new Exception('No valid parent provided');
    }
    private function getParentId(array $validated)
    {
        return $validated['tooth_condition_id'] ??
            $validated['tooth_bridge_id'] ??
            $validated['tooth_indicator_id'] ??
            null;
    }
    private function checkParentAccess($parent)
    {
        if (!$parent) {
            abort(404, 'Parent item tidak ditemukan');
        }

        $user = Auth::user();
        $odontogram = $parent->odontogram;

        if ($user->role === 'patient') {
            $userPatient = \App\Models\Patient::where('user_id', $user->id)->first();
            if (!$userPatient || $userPatient->id !== $odontogram->patient_id) {
                abort(403, 'Anda tidak memiliki akses ke data ini.');
            }
            abort(403, 'Hanya dokter yang dapat mengedit diagnosis.');
        } elseif ($user->role === 'doctor') {
            $doctor = \App\Models\Doctor::where('user_id', $user->id)->first();
            if (!$doctor) {
                abort(403, 'Data dokter tidak ditemukan.');
            }

            $hasAccess = ($odontogram->doctor_id === $doctor->id);
            if (!$hasAccess && $odontogram->appointment_id) {
                $appointment = \App\Models\Appointment::find($odontogram->appointment_id);
                $hasAccess = ($appointment && $appointment->doctor_id === $doctor->id);
            }

            if (!$hasAccess) {
                abort(403, 'Anda tidak memiliki akses ke data ini.');
            }

            if ($odontogram->is_finalized) {
                abort(403, 'Odontogram sudah difinalisasi dan tidak dapat diedit.');
            }
        } elseif (!in_array($user->role, ['admin', 'employee'])) {
            abort(403, 'Anda tidak memiliki akses ke data ini.');
        }
    }
}
