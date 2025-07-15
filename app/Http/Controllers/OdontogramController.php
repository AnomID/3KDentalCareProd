<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Icd10CodesDiagnoses;
use App\Models\Icd10CodesExternalCause;
use App\Models\Icd9cmCodes;
use App\Models\Odontogram;
use App\Models\ToothCondition;
use App\Models\ToothBridge;
use App\Models\ToothIndicator;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\ToothTreatmentProcedure;
use App\Models\OdontogramAttachment;
use App\Models\OdontogramTemplate;
use App\Models\OdontogramRevision;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Carbon\Carbon;

class OdontogramController extends Controller
{
    /**
     * Handle response based on request type (Inertia vs AJAX)
     */
    private function handleResponse($success, $message, $data = null, $statusCode = 200)
    {
        if (request()->header('X-Inertia')) {
            if ($success) {
                return redirect()->back()->with('success', $message);
            } else {
                return redirect()->back()->with('error', $message);
            }
        }

        return response()->json([
            'success' => $success,
            'message' => $message,
            'data' => $data
        ], $statusCode);
    }

    /**
     * Check odontogram access permissions
     */
    private function checkOdontogramAccess(Odontogram $odontogram, $requireEdit = false)
    {
        $user = Auth::user();

        if ($user->role === 'patient') {
            $userPatient = Patient::where('user_id', $user->id)->first();
            if (!$userPatient || $userPatient->id !== $odontogram->patient_id) {
                abort(403, 'Anda tidak memiliki akses ke odontogram ini.');
            }
            if ($requireEdit) {
                abort(403, 'Hanya dokter yang dapat mengedit odontogram.');
            }
        } elseif ($user->role === 'doctor') {
            $doctor = Doctor::where('user_id', $user->id)->first();
            if (!$doctor) {
                abort(403, 'Data dokter tidak ditemukan.');
            }

            $hasAccess = ($odontogram->doctor_id === $doctor->id);
            if (!$hasAccess && $odontogram->appointment_id) {
                $appointment = Appointment::find($odontogram->appointment_id);
                $hasAccess = ($appointment && $appointment->doctor_id === $doctor->id);
            }

            if (!$hasAccess) {
                abort(403, 'Anda tidak memiliki akses ke odontogram ini.');
            }

            if ($requireEdit && $odontogram->is_finalized) {
                abort(403, 'Odontogram sudah difinalisasi dan tidak dapat diedit.');
            }

            return $doctor;
        } elseif ($user->role !== 'admin' && $user->role !== 'employee') {
            abort(403, 'Anda tidak memiliki akses ke odontogram ini.');
        } else {
            if ($requireEdit && !in_array($user->role, ['admin', 'employee'])) {
                abort(403, 'Anda tidak memiliki izin untuk mengedit odontogram ini.');
            }
        }

        return null;
    }

