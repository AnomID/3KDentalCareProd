<?php

namespace App\Http\Controllers;

use App\Models\ToothCondition;
use App\Models\ToothBridge;
use App\Models\ToothIndicator;
use App\Models\ToothTreatment;
use App\Models\Icd9cmCodes;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Exception;

class ToothTreatmentController extends Controller
{
    /**
     * Store a new treatment with procedures
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                // One of these must be provided
                'tooth_condition_id' => 'nullable|exists:tooth_conditions,id',
                'tooth_bridge_id' => 'nullable|exists:tooth_bridges,id',
                'tooth_indicator_id' => 'nullable|exists:tooth_indicators,id',

                // Treatment data
                'icd_9cm_codes_ids' => 'required|array|min:1', // Array of ICD-9-CM code IDs
                'icd_9cm_codes_ids.*' => 'exists:icd_9cm_codes,id',
                'notes' => 'nullable|string|max:65535',
                'status' => 'required|in:planned,in_progress,completed',
                'planned_date' => 'nullable|date',
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

            $savedTreatment = null;

            DB::transaction(function () use ($validated, $request, &$savedTreatment) {
                // Get the parent model
                $parent = $this->getParentModel($validated);

                // Check access permissions
                $this->checkParentAccess($parent);

                // Check if parent can have treatment
                if (!$this->canAddTreatment($parent)) {
                    $parentType = class_basename($parent);
                    throw new Exception("Item {$parentType} tidak dapat ditambahkan treatment. Pastikan sudah ada diagnosis terlebih dahulu.");
                }

                // Cancel any existing active treatment for this parent
                $this->cancelExistingTreatments($validated);

                // Create new treatment
                $treatmentData = [
                    'tooth_condition_id' => $validated['tooth_condition_id'] ?? null,
                    'tooth_bridge_id' => $validated['tooth_bridge_id'] ?? null,
                    'tooth_indicator_id' => $validated['tooth_indicator_id'] ?? null,
                    'notes' => $validated['notes'] ?? null,
                    'status' => $validated['status'],
                    'planned_date' => $validated['planned_date'] ?? null,
                    'created_by' => Auth::id(),
                    'is_active' => true,
                ];

                // Set dates based on status
                if ($validated['status'] === 'in_progress') {
                    $treatmentData['started_date'] = now();
                } elseif ($validated['status'] === 'completed') {
                    $treatmentData['started_date'] = now();
                    $treatmentData['completed_date'] = now();
                    $treatmentData['completed_by'] = Auth::id();
                }

                $treatment = ToothTreatment::create($treatmentData);

                // Add procedures
                $treatment->syncProcedures($validated['icd_9cm_codes_ids']);

                // Update parent treatment status
                $this->updateParentTreatmentStatus($parent, $validated['status']);

                // Load relationships for response
                $savedTreatment = $treatment->load(['icd9cmCodes', 'createdBy', 'completedBy']);

                Log::info('Tooth treatment created', [
                    'treatment_id' => $treatment->id,
                    'parent_type' => $treatment->parent_type,
                    'parent_id' => $this->getParentId($validated),
                    'procedures_count' => count($validated['icd_9cm_codes_ids']),
                    'status' => $validated['status'],
                ]);
            });

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Treatment berhasil disimpan',
                    'data' => $savedTreatment
                ]);
            }

            return redirect()->back()
                ->with('success', 'Treatment berhasil disimpan')
                ->with('newTreatment', $savedTreatment);
        } catch (Exception $e) {
            Log::error('ToothTreatmentController::store - Error: ' . $e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Terjadi kesalahan saat menyimpan treatment: ' . $e->getMessage()
                ], 500);
            }

            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    /**
     * Update an existing treatment
     */
    public function update(Request $request, ToothTreatment $toothTreatment)
    {
        try {
            // Check access permissions
            $this->checkParentAccess($toothTreatment->parent);

            $validator = Validator::make($request->all(), [
                'icd_9cm_codes_ids' => 'required|array|min:1',
                'icd_9cm_codes_ids.*' => 'exists:icd_9cm_codes,id',
                'notes' => 'nullable|string|max:65535',
                'status' => 'required|in:planned,in_progress,completed',
                'planned_date' => 'nullable|date',
            ]);

            if ($validator->fails()) {
                if ($request->wantsJson()) {
                    return response()->json(['errors' => $validator->errors()], 422);
                }
                return redirect()->back()->withErrors($validator)->withInput();
            }

            $validated = $validator->validated();

            DB::transaction(function () use ($toothTreatment, $validated, $request) {
                $oldStatus = $toothTreatment->status;
                $newStatus = $validated['status'];

                $updateData = [
                    'notes' => $validated['notes'],
                    'status' => $newStatus,
                    'planned_date' => $validated['planned_date'],
                ];

                // Handle status changes
                if ($oldStatus !== $newStatus) {
                    if ($newStatus === 'in_progress' && !$toothTreatment->started_date) {
                        $updateData['started_date'] = now();
                    } elseif ($newStatus === 'completed') {
                        if (!$toothTreatment->started_date) {
                            $updateData['started_date'] = now();
                        }
                        if (!$toothTreatment->completed_date) {
                            $updateData['completed_date'] = now();
                            $updateData['completed_by'] = Auth::id();
                        }
                    } elseif ($newStatus === 'planned') {
                        // Reset dates when changing to planned
                        $updateData['started_date'] = null;
                        $updateData['completed_date'] = null;
                        $updateData['completed_by'] = null;
                    }
                }

                $toothTreatment->update($updateData);

                // Update procedures
                $toothTreatment->syncProcedures($validated['icd_9cm_codes_ids']);

                // Update parent status
                $this->updateParentTreatmentStatus($toothTreatment->parent, $newStatus);

                $toothTreatment->load(['icd9cmCodes', 'createdBy', 'completedBy']);

                Log::info('Tooth treatment updated', [
                    'treatment_id' => $toothTreatment->id,
                    'parent_type' => $toothTreatment->parent_type,
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus,
                ]);

                // Store for response
                $request->merge(['updatedTreatment' => $toothTreatment]);
            });

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Treatment berhasil diperbarui',
                    'data' => $request->get('updatedTreatment')
                ]);
            }

            return redirect()->back()
                ->with('success', 'Treatment berhasil diperbarui')
                ->with('updatedTreatment', $request->get('updatedTreatment'));
        } catch (Exception $e) {
            Log::error('ToothTreatmentController::update - Error: ' . $e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Terjadi kesalahan saat memperbarui treatment: ' . $e->getMessage()
                ], 500);
            }

            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }


    /**
     * Complete a treatment
     */
    public function complete(Request $request)
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
            $parent = $this->getParentModel($validated);
            $this->checkParentAccess($parent);

            DB::transaction(function () use ($parent, $validated) {
                $activeTreatment = $this->findActiveTreatment($validated);

                if (!$activeTreatment) {
                    throw new Exception('Tidak ada treatment aktif untuk item ini');
                }

                $success = $activeTreatment->completeTreatment(Auth::id());

                if (!$success) {
                    throw new Exception('Treatment tidak dapat diselesaikan');
                }

                // Update parent status
                $this->updateParentTreatmentStatus($parent, 'completed');

                Log::info('Tooth treatment completed', [
                    'treatment_id' => $activeTreatment->id,
                    'parent_type' => class_basename($parent),
                    'parent_id' => $parent->id,
                ]);
            });

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Treatment berhasil diselesaikan'
                ]);
            }

            return redirect()->back()->with('success', 'Treatment berhasil diselesaikan');
        } catch (Exception $e) {
            Log::error('ToothTreatmentController::complete - Error: ' . $e->getMessage());

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
     * Cancel a treatment
     */
    public function cancel(Request $request)
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
            $parent = $this->getParentModel($validated);
            $this->checkParentAccess($parent);

            DB::transaction(function () use ($parent, $validated) {
                $activeTreatment = $this->findActiveTreatment($validated);

                if (!$activeTreatment) {
                    throw new Exception('Tidak ada treatment aktif untuk item ini');
                }

                $success = $activeTreatment->cancelTreatment();

                if (!$success) {
                    throw new Exception('Treatment tidak dapat dibatalkan');
                }

                // Update parent status to no_treatment
                $this->updateParentTreatmentStatus($parent, 'no_treatment');

                Log::info('Tooth treatment cancelled', [
                    'treatment_id' => $activeTreatment->id,
                    'parent_type' => class_basename($parent),
                    'parent_id' => $parent->id,
                ]);
            });

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Treatment berhasil dibatalkan'
                ]);
            }

            return redirect()->back()->with('success', 'Treatment berhasil dibatalkan');
        } catch (Exception $e) {
            Log::error('ToothTreatmentController::cancel - Error: ' . $e->getMessage());

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
     * Delete a treatment
     */
    public function destroy(Request $request, ToothTreatment $toothTreatment)
    {
        try {
            // Check access permissions
            $this->checkParentAccess($toothTreatment->parent);

            DB::transaction(function () use ($toothTreatment) {
                // Update parent status before deleting
                $this->updateParentTreatmentStatus($toothTreatment->parent, 'no_treatment');

                $toothTreatment->delete();

                Log::info('Tooth treatment deleted', [
                    'treatment_id' => $toothTreatment->id,
                    'parent_type' => $toothTreatment->parent_type,
                ]);
            });

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Treatment berhasil dihapus'
                ]);
            }

            return redirect()->back()->with('success', 'Treatment berhasil dihapus');
        } catch (Exception $e) {
            Log::error('ToothTreatmentController::destroy - Error: ' . $e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Terjadi kesalahan saat menghapus treatment: ' . $e->getMessage()
                ], 500);
            }

            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }


    /**
     * Get treatment details
     */
    public function show(ToothTreatment $toothTreatment)
    {
        try {
            // Check access permissions
            $this->checkParentAccess($toothTreatment->parent);

            $treatment = $toothTreatment->load([
                'icd9cmCodes',
                'createdBy',
                'completedBy',
                'toothCondition',
                'toothBridge',
                'toothIndicator'
            ]);

            return response()->json([
                'success' => true,
                'data' => $treatment
            ]);
        } catch (Exception $e) {
            Log::error('ToothTreatmentController::show - Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat mengambil data treatment'
            ], 500);
        }
    }

    // Helper methods updated with complete bridge support
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

    // UPDATED: Bridge support in canAddTreatment
    private function canAddTreatment($parent)
    {
        if ($parent instanceof ToothCondition || $parent instanceof ToothIndicator) {
            return $parent->diagnosis_status === 'has_diagnosis';
        } elseif ($parent instanceof ToothBridge) {
            // For bridges, check if has primary diagnosis
            return $parent->primaryDiagnosis !== null;
        }

        return false;
    }

    private function cancelExistingTreatments(array $validated)
    {
        if (!empty($validated['tooth_condition_id'])) {
            ToothTreatment::where('tooth_condition_id', $validated['tooth_condition_id'])
                ->where('is_active', true)
                ->update(['is_active' => false, 'status' => ToothTreatment::STATUS_CANCELLED]);
        } elseif (!empty($validated['tooth_bridge_id'])) {
            ToothTreatment::where('tooth_bridge_id', $validated['tooth_bridge_id'])
                ->where('is_active', true)
                ->update(['is_active' => false, 'status' => ToothTreatment::STATUS_CANCELLED]);
        } elseif (!empty($validated['tooth_indicator_id'])) {
            ToothTreatment::where('tooth_indicator_id', $validated['tooth_indicator_id'])
                ->where('is_active', true)
                ->update(['is_active' => false, 'status' => ToothTreatment::STATUS_CANCELLED]);
        }
    }

    // UPDATED: Bridge support in updateParentTreatmentStatus
    private function updateParentTreatmentStatus($parent, $treatmentStatus)
    {
        if ($parent instanceof ToothCondition || $parent instanceof ToothIndicator) {
            $statusMapping = [
                'planned' => 'needs_treatment',
                'in_progress' => 'treatment_in_progress',
                'completed' => 'treatment_completed',
                'cancelled' => 'needs_treatment',
                'no_treatment' => 'no_treatment',
            ];

            $newStatus = $statusMapping[$treatmentStatus] ?? 'no_treatment';
            $parent->update(['treatment_status' => $newStatus]);
        } elseif ($parent instanceof ToothBridge) {
            // For bridges, treatment status is calculated dynamically based on active treatment
            // No need to update a field, but we can log the status change
            Log::info('Bridge treatment status updated', [
                'bridge_id' => $parent->id,
                'treatment_status' => $treatmentStatus,
            ]);
        }
    }

    /**
     * Find active treatment for any parent type
     */
    private function findActiveTreatment(array $validated)
    {
        if (!empty($validated['tooth_condition_id'])) {
            return ToothTreatment::where('tooth_condition_id', $validated['tooth_condition_id'])
                ->where('is_active', true)
                ->first();
        } elseif (!empty($validated['tooth_bridge_id'])) {
            return ToothTreatment::where('tooth_bridge_id', $validated['tooth_bridge_id'])
                ->where('is_active', true)
                ->first();
        } elseif (!empty($validated['tooth_indicator_id'])) {
            return ToothTreatment::where('tooth_indicator_id', $validated['tooth_indicator_id'])
                ->where('is_active', true)
                ->first();
        }

        return null;
    }

    private function checkParentAccess($parent)
    {
        if (!$parent) {
            abort(404, 'Parent item tidak ditemukan');
        }

        $user = Auth::user();
        $odontogram = $parent->odontogram;

        if ($user->role === 'patient') {
            abort(403, 'Hanya dokter yang dapat mengedit treatment.');
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