    /**
     * Get the odontogram canvas data for React component
     */
    public function getCanvasData(Odontogram $odontogram)
    {
        try {
            $this->checkOdontogramAccess($odontogram, false);

            // FIXED: Load related data with user relationships
            $odontogram->load([
                'toothConditions.primaryDiagnosis.icd10Diagnosis',
                'toothConditions.primaryDiagnosis.icd10ExternalCause',
                'toothConditions.primaryDiagnosis.diagnosedBy:id,name,email', // Load user name
                'toothConditions.secondaryDiagnoses.icd10Diagnosis',
                'toothConditions.secondaryDiagnoses.diagnosedBy:id,name,email', // Load user name
                'toothConditions.treatments.procedures.icd9cmCode',
                'toothConditions.treatments.createdBy:id,name,email', // Load user name
                'toothConditions.treatments.completedBy:id,name,email', // Load user name
                'toothConditions.activeTreatment.procedures.icd9cmCode',
                'toothConditions.activeTreatment.createdBy:id,name,email', // Load user name
                'toothConditions.activeTreatment.completedBy:id,name,email', // Load user name
                'toothBridges.primaryDiagnosis.icd10Diagnosis',
                'toothBridges.primaryDiagnosis.icd10ExternalCause',
                'toothBridges.primaryDiagnosis.diagnosedBy:id,name,email', // Load user name
                'toothBridges.secondaryDiagnoses.icd10Diagnosis',
                'toothBridges.secondaryDiagnoses.diagnosedBy:id,name,email', // Load user name
                'toothBridges.treatments.procedures.icd9cmCode',
                'toothBridges.treatments.createdBy:id,name,email', // Load user name
                'toothBridges.treatments.completedBy:id,name,email', // Load user name
                'toothBridges.activeTreatment.procedures.icd9cmCode',
                'toothBridges.activeTreatment.createdBy:id,name,email', // Load user name
                'toothBridges.activeTreatment.completedBy:id,name,email', // Load user name
                'toothIndicators.primaryDiagnosis.icd10Diagnosis',
                'toothIndicators.primaryDiagnosis.icd10ExternalCause',
                'toothIndicators.primaryDiagnosis.diagnosedBy:id,name,email', // Load user name
                'toothIndicators.secondaryDiagnoses.icd10Diagnosis',
                'toothIndicators.secondaryDiagnoses.diagnosedBy:id,name,email', // Load user name
                'toothIndicators.treatments.procedures.icd9cmCode',
                'toothIndicators.treatments.createdBy:id,name,email', // Load user name
                'toothIndicators.treatments.completedBy:id,name,email', // Load user name
                'toothIndicators.activeTreatment.procedures.icd9cmCode',
                'toothIndicators.activeTreatment.createdBy:id,name,email', // Load user name
                'toothIndicators.activeTreatment.completedBy:id,name,email', // Load user name
            ]);

            // Format data for React component
            $data = [
                'conditions' => $this->formatToothConditionsForCanvas($odontogram->toothConditions),
                'bridges' => $this->formatToothBridgesForCanvas($odontogram->toothBridges),
                'indicators' => $this->formatToothIndicatorsForCanvas($odontogram->toothIndicators)
            ];

            // Determine if user can edit
            $user = Auth::user();
            $canEdit = false;
            if ($user->role === 'doctor' && !$odontogram->is_finalized) {
                try {
                    $this->checkOdontogramAccess($odontogram, true);
                    $canEdit = true;
                } catch (Exception $e) {
                    $canEdit = false;
                }
            }

            return response()->json([
                'success' => true,
                'data' => $data,
                'odontogram' => [
                    'id' => $odontogram->id,
                    'general_notes' => $odontogram->general_notes,
                    'occlusion' => $odontogram->occlusion,
                    'torus_palatinus' => $odontogram->torus_palatinus,
                    'torus_mandibularis' => $odontogram->torus_mandibularis,
                    'palatum' => $odontogram->palatum,
                    'diastema' => $odontogram->diastema,
                    'gigi_anomali' => $odontogram->gigi_anomali,
                    'others' => $odontogram->others,
                    'd_value' => $odontogram->d_value,
                    'm_value' => $odontogram->m_value,
                    'f_value' => $odontogram->f_value,
                    'is_finalized' => $odontogram->is_finalized,
                    'finalized_at' => $odontogram->finalized_at,
                    'finalized_by' => $odontogram->finalized_by,
                    'can_edit' => $canEdit
                ]
            ]);
        } catch (Exception $e) {
            Log::error('OdontogramController::getCanvasData - Error: ' . $e->getMessage(), [
                'odontogram_id' => $odontogram->id,
                'user_id' => Auth::id(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data odontogram: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Format tooth conditions for canvas
     */
    private function formatToothConditionsForCanvas($toothConditions)
    {
        return $toothConditions->map(function ($condition) {
            $pos = $condition->surface
                ? $condition->tooth_number . '-' . strtoupper(substr($condition->surface, 0, 1))
                : $condition->tooth_number;

            // Get primary diagnosis data
            $primaryDiagnosis = $condition->primaryDiagnosis;

            // Get ICD-9-CM codes for treatment
            $icd9cmCodes = collect();
            if ($condition->activeTreatment && $condition->activeTreatment->procedures) {
                $icd9cmCodes = $condition->activeTreatment->procedures->map(function ($procedure) {
                    return $procedure->icd9cmCode;
                })->filter();
            }

            return [
                'id' => $condition->id,
                'tooth_number' => $condition->tooth_number,
                'surface' => $condition->surface,
                'condition_code' => $condition->condition_code,
                'geometry_data' => $condition->geometry_data,
                'pos' => $pos,
                'code' => $this->getOdontogramModeFromConditionCode($condition->condition_code),

                // Status data
                'diagnosis_status' => $condition->diagnosis_status,
                'treatment_status' => $condition->treatment_status,

                // Primary diagnosis data with user info
                'primary_diagnosis' => $primaryDiagnosis ? [
                    'id' => $primaryDiagnosis->id,
                    'icd_10_codes_diagnoses_id' => $primaryDiagnosis->icd_10_codes_diagnoses_id,
                    'diagnosis_notes' => $primaryDiagnosis->diagnosis_notes,
                    'icd_10_codes_external_cause_id' => $primaryDiagnosis->icd_10_codes_external_cause_id,
                    'external_cause_notes' => $primaryDiagnosis->external_cause_notes,
                    'diagnosed_at' => $primaryDiagnosis->diagnosed_at,
                    'diagnosed_by' => $primaryDiagnosis->diagnosed_by,
                    'diagnosed_by_user' => $primaryDiagnosis->diagnosedBy, // User relationship
                    'icd10_diagnosis' => $primaryDiagnosis->icd10Diagnosis,
                    'icd10Diagnosis' => $primaryDiagnosis->icd10Diagnosis, // For backward compatibility
                    'icd10_external_cause' => $primaryDiagnosis->icd10ExternalCause,
                    'icd10ExternalCause' => $primaryDiagnosis->icd10ExternalCause, // For backward compatibility
                ] : null,

                // Secondary diagnoses data with user info
                'secondary_diagnoses' => $condition->secondaryDiagnoses->map(function ($secondary) {
                    return [
                        'id' => $secondary->id,
                        'icd_10_codes_diagnoses_id' => $secondary->icd_10_codes_diagnoses_id,
                        'diagnosis_notes' => $secondary->diagnosis_notes,
                        'diagnosed_at' => $secondary->diagnosed_at,
                        'diagnosed_by' => $secondary->diagnosed_by,
                        'diagnosed_by_user' => $secondary->diagnosedBy, // User relationship
                        'icd10_diagnosis' => $secondary->icd10Diagnosis,
                        'icd10Diagnosis' => $secondary->icd10Diagnosis, // For backward compatibility
                    ];
                }),

                // Treatment data with user info
                'treatment' => $condition->activeTreatment ? [
                    'id' => $condition->activeTreatment->id,
                    'notes' => $condition->activeTreatment->notes,
                    'status' => $condition->activeTreatment->status,
                    'planned_date' => $condition->activeTreatment->planned_date,
                    'started_date' => $condition->activeTreatment->started_date,
                    'completed_date' => $condition->activeTreatment->completed_date,
                    'created_at' => $condition->activeTreatment->created_at,
                    'updated_at' => $condition->activeTreatment->updated_at,
                    'created_by' => $condition->activeTreatment->created_by,
                    'created_by_user' => $condition->activeTreatment->createdBy, // User relationship
                    'completed_by' => $condition->activeTreatment->completed_by,
                    'completed_by_user' => $condition->activeTreatment->completedBy, // User relationship
                    'icd9cm_codes' => $icd9cmCodes,
                ] : null,

                // All treatments with user info
                'treatments' => $condition->treatments->map(function ($treatment) {
                    $treatmentIcd9cmCodes = collect();
                    if ($treatment->procedures) {
                        $treatmentIcd9cmCodes = $treatment->procedures->map(function ($procedure) {
                            return $procedure->icd9cmCode;
                        })->filter();
                    }

                    return [
                        'id' => $treatment->id,
                        'notes' => $treatment->notes,
                        'status' => $treatment->status,
                        'planned_date' => $treatment->planned_date,
                        'started_date' => $treatment->started_date,
                        'completed_date' => $treatment->completed_date,
                        'created_at' => $treatment->created_at,
                        'updated_at' => $treatment->updated_at,
                        'created_by' => $treatment->created_by,
                        'created_by_user' => $treatment->createdBy, // User relationship
                        'completed_by' => $treatment->completed_by,
                        'completed_by_user' => $treatment->completedBy, // User relationship
                        'icd9cm_codes' => $treatmentIcd9cmCodes,
                    ];
                }),

                // Timestamps
                'created_at' => $condition->created_at,
                'updated_at' => $condition->updated_at,

                // Item type for frontend
                'itemType' => 'condition',
            ];
        });
    }

    /**
     * Format tooth bridges for canvas
     */
    private function formatToothBridgesForCanvas($toothBridges)
    {
        return $toothBridges->map(function ($bridge) {
            // Get primary diagnosis data
            $primaryDiagnosis = $bridge->primaryDiagnosis;

            // Get ICD-9-CM codes for treatment
            $icd9cmCodes = collect();
            if ($bridge->activeTreatment && $bridge->activeTreatment->procedures) {
                $icd9cmCodes = $bridge->activeTreatment->procedures->map(function ($procedure) {
                    return $procedure->icd9cmCode;
                })->filter();
            }

            return [
                'id' => $bridge->id,
                'bridge_name' => $bridge->bridge_name,
                'connected_teeth' => $bridge->connected_teeth,
                'bridge_type' => $bridge->bridge_type,
                'bridge_geometry' => $bridge->bridge_geometry,

                // Status data (calculated in model)
                'diagnosis_status' => $bridge->diagnosis_status,
                'treatment_status' => $bridge->treatment_status,

                // Primary diagnosis data with user info
                'primary_diagnosis' => $primaryDiagnosis ? [
                    'id' => $primaryDiagnosis->id,
                    'icd_10_codes_diagnoses_id' => $primaryDiagnosis->icd_10_codes_diagnoses_id,
                    'diagnosis_notes' => $primaryDiagnosis->diagnosis_notes,
                    'icd_10_codes_external_cause_id' => $primaryDiagnosis->icd_10_codes_external_cause_id,
                    'external_cause_notes' => $primaryDiagnosis->external_cause_notes,
                    'diagnosed_at' => $primaryDiagnosis->diagnosed_at,
                    'diagnosed_by' => $primaryDiagnosis->diagnosed_by,
                    'diagnosed_by_user' => $primaryDiagnosis->diagnosedBy, // User relationship
                    'icd10_diagnosis' => $primaryDiagnosis->icd10Diagnosis,
                    'icd10Diagnosis' => $primaryDiagnosis->icd10Diagnosis, // For backward compatibility
                    'icd10_external_cause' => $primaryDiagnosis->icd10ExternalCause,
                    'icd10ExternalCause' => $primaryDiagnosis->icd10ExternalCause, // For backward compatibility
                ] : null,

                // Secondary diagnoses data with user info
                'secondary_diagnoses' => $bridge->secondaryDiagnoses->map(function ($secondary) {
                    return [
                        'id' => $secondary->id,
                        'icd_10_codes_diagnoses_id' => $secondary->icd_10_codes_diagnoses_id,
                        'diagnosis_notes' => $secondary->diagnosis_notes,
                        'diagnosed_at' => $secondary->diagnosed_at,
                        'diagnosed_by' => $secondary->diagnosed_by,
                        'diagnosed_by_user' => $secondary->diagnosedBy, // User relationship
                        'icd10_diagnosis' => $secondary->icd10Diagnosis,
                        'icd10Diagnosis' => $secondary->icd10Diagnosis, // For backward compatibility
                    ];
                }),

                // Treatment data with user info
                'treatment' => $bridge->activeTreatment ? [
                    'id' => $bridge->activeTreatment->id,
                    'notes' => $bridge->activeTreatment->notes,
                    'status' => $bridge->activeTreatment->status,
                    'planned_date' => $bridge->activeTreatment->planned_date,
                    'started_date' => $bridge->activeTreatment->started_date,
                    'completed_date' => $bridge->activeTreatment->completed_date,
                    'created_at' => $bridge->activeTreatment->created_at,
                    'updated_at' => $bridge->activeTreatment->updated_at,
                    'created_by' => $bridge->activeTreatment->created_by,
                    'created_by_user' => $bridge->activeTreatment->createdBy, // User relationship
                    'completed_by' => $bridge->activeTreatment->completed_by,
                    'completed_by_user' => $bridge->activeTreatment->completedBy, // User relationship
                    'icd9cm_codes' => $icd9cmCodes,
                ] : null,

                // For backward compatibility with frontend
                'from' => $bridge->connected_teeth[0] ?? null,
                'to' => $bridge->connected_teeth[1] ?? null,

                // All treatments with user info
                'treatments' => $bridge->treatments->map(function ($treatment) {
                    $treatmentIcd9cmCodes = collect();
                    if ($treatment->procedures) {
                        $treatmentIcd9cmCodes = $treatment->procedures->map(function ($procedure) {
                            return $procedure->icd9cmCode;
                        })->filter();
                    }

                    return [
                        'id' => $treatment->id,
                        'notes' => $treatment->notes,
                        'status' => $treatment->status,
                        'planned_date' => $treatment->planned_date,
                        'started_date' => $treatment->started_date,
                        'completed_date' => $treatment->completed_date,
                        'created_at' => $treatment->created_at,
                        'updated_at' => $treatment->updated_at,
                        'created_by' => $treatment->created_by,
                        'created_by_user' => $treatment->createdBy, // User relationship
                        'completed_by' => $treatment->completed_by,
                        'completed_by_user' => $treatment->completedBy, // User relationship
                        'icd9cm_codes' => $treatmentIcd9cmCodes,
                    ];
                }),

                // Timestamps
                'created_at' => $bridge->created_at,
                'updated_at' => $bridge->updated_at,

                // Item type for frontend
                'itemType' => 'bridge',
            ];
        });
    }

    /**
     * Format tooth indicators for canvas
     */
    private function formatToothIndicatorsForCanvas($toothIndicators)
    {
        return $toothIndicators->map(function ($indicator) {
            // Get primary diagnosis data
            $primaryDiagnosis = $indicator->primaryDiagnosis;

            // Get ICD-9-CM codes for treatment
            $icd9cmCodes = collect();
            if ($indicator->activeTreatment && $indicator->activeTreatment->procedures) {
                $icd9cmCodes = $indicator->activeTreatment->procedures->map(function ($procedure) {
                    return $procedure->icd9cmCode;
                })->filter();
            }

            return [
                'id' => $indicator->id,
                'tooth_number' => $indicator->tooth_number,
                'indicator_type' => $indicator->indicator_type,
                'geometry_data' => $indicator->geometry_data,

                // Status data (calculated in model)
                'diagnosis_status' => $indicator->diagnosis_status,
                'treatment_status' => $indicator->treatment_status,

                // Primary diagnosis data with user info
                'primary_diagnosis' => $primaryDiagnosis ? [
                    'id' => $primaryDiagnosis->id,
                    'icd_10_codes_diagnoses_id' => $primaryDiagnosis->icd_10_codes_diagnoses_id,
                    'diagnosis_notes' => $primaryDiagnosis->diagnosis_notes,
                    'icd_10_codes_external_cause_id' => $primaryDiagnosis->icd_10_codes_external_cause_id,
                    'external_cause_notes' => $primaryDiagnosis->external_cause_notes,
                    'diagnosed_at' => $primaryDiagnosis->diagnosed_at,
                    'diagnosed_by' => $primaryDiagnosis->diagnosed_by,
                    'diagnosed_by_user' => $primaryDiagnosis->diagnosedBy, // User relationship
                    'icd10_diagnosis' => $primaryDiagnosis->icd10Diagnosis,
                    'icd10Diagnosis' => $primaryDiagnosis->icd10Diagnosis, // For backward compatibility
                    'icd10_external_cause' => $primaryDiagnosis->icd10ExternalCause,
                    'icd10ExternalCause' => $primaryDiagnosis->icd10ExternalCause, // For backward compatibility
                ] : null,

                // Secondary diagnoses data with user info
                'secondary_diagnoses' => $indicator->secondaryDiagnoses->map(function ($secondary) {
                    return [
                        'id' => $secondary->id,
                        'icd_10_codes_diagnoses_id' => $secondary->icd_10_codes_diagnoses_id,
                        'diagnosis_notes' => $secondary->diagnosis_notes,
                        'diagnosed_at' => $secondary->diagnosed_at,
                        'diagnosed_by' => $secondary->diagnosed_by,
                        'diagnosed_by_user' => $secondary->diagnosedBy, // User relationship
                        'icd10_diagnosis' => $secondary->icd10Diagnosis,
                        'icd10Diagnosis' => $secondary->icd10Diagnosis, // For backward compatibility
                    ];
                }),

                // Treatment data with user info
                'treatment' => $indicator->activeTreatment ? [
                    'id' => $indicator->activeTreatment->id,
                    'notes' => $indicator->activeTreatment->notes,
                    'status' => $indicator->activeTreatment->status,
                    'planned_date' => $indicator->activeTreatment->planned_date,
                    'started_date' => $indicator->activeTreatment->started_date,
                    'completed_date' => $indicator->activeTreatment->completed_date,
                    'created_at' => $indicator->activeTreatment->created_at,
                    'updated_at' => $indicator->activeTreatment->updated_at,
                    'created_by' => $indicator->activeTreatment->created_by,
                    'created_by_user' => $indicator->activeTreatment->createdBy, // User relationship
                    'completed_by' => $indicator->activeTreatment->completed_by,
                    'completed_by_user' => $indicator->activeTreatment->completedBy, // User relationship
                    'icd9cm_codes' => $icd9cmCodes,
                ] : null,

                // For backward compatibility with frontend
                'pos' => $indicator->tooth_number,
                'code' => $this->getOdontogramModeFromIndicatorType($indicator->indicator_type),
                'tooth' => $indicator->tooth_number,
                'type' => $indicator->indicator_type,

                // All treatments with user info
                'treatments' => $indicator->treatments->map(function ($treatment) {
                    $treatmentIcd9cmCodes = collect();
                    if ($treatment->procedures) {
                        $treatmentIcd9cmCodes = $treatment->procedures->map(function ($procedure) {
                            return $procedure->icd9cmCode;
                        })->filter();
                    }

                    return [
                        'id' => $treatment->id,
                        'notes' => $treatment->notes,
                        'status' => $treatment->status,
                        'planned_date' => $treatment->planned_date,
                        'started_date' => $treatment->started_date,
                        'completed_date' => $treatment->completed_date,
                        'created_at' => $treatment->created_at,
                        'updated_at' => $treatment->updated_at,
                        'created_by' => $treatment->created_by,
                        'created_by_user' => $treatment->createdBy, // User relationship
                        'completed_by' => $treatment->completed_by,
                        'completed_by_user' => $treatment->completedBy, // User relationship
                        'icd9cm_codes' => $treatmentIcd9cmCodes,
                    ];
                }),

                // Timestamps
                'created_at' => $indicator->created_at,
                'updated_at' => $indicator->updated_at,

                // Item type for frontend
                'itemType' => 'indicator',
            ];
        });
    }
    /**
     * Update odontogram metadata
     */
    public function update(Request $request, Odontogram $odontogram)
    {
        try {
            $doctor = $this->checkOdontogramAccess($odontogram, true);

            $validator = Validator::make($request->all(), [
                'general_notes' => 'nullable|string|max:65535',
                'occlusion' => 'nullable|string|in:normal,cross,steep',
                'torus_palatinus' => 'nullable|string|in:none,small,medium,large,multiple',
                'torus_mandibularis' => 'nullable|string|in:none,left,right,both',
                'palatum' => 'nullable|string|in:deep,medium,shallow',
                'diastema' => 'nullable|string|max:65535',
                'gigi_anomali' => 'nullable|string|max:65535',
                'others' => 'nullable|string|max:65535',
            ]);

            if ($validator->fails()) {
                if ($request->wantsJson()) {
                    return response()->json(['errors' => $validator->errors()], 422);
                }
                return redirect()->back()->withErrors($validator)->withInput();
            }

            $validated = $validator->validated();

            DB::transaction(function () use ($odontogram, $validated) {
                // Store old values for revision
                $oldValues = $odontogram->only(array_keys($validated));

                $odontogram->update($validated);

                // Create revision record
                $this->createRevision(
                    $odontogram->id,
                    'odontograms',
                    $odontogram->id,
                    'update',
                    $oldValues,
                    $validated
                );
            });

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Odontogram berhasil diperbarui.',
                    'odontogram' => $odontogram
                ]);
            }

            return redirect()->back()->with('success', 'Odontogram berhasil diperbarui.');
        } catch (Exception $e) {
            Log::error('OdontogramController::update - Error: ' . $e->getMessage(), [
                'odontogram_id' => $odontogram->id
            ]);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Terjadi kesalahan saat memperbarui odontogram: ' . $e->getMessage()
                ], 500);
            }

            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Save tooth conditions from the odontogram canvas
     */
    public function saveToothConditions(Request $request, Odontogram $odontogram)
    {
        try {
            $doctor = $this->checkOdontogramAccess($odontogram, true);

            $validationRules = [
                'conditions' => 'nullable|array', // FIXED: changed from 'required' to 'nullable'
                'conditions.*.tooth_number' => 'required|string|max:5',
                'conditions.*.surface' => 'nullable|string|max:1',
                'conditions.*.condition_code' => [
                    'required',
                    'string',
                    'in:AMF,COF,FIS,NVT,RCT,NON,UNE,PRE,ANO,CARIES,CFR,FMC,POC,RRX,MIS,IPX,FRM_ACR,BRIDGE'
                ],
                'conditions.*.geometry_data' => 'nullable',
            ];

            $validator = Validator::make($request->all(), $validationRules);

            if ($validator->fails()) {
                if ($request->wantsJson()) {
                    return response()->json(['errors' => $validator->errors()], 422);
                }
                return redirect()->back()->withErrors($validator)->withInput();
            }

            $validated = $validator->validated();

            // FIXED: Handle empty conditions array
            $conditionsData = $validated['conditions'] ?? [];

            DB::transaction(function () use ($odontogram, $conditionsData) {
                // STEP 1: Get all existing conditions for this odontogram
                $existingConditions = $odontogram->toothConditions()->get();

                // STEP 2: Create lookup arrays for comparison
                $newConditionsLookup = [];
                foreach ($conditionsData as $conditionData) {
                    $key = $conditionData['tooth_number'] . '|' .
                        ($conditionData['surface'] ?? 'null') . '|' .
                        $conditionData['condition_code'];
                    $newConditionsLookup[$key] = $conditionData;
                }

                $existingConditionsLookup = [];
                foreach ($existingConditions as $condition) {
                    $key = $condition->tooth_number . '|' .
                        ($condition->surface ?? 'null') . '|' .
                        $condition->condition_code;
                    $existingConditionsLookup[$key] = $condition;
                }

                // STEP 3: Delete conditions that are no longer present
                foreach ($existingConditionsLookup as $key => $existingCondition) {
                    if (!isset($newConditionsLookup[$key])) {
                        Log::info("Deleting condition: {$key}");

                        // FIXED: Delete related diagnoses and treatments (gunakan relasi baru)
                        if ($existingCondition->primaryDiagnosis) {
                            $existingCondition->primaryDiagnosis->delete(); // This will cascade to secondary
                        }
                        $existingCondition->treatments()->delete();

                        // Create revision for deletion
                        $this->createRevision(
                            $odontogram->id,
                            'tooth_conditions',
                            $existingCondition->id,
                            'delete',
                            $existingCondition->getAttributes(),
                            null,
                            'Condition deleted via save'
                        );

                        $existingCondition->delete();
                    }
                }

                // STEP 4: Add or update remaining conditions
                foreach ($conditionsData as $conditionData) {
                    $key = $conditionData['tooth_number'] . '|' .
                        ($conditionData['surface'] ?? 'null') . '|' .
                        $conditionData['condition_code'];

                    if (isset($existingConditionsLookup[$key])) {
                        // Update existing condition
                        $existingCondition = $existingConditionsLookup[$key];
                        $oldValues = $existingCondition->getAttributes();

                        $updateData = [
                            'geometry_data' => $conditionData['geometry_data'] ?? null,
                        ];

                        $existingCondition->update($updateData);

                        $this->createRevision(
                            $odontogram->id,
                            'tooth_conditions',
                            $existingCondition->id,
                            'update',
                            $oldValues,
                            $updateData,
                            'Condition updated via save'
                        );
                    } else {
                        // Create new condition
                        $this->findOrCreateToothCondition($odontogram, $conditionData);
                    }
                }

                // STEP 5: Recalculate DMFT
                $odontogram->calculateDmft();
            });

            return redirect()->back()->with('success', 'Kondisi gigi berhasil disimpan.');
        } catch (Exception $e) {
            Log::error('OdontogramController::saveToothConditions - Error: ' . $e->getMessage(), [
                'odontogram_id' => $odontogram->id
            ]);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Terjadi kesalahan saat menyimpan kondisi gigi: ' . $e->getMessage()
                ], 500);
            }

            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Find or create tooth condition
     */
    private function findOrCreateToothCondition(Odontogram $odontogram, array $conditionData)
    {
        $existingCondition = $odontogram->toothConditions()
            ->where('tooth_number', $conditionData['tooth_number'])
            ->where('surface', $conditionData['surface'] ?? null)
            ->where('condition_code', $conditionData['condition_code'])
            ->first();

        $dataToSave = [
            'tooth_number' => $conditionData['tooth_number'],
            'surface' => $conditionData['surface'] ?? null,
            'condition_code' => $conditionData['condition_code'],
            'geometry_data' => $conditionData['geometry_data'] ?? null,
        ];

        if ($existingCondition) {
            $oldValues = $existingCondition->getAttributes();
            $existingCondition->update($dataToSave);

            // Create revision
            $this->createRevision(
                $odontogram->id,
                'tooth_conditions',
                $existingCondition->id,
                'update',
                $oldValues,
                $dataToSave
            );

            return $existingCondition;
        } else {
            $dataToSave['odontogram_id'] = $odontogram->id;
            $newCondition = ToothCondition::create($dataToSave);

            // Create revision
            $this->createRevision(
                $odontogram->id,
                'tooth_conditions',
                $newCondition->id,
                'create',
                null,
                $dataToSave
            );

            return $newCondition;
        }
    }


    /**
     * Save tooth bridges
     */
    public function saveToothBridges(Request $request, Odontogram $odontogram)
    {
        try {
            $doctor = $this->checkOdontogramAccess($odontogram, true);

            // FIXED: Get bridges data with proper default
            $bridgesData = $request->get('bridges', []);

            DB::transaction(function () use ($odontogram, $bridgesData) {
                // STEP 1: Get all existing bridges
                $existingBridges = $odontogram->toothBridges()->get();

                // STEP 2: Validate and prepare new bridges data
                $validBridges = [];
                foreach ($bridgesData as $bridge) {
                    $connectedTeeth = $bridge['connected_teeth'] ?? [];

                    // Handle backward compatibility
                    if (empty($connectedTeeth) && !empty($bridge['from']) && !empty($bridge['to'])) {
                        $connectedTeeth = [$bridge['from'], $bridge['to']];
                    }

                    if (count($connectedTeeth) >= 2) {
                        $validBridges[] = [
                            'bridge_name' => $bridge['bridge_name'] ?? $bridge['name'] ?? 'Bridge',
                            'connected_teeth' => $connectedTeeth,
                            'bridge_type' => $bridge['bridge_type'] ?? $bridge['type'] ?? 'fixed',
                            'bridge_geometry' => $bridge['bridge_geometry'] ?? $bridge['geometry'] ?? null,
                        ];
                    }
                }

                // STEP 3: Create lookup for comparison
                $newBridgesLookup = [];
                foreach ($validBridges as $bridgeData) {
                    $connectedTeethSorted = $bridgeData['connected_teeth'];
                    sort($connectedTeethSorted);
                    $key = json_encode($connectedTeethSorted) . '|' . $bridgeData['bridge_type'];
                    $newBridgesLookup[$key] = $bridgeData;
                }

                $existingBridgesLookup = [];
                foreach ($existingBridges as $bridge) {
                    $connectedTeeth = $bridge->connected_teeth;
                    sort($connectedTeeth);
                    $key = json_encode($connectedTeeth) . '|' . $bridge->bridge_type;
                    $existingBridgesLookup[$key] = $bridge;
                }

                // STEP 4: Delete bridges that are no longer present
                foreach ($existingBridgesLookup as $key => $existingBridge) {
                    if (!isset($newBridgesLookup[$key])) {
                        Log::info("Deleting bridge: {$key}");

                        // FIXED: Delete related diagnoses and treatments first (gunakan relasi baru)
                        if ($existingBridge->primaryDiagnosis) {
                            $existingBridge->primaryDiagnosis->delete(); // This will cascade to secondary
                        }
                        $existingBridge->treatments()->delete();

                        // Create revision for deletion
                        $this->createRevision(
                            $odontogram->id,
                            'tooth_bridges',
                            $existingBridge->id,
                            'delete',
                            $existingBridge->getAttributes(),
                            null,
                            'Bridge deleted via save'
                        );

                        // Delete the bridge
                        $existingBridge->delete();
                    }
                }

                // STEP 5: Add or update remaining bridges
                foreach ($validBridges as $bridgeData) {
                    $connectedTeeth = $bridgeData['connected_teeth'];
                    sort($connectedTeeth);
                    $key = json_encode($connectedTeeth) . '|' . $bridgeData['bridge_type'];

                    if (isset($existingBridgesLookup[$key])) {
                        // Update existing bridge
                        $existingBridge = $existingBridgesLookup[$key];
                        $oldValues = $existingBridge->getAttributes();

                        $existingBridge->update($bridgeData);

                        $this->createRevision(
                            $odontogram->id,
                            'tooth_bridges',
                            $existingBridge->id,
                            'update',
                            $oldValues,
                            $bridgeData,
                            'Bridge updated via save'
                        );
                    } else {
                        // Create new bridge
                        $bridgeData['odontogram_id'] = $odontogram->id;
                        $newBridge = ToothBridge::create($bridgeData);

                        $this->createRevision(
                            $odontogram->id,
                            'tooth_bridges',
                            $newBridge->id,
                            'create',
                            null,
                            $bridgeData,
                            'Bridge created via save'
                        );
                    }
                }
            });
        } catch (Exception $e) {
            Log::error('OdontogramController::saveToothBridges - Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan bridge: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Find or create tooth bridge
     */
    private function findOrCreateToothBridge(Odontogram $odontogram, array $bridgeData)
    {
        // For PostgreSQL, we need to use JSON operators or cast to text for comparison
        $connectedTeethJson = json_encode($bridgeData['connected_teeth']);

        // Use whereRaw with PostgreSQL JSON operators or convert to text for comparison
        $existingBridge = $odontogram->toothBridges()
            ->where('bridge_type', $bridgeData['bridge_type'])
            ->whereRaw("connected_teeth::text = ?", [$connectedTeethJson])
            ->first();

        $dataToSave = [
            'bridge_name' => $bridgeData['bridge_name'] ?? 'Bridge',
            'connected_teeth' => $bridgeData['connected_teeth'],
            'bridge_type' => $bridgeData['bridge_type'],
            'bridge_geometry' => $bridgeData['bridge_geometry'] ?? [], // Provide empty array instead of null
        ];

        if ($existingBridge) {
            $oldValues = $existingBridge->getAttributes();
            $existingBridge->update($dataToSave);

            $this->createRevision(
                $odontogram->id,
                'tooth_bridges',
                $existingBridge->id,
                'update',
                $oldValues,
                $dataToSave
            );

            return $existingBridge;
        } else {
            $dataToSave['odontogram_id'] = $odontogram->id;
            $newBridge = ToothBridge::create($dataToSave);

            $this->createRevision(
                $odontogram->id,
                'tooth_bridges',
                $newBridge->id,
                'create',
                null,
                $dataToSave
            );

            return $newBridge;
        }
    }

    /**
     * Save tooth indicators
     */
    public function saveToothIndicators(Request $request, Odontogram $odontogram)
    {
        try {
            $doctor = $this->checkOdontogramAccess($odontogram, true);

            // Make indicators field optional and default to empty array
            $validationRules = [
                'indicators' => 'nullable|array', // Changed from 'required' to 'nullable'
                'indicators.*.tooth_number' => 'required|string|max:5',
                'indicators.*.indicator_type' => [
                    'required',
                    'string',
                    'in:ARROW_TOP_LEFT,ARROW_TOP_RIGHT,ARROW_TOP_TURN_LEFT,ARROW_TOP_TURN_RIGHT,ARROW_BOTTOM_LEFT,ARROW_BOTTOM_RIGHT,ARROW_BOTTOM_TURN_LEFT,ARROW_BOTTOM_TURN_RIGHT'
                ],
                'indicators.*.geometry_data' => 'nullable',
            ];

            $validator = Validator::make($request->all(), $validationRules);

            if ($validator->fails()) {
                // Check if this is an Inertia request
                if ($request->header('X-Inertia')) {
                    return redirect()->back()->withErrors($validator)->withInput();
                }
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $validated = $validator->validated();
            $indicatorsData = $validated['indicators'] ?? []; // Default to empty array

            DB::transaction(function () use ($odontogram, $indicatorsData) {
                // STEP 1: Get all existing indicators
                $existingIndicators = $odontogram->toothIndicators()->get();

                // STEP 2: Create lookup for comparison
                $newIndicatorsLookup = [];
                foreach ($indicatorsData as $indicatorData) {
                    if (!empty($indicatorData['tooth_number']) && !empty($indicatorData['indicator_type'])) {
                        $key = $indicatorData['tooth_number'] . '|' . $indicatorData['indicator_type'];
                        $newIndicatorsLookup[$key] = $indicatorData;
                    }
                }

                $existingIndicatorsLookup = [];
                foreach ($existingIndicators as $indicator) {
                    $key = $indicator->tooth_number . '|' . $indicator->indicator_type;
                    $existingIndicatorsLookup[$key] = $indicator;
                }

                // STEP 3: Delete indicators that are no longer present
                foreach ($existingIndicatorsLookup as $key => $existingIndicator) {
                    if (!isset($newIndicatorsLookup[$key])) {
                        Log::info("Deleting indicator: {$key}");

                        // FIXED: Delete related diagnoses and treatments first (gunakan relasi baru)
                        if ($existingIndicator->primaryDiagnosis) {
                            $existingIndicator->primaryDiagnosis->delete(); // This will cascade to secondary
                        }
                        $existingIndicator->treatments()->delete();

                        // Create revision for deletion
                        $this->createRevision(
                            $odontogram->id,
                            'tooth_indicators',
                            $existingIndicator->id,
                            'delete',
                            $existingIndicator->getAttributes(),
                            null,
                            'Indicator deleted via save'
                        );

                        // Delete the indicator
                        $existingIndicator->delete();
                    }
                }

                // STEP 4: Add or update remaining indicators
                foreach ($indicatorsData as $indicatorData) {
                    if (empty($indicatorData['tooth_number']) || empty($indicatorData['indicator_type'])) {
                        continue;
                    }

                    $key = $indicatorData['tooth_number'] . '|' . $indicatorData['indicator_type'];

                    if (isset($existingIndicatorsLookup[$key])) {
                        // Update existing indicator
                        $existingIndicator = $existingIndicatorsLookup[$key];
                        $oldValues = $existingIndicator->getAttributes();

                        $updateData = [
                            'geometry_data' => $indicatorData['geometry_data'] ?? null,
                        ];

                        $existingIndicator->update($updateData);

                        $this->createRevision(
                            $odontogram->id,
                            'tooth_indicators',
                            $existingIndicator->id,
                            'update',
                            $oldValues,
                            $updateData,
                            'Indicator updated via save'
                        );
                    } else {
                        // Create new indicator
                        $dataToSave = [
                            'odontogram_id' => $odontogram->id,
                            'tooth_number' => $indicatorData['tooth_number'],
                            'indicator_type' => $indicatorData['indicator_type'],
                            'geometry_data' => $indicatorData['geometry_data'] ?? null,
                        ];

                        $newIndicator = ToothIndicator::create($dataToSave);

                        $this->createRevision(
                            $odontogram->id,
                            'tooth_indicators',
                            $newIndicator->id,
                            'create',
                            null,
                            $dataToSave,
                            'Indicator created via save'
                        );
                    }
                }
            });
        } catch (Exception $e) {
            Log::error('OdontogramController::saveToothIndicators - Error: ' . $e->getMessage());

            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('error', 'Terjadi kesalahan saat menyimpan indikator: ' . $e->getMessage());
            }

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan indikator: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Find or create tooth indicator
     */
    private function findOrCreateToothIndicator(Odontogram $odontogram, array $indicatorData)
    {
        try {
            // Check if odontogram exists and we can access its indicators
            if (!$odontogram->exists) {
                throw new Exception("Odontogram does not exist");
            }

            $existingIndicator = $odontogram->toothIndicators()
                ->where('tooth_number', $indicatorData['tooth_number'])
                ->where('indicator_type', $indicatorData['indicator_type'])
                ->first();

            $dataToSave = [
                'tooth_number' => $indicatorData['tooth_number'],
                'indicator_type' => $indicatorData['indicator_type'],
                'geometry_data' => $indicatorData['geometry_data'] ?? null,
            ];

            if ($existingIndicator) {
                $oldValues = $existingIndicator->getAttributes();
                $existingIndicator->update($dataToSave);

                $this->createRevision(
                    $odontogram->id,
                    'tooth_indicators',
                    $existingIndicator->id,
                    'update',
                    $oldValues,
                    $dataToSave
                );

                return $existingIndicator;
            } else {
                $dataToSave['odontogram_id'] = $odontogram->id;
                $newIndicator = ToothIndicator::create($dataToSave);

                $this->createRevision(
                    $odontogram->id,
                    'tooth_indicators',
                    $newIndicator->id,
                    'create',
                    null,
                    $dataToSave
                );

                return $newIndicator;
            }
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * Create revision record
     */
    private function createRevision($odontogramId, $tableName, $recordId, $action, $oldValues = null, $newValues = null, $reason = null)
    {
        try {
            OdontogramRevision::create([
                'odontogram_id' => $odontogramId,
                'table_name' => $tableName,
                'record_id' => $recordId,
                'action' => $action,
                'old_values' => $oldValues,
                'new_values' => $newValues,
                'reason' => $reason,
                'updated_by' => Auth::id(),
            ]);
        } catch (Exception $e) {
            // Silent fail for revision creation
        }
    }

    /**
     * Finalize the odontogram
     */
    public function finalize(Request $request, Odontogram $odontogram)
    {
        try {
            $user = Auth::user();
            if ($user->role !== 'doctor') {
                abort(403, 'Hanya dokter yang dapat memfinalisasi odontogram.');
            }

            $doctor = Doctor::where('user_id', $user->id)->first();
            if (!$doctor) {
                abort(403, 'Data dokter tidak ditemukan.');
            }

            if ($odontogram->is_finalized) {
                return $this->handleResponse(
                    false,
                    'Odontogram sudah difinalisasi.',
                    null,
                    422
                );
            }

            $hasAccess = ($odontogram->doctor_id === $doctor->id);
            if (!$hasAccess && $odontogram->appointment_id) {
                $appointment = Appointment::find($odontogram->appointment_id);
                $hasAccess = ($appointment && $appointment->doctor_id === $doctor->id);
            }

            if (!$hasAccess) {
                abort(403, 'Anda tidak memiliki izin untuk memfinalisasi odontogram ini.');
            }

            DB::transaction(function () use ($odontogram) {
                $oldValues = ['is_finalized' => $odontogram->is_finalized];

                $odontogram->finalize(Auth::id());

                $this->createRevision(
                    $odontogram->id,
                    'odontograms',
                    $odontogram->id,
                    'update',
                    $oldValues,
                    ['is_finalized' => true, 'finalized_at' => now(), 'finalized_by' => Auth::id()],
                    'Odontogram finalized'
                );
            });

            return $this->handleResponse(true, 'Odontogram berhasil difinalisasi.');
        } catch (Exception $e) {
            Log::error('OdontogramController::finalize - Error: ' . $e->getMessage());

            return $this->handleResponse(
                false,
                'Terjadi kesalahan saat memfinalisasi odontogram: ' . $e->getMessage(),
                null,
                500
            );
        }
    }

    /**
     * Unfinalize the odontogram
     */
    public function unfinalize(Request $request, Odontogram $odontogram)
    {
        try {
            $user = Auth::user();
            if (!in_array($user->role, ['admin', 'employee'])) {
                abort(403, 'Hanya admin/karyawan yang dapat membatalkan finalisasi odontogram.');
            }

            if (!$odontogram->is_finalized) {
                return $this->handleResponse(
                    false,
                    'Odontogram belum difinalisasi.',
                    null,
                    422
                );
            }

            DB::transaction(function () use ($odontogram) {
                $oldValues = [
                    'is_finalized' => $odontogram->is_finalized,
                    'finalized_at' => $odontogram->finalized_at,
                    'finalized_by' => $odontogram->finalized_by
                ];

                $odontogram->unfinalize();

                $this->createRevision(
                    $odontogram->id,
                    'odontograms',
                    $odontogram->id,
                    'update',
                    $oldValues,
                    ['is_finalized' => false, 'finalized_at' => null, 'finalized_by' => null],
                    'Odontogram unfinalized'
                );
            });

            return $this->handleResponse(true, 'Status finalisasi odontogram berhasil dibatalkan.');
        } catch (Exception $e) {
            Log::error('OdontogramController::unfinalize - Error: ' . $e->getMessage());

            return $this->handleResponse(
                false,
                'Terjadi kesalahan saat membatalkan finalisasi odontogram: ' . $e->getMessage(),
                null,
                500
            );
        }
    }

    /**
     * Convert condition code to odontogram mode
     */
    private function getOdontogramModeFromConditionCode($conditionCode)
    {
        $modeMap = [
            'AMF' => 1,
            'COF' => 2,
            'FIS' => 3,
            'NVT' => 4,
            'RCT' => 5,
            'NON' => 6,
            'UNE' => 7,
            'PRE' => 8,
            'ANO' => 9,
            'CARIES' => 10,
            'CFR' => 11,
            'FMC' => 12,
            'POC' => 13,
            'RRX' => 14,
            'MIS' => 15,
            'IPX' => 16,
            'FRM_ACR' => 17,
            'BRIDGE' => 18,
        ];

        return $modeMap[$conditionCode] ?? 0;
    }


    /**
     * Convert indicator type to odontogram mode
     */
    private function getOdontogramModeFromIndicatorType($indicatorType)
    {
        $modeMap = [
            'ARROW_TOP_LEFT' => 19,
            'ARROW_TOP_RIGHT' => 20,
            'ARROW_TOP_TURN_LEFT' => 21,
            'ARROW_TOP_TURN_RIGHT' => 22,
            'ARROW_BOTTOM_LEFT' => 23,
            'ARROW_BOTTOM_RIGHT' => 24,
            'ARROW_BOTTOM_TURN_LEFT' => 25,
            'ARROW_BOTTOM_TURN_RIGHT' => 26,
        ];

        return $modeMap[$indicatorType] ?? 0;
    }

    // Additional API methods for dental data
    /**
     * Get ICD-10 diagnosis codes
     */
    public function getIcd10DiagnosisCodes(Request $request)
    {
        try {
            $search = $request->get('search', '');
            $active = $request->get('active', '1');

            $query = Icd10CodesDiagnoses::query();

            if ($active === '1') {
                $query->where('is_active', true);
            }

            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('code', 'LIKE', "%{$search}%")
                        ->orWhere('description', 'LIKE', "%{$search}%");
                });
            }

            $codes = $query->orderBy('code')
                ->limit(50)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $codes
            ]);
        } catch (Exception $e) {
            Log::error('Error fetching ICD-10 diagnosis codes: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data kode ICD-10 diagnosis',
                'data' => []
            ], 500);
        }
    }

    /**
     * Get ICD-10 external cause codes
     */
    public function getIcd10ExternalCauseCodes(Request $request)
    {
        try {
            $search = $request->get('search', '');
            $active = $request->get('active', '1');

            $query = Icd10CodesExternalCause::query();

            if ($active === '1') {
                $query->where('is_active', true);
            }

            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('code', 'LIKE', "%{$search}%")
                        ->orWhere('description', 'LIKE', "%{$search}%");
                });
            }

            $codes = $query->orderBy('code')
                ->limit(50)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $codes
            ]);
        } catch (Exception $e) {
            Log::error('Error fetching ICD-10 external cause codes: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data kode ICD-10 external cause',
                'data' => []
            ], 500);
        }
    }

    /**
     * Get ICD-9-CM procedure codes
     */
    public function getIcd9cmCodes(Request $request)
    {
        try {
            $search = $request->get('search', '');
            $active = $request->get('active', '1');

            $query = Icd9cmCodes::query();

            if ($active === '1') {
                $query->where('is_active', true);
            }

            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('code', 'LIKE', "%{$search}%")
                        ->orWhere('description', 'LIKE', "%{$search}%");
                });
            }

            $codes = $query->orderBy('code')
                ->limit(50)
                ->get();

            Log::info("ICD-9-CM Search: '{$search}' found {$codes->count()} results");

            return response()->json([
                'success' => true,
                'data' => $codes,
                'debug' => [
                    'search_term' => $search,
                    'total_found' => $codes->count(),
                    'active_filter' => $active
                ]
            ]);
        } catch (Exception $e) {
            Log::error('Error fetching ICD-9-CM codes: ' . $e->getMessage(), [
                'search' => $search ?? 'N/A',
                'active' => $active ?? 'N/A'
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data kode ICD-9-CM',
                'error' => $e->getMessage(),
                'data' => []
            ], 500);
        }
    }


    /**
     * Bulk save all odontogram data at once
     */
    public function bulkSave(Request $request, Odontogram $odontogram)
    {
        try {
            $doctor = $this->checkOdontogramAccess($odontogram, true);

            $validator = Validator::make($request->all(), [
                // Metadata
                'general_notes' => 'nullable|string|max:65535',
                'occlusion' => 'nullable|string|in:normal,cross,steep',
                'torus_palatinus' => 'nullable|string|in:none,small,medium,large,multiple',
                'torus_mandibularis' => 'nullable|string|in:none,left,right,both',
                'palatum' => 'nullable|string|in:deep,medium,shallow',
                'diastema' => 'nullable|string|max:65535',
                'gigi_anomali' => 'nullable|string|max:65535',
                'others' => 'nullable|string|max:65535',

                // Conditions
                'conditions' => 'nullable|array',
                'conditions.*.tooth_number' => 'required|string|max:5',
                'conditions.*.surface' => 'nullable|string|max:1',
                'conditions.*.condition_code' => 'required|string|in:AMF,COF,FIS,NVT,RCT,NON,UNE,PRE,ANO,CARIES,CFR,FMC,POC,RRX,MIS,IPX,FRM_ACR,BRIDGE',
                'conditions.*.geometry_data' => 'nullable',

                // Bridges
                'bridges' => 'nullable|array',
                'bridges.*.bridge_name' => 'nullable|string|max:255',
                'bridges.*.connected_teeth' => 'required|array|min:2',
                'bridges.*.bridge_type' => 'required|string|in:fixed,removable,implant',
                'bridges.*.bridge_geometry' => 'nullable',

                // Indicators
                'indicators' => 'nullable|array',
                'indicators.*.tooth_number' => 'required|string|max:5',
                'indicators.*.indicator_type' => 'required|string|in:ARROW_TOP_LEFT,ARROW_TOP_RIGHT,ARROW_TOP_TURN_LEFT,ARROW_TOP_TURN_RIGHT,ARROW_BOTTOM_LEFT,ARROW_BOTTOM_RIGHT,ARROW_BOTTOM_TURN_LEFT,ARROW_BOTTOM_TURN_RIGHT',
                'indicators.*.geometry_data' => 'nullable',
                'indicators.*.notes' => 'nullable|string|max:65535',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $validated = $validator->validated();

            DB::transaction(function () use ($odontogram, $validated) {
                // Update metadata
                $metadataFields = ['general_notes', 'occlusion', 'torus_palatinus', 'torus_mandibularis', 'palatum', 'diastema', 'gigi_anomali', 'others'];
                $metadataData = [];
                foreach ($metadataFields as $field) {
                    if (isset($validated[$field])) {
                        $metadataData[$field] = $validated[$field];
                    }
                }

                if (!empty($metadataData)) {
                    $oldValues = $odontogram->only(array_keys($metadataData));
                    $odontogram->update($metadataData);

                    $this->createRevision(
                        $odontogram->id,
                        'odontograms',
                        $odontogram->id,
                        'update',
                        $oldValues,
                        $metadataData
                    );
                }

                // Clear existing data
                $odontogram->toothConditions()->delete();
                $odontogram->toothBridges()->delete();
                $odontogram->toothIndicators()->delete();

                // Save conditions
                if (!empty($validated['conditions'])) {
                    foreach ($validated['conditions'] as $conditionData) {
                        $this->findOrCreateToothCondition($odontogram, $conditionData);
                    }
                }

                // Save bridges
                if (!empty($validated['bridges'])) {
                    foreach ($validated['bridges'] as $bridgeData) {
                        $this->findOrCreateToothBridge($odontogram, $bridgeData);
                    }
                }

                // Save indicators
                if (!empty($validated['indicators'])) {
                    foreach ($validated['indicators'] as $indicatorData) {
                        $this->findOrCreateToothIndicator($odontogram, $indicatorData);
                    }
                }

                // Recalculate DMFT
                $odontogram->calculateDmft();
            });
        } catch (Exception $e) {
            Log::error('OdontogramController::bulkSave - Error: ' . $e->getMessage(), [
                'odontogram_id' => $odontogram->id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyimpan data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get odontogram revision history
     */
    public function getRevisions(Odontogram $odontogram)
    {
        try {
            $this->checkOdontogramAccess($odontogram, false);

            $revisions = $odontogram->revisions()
                ->with(['updatedBy'])
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $revisions
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil riwayat revisi'
            ], 500);
        }
    }

    /**
     * Get specific revision details
     */
    public function getRevisionDetails(Odontogram $odontogram, OdontogramRevision $revision)
    {
        try {
            $this->checkOdontogramAccess($odontogram, false);

            if ($revision->odontogram_id !== $odontogram->id) {
                abort(404, 'Revisi tidak ditemukan untuk odontogram ini');
            }

            $revision->load(['updatedBy']);

            return response()->json([
                'success' => true,
                'data' => $revision
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil detail revisi'
            ], 500);
        }
    }

    /**
     * Validate odontogram completeness
     */
    public function validateOdontogram(Odontogram $odontogram)
    {
        try {
            $this->checkOdontogramAccess($odontogram, false);

            $validationResults = [
                'is_valid' => true,
                'errors' => [],
                'warnings' => [],
                'suggestions' => []
            ];

            // FIXED: Load related data (gunakan relasi baru)
            $odontogram->load(['toothConditions.primaryDiagnosis', 'toothBridges.primaryDiagnosis']);

            // Check for conditions without diagnosis
            $conditionsWithoutDiagnosis = $odontogram->toothConditions()
                ->where('diagnosis_status', 'needs_diagnosis')
                ->count();

            if ($conditionsWithoutDiagnosis > 0) {
                $validationResults['warnings'][] = [
                    'type' => 'missing_diagnosis',
                    'message' => "{$conditionsWithoutDiagnosis} kondisi gigi belum memiliki diagnosis utama",
                    'count' => $conditionsWithoutDiagnosis
                ];
            }

            // Check for bridges without diagnosis
            $bridgesWithoutDiagnosis = $odontogram->toothBridges()
                ->whereDoesntHave('primaryDiagnosis')
                ->count();

            if ($bridgesWithoutDiagnosis > 0) {
                $validationResults['warnings'][] = [
                    'type' => 'missing_bridge_diagnosis',
                    'message' => "{$bridgesWithoutDiagnosis} bridge belum memiliki diagnosis",
                    'count' => $bridgesWithoutDiagnosis
                ];
            }

            // Check for missing metadata
            if (empty($odontogram->general_notes)) {
                $validationResults['suggestions'][] = [
                    'type' => 'missing_notes',
                    'message' => 'Pertimbangkan untuk menambah catatan umum'
                ];
            }

            // Check DMFT calculation
            $dmftSummary = $odontogram->getDmftSummary();
            if ($dmftSummary['total'] === 0) {
                $validationResults['warnings'][] = [
                    'type' => 'zero_dmft',
                    'message' => 'Nilai DMFT adalah 0, pastikan semua kondisi gigi sudah tercatat'
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $validationResults
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memvalidasi odontogram'
            ], 500);
        }
    }


    /**
     * Delete specific items
     */
    public function deleteToothCondition(Request $request, ToothCondition $toothCondition)
    {
        try {
            $odontogram = $toothCondition->odontogram;
            $this->checkOdontogramAccess($odontogram, true);

            DB::transaction(function () use ($toothCondition, $odontogram) {
                // FIXED: Delete related diagnoses first (gunakan relasi baru)
                if ($toothCondition->primaryDiagnosis) {
                    $toothCondition->primaryDiagnosis->delete(); // This will cascade to secondary
                }

                // Delete related treatments
                $toothCondition->treatments()->delete();

                // Delete the condition
                $toothCondition->delete();

                // Recalculate DMFT
                $odontogram->calculateDmft();

                $this->createRevision(
                    $odontogram->id,
                    'tooth_conditions',
                    $toothCondition->id,
                    'delete',
                    $toothCondition->getAttributes(),
                    null,
                    'Condition deleted'
                );
            });

            return $this->handleResponse(true, 'Kondisi gigi berhasil dihapus.');
        } catch (Exception $e) {
            return $this->handleResponse(false, 'Gagal menghapus kondisi gigi: ' . $e->getMessage(), null, 500);
        }
    }

    public function deleteToothBridge(Request $request, ToothBridge $toothBridge)
    {
        try {
            $odontogram = $toothBridge->odontogram;
            $this->checkOdontogramAccess($odontogram, true);

            DB::transaction(function () use ($toothBridge, $odontogram) {
                // FIXED: Delete related diagnoses first (gunakan relasi baru)
                if ($toothBridge->primaryDiagnosis) {
                    $toothBridge->primaryDiagnosis->delete(); // This will cascade to secondary
                }

                // Delete related treatments
                $toothBridge->treatments()->delete();

                // Delete the bridge
                $toothBridge->delete();

                $this->createRevision(
                    $odontogram->id,
                    'tooth_bridges',
                    $toothBridge->id,
                    'delete',
                    $toothBridge->getAttributes(),
                    null,
                    'Bridge deleted'
                );
            });

            return $this->handleResponse(true, 'Bridge gigi berhasil dihapus.');
        } catch (Exception $e) {
            return $this->handleResponse(false, 'Gagal menghapus bridge gigi: ' . $e->getMessage(), null, 500);
        }
    }

    public function deleteToothIndicator(Request $request, ToothIndicator $toothIndicator)
    {
        try {
            $odontogram = $toothIndicator->odontogram;
            $this->checkOdontogramAccess($odontogram, true);

            DB::transaction(function () use ($toothIndicator, $odontogram) {
                // FIXED: Delete related diagnoses first (gunakan relasi baru)
                if ($toothIndicator->primaryDiagnosis) {
                    $toothIndicator->primaryDiagnosis->delete(); // This will cascade to secondary
                }

                // Delete related treatments
                $toothIndicator->treatments()->delete();

                $toothIndicator->delete();

                $this->createRevision(
                    $odontogram->id,
                    'tooth_indicators',
                    $toothIndicator->id,
                    'delete',
                    $toothIndicator->getAttributes(),
                    null,
                    'Indicator deleted'
                );
            });

            return $this->handleResponse(true, 'Indikator gigi berhasil dihapus.');
        } catch (Exception $e) {
            return $this->handleResponse(false, 'Gagal menghapus indikator gigi: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Reset odontogram (delete all conditions, bridges, indicators)
     */
    public function resetOdontogram(Odontogram $odontogram)
    {
        try {
            $this->checkOdontogramAccess($odontogram, true);

            DB::transaction(function () use ($odontogram) {
                // FIXED: Delete all related data (gunakan relasi baru)
                $odontogram->toothConditions()->each(function ($condition) {
                    if ($condition->primaryDiagnosis) {
                        $condition->primaryDiagnosis->delete(); // This will cascade to secondary
                    }
                    $condition->treatments()->delete();
                    $condition->delete();
                });

                $odontogram->toothBridges()->each(function ($bridge) {
                    if ($bridge->primaryDiagnosis) {
                        $bridge->primaryDiagnosis->delete(); // This will cascade to secondary
                    }
                    $bridge->treatments()->delete();
                    $bridge->delete();
                });

                $odontogram->toothIndicators()->each(function ($indicator) {
                    if ($indicator->primaryDiagnosis) {
                        $indicator->primaryDiagnosis->delete(); // This will cascade to secondary
                    }
                    $indicator->treatments()->delete();
                    $indicator->delete();
                });

                // Reset metadata but keep general notes
                $odontogram->update([
                    'occlusion' => 'normal',
                    'torus_palatinus' => 'none',
                    'torus_mandibularis' => 'none',
                    'palatum' => 'medium',
                    'diastema' => null,
                    'gigi_anomali' => null,
                    'others' => null,
                    'd_value' => 0,
                    'm_value' => 0,
                    'f_value' => 0
                ]);

                $this->createRevision(
                    $odontogram->id,
                    'odontograms',
                    $odontogram->id,
                    'update',
                    null,
                    ['reset' => true],
                    'Odontogram reset'
                );
            });

            return $this->handleResponse(true, 'Odontogram berhasil direset.');
        } catch (Exception $e) {
            return $this->handleResponse(false, 'Gagal mereset odontogram: ' . $e->getMessage(), null, 500);
        }
    }
}
