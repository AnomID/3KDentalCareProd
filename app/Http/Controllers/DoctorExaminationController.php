<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\MedicalHistory;
use App\Models\Odontogram;
use App\Models\Icd10CodesDiagnoses;
use App\Models\Icd10CodesExternalCause;
use App\Models\Icd9cmCodes;
use App\Models\ToothDiagnosesPrimary;
use App\Models\ToothDiagnosesSecondary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use Exception;

class DoctorExaminationController extends Controller
{
    /**
     * Display the examination panel for an appointment
     */
    public function show($appointmentId)
    {
        $user = Auth::user();

        Log::info('DoctorExaminationController::show - Access attempt', [
            'appointment_id' => $appointmentId,
            'user_id' => $user->id,
            'user_role' => $user->role
        ]);

        if ($user->role !== 'doctor') {
            Log::warning('DoctorExaminationController::show - Non-doctor access attempt', [
                'user_id' => $user->id,
                'role' => $user->role
            ]);
            return redirect()->route('doctor.dashboard')
                ->with('error', 'Anda tidak memiliki izin untuk mengakses halaman ini.');
        }

        try {
            // Get appointment with related data
            $appointment = Appointment::with([
                'patient',
                'doctor',
                'schedule',
                'queue',
                'odontogram',
                'odontogram.toothConditions.primaryDiagnosis.icd10Diagnosis',
                'odontogram.toothConditions.secondaryDiagnoses.icd10Diagnosis',
                'odontogram.toothConditions.treatments',
                'odontogram.toothBridges.primaryDiagnosis.icd10Diagnosis',
                'odontogram.toothBridges.secondaryDiagnoses.icd10Diagnosis',
                'odontogram.toothBridges.treatments',
                'odontogram.toothIndicators.primaryDiagnosis.icd10Diagnosis',
                'odontogram.toothIndicators.secondaryDiagnoses.icd10Diagnosis',
                'odontogram.toothIndicators.treatments',
            ])->findOrFail($appointmentId);

            $doctor = Doctor::where('user_id', $user->id)->first();

            if (!$doctor || $appointment->doctor_id !== $doctor->id) {
                Log::warning('DoctorExaminationController::show - Unauthorized doctor access', [
                    'appointment_doctor_id' => $appointment->doctor_id,
                    'doctor_id' => $doctor ? $doctor->id : null
                ]);
                return redirect()->route('doctor.dashboard')
                    ->with('error', 'Janji temu ini bukan milik Anda.');
            }

            $patient = $appointment->patient;
            $medicalHistory = $patient->medicalHistory;
            $bloodTypes = MedicalHistory::BLOOD_TYPES ?? [
                'A+',
                'A-',
                'B+',
                'B-',
                'AB+',
                'AB-',
                'O+',
                'O-'
            ];

            $canEditMedicalHistory = in_array($appointment->status, ['scheduled', 'confirmed']);
            $odontogram = $this->getOrCreateOdontogramWithHistory($appointment, $patient);

            // Get dental data for odontogram
            $icd10DiagnosisCodes = $this->getIcd10DiagnosisCodes();
            $icd10ExternalCauseCodes = $this->getIcd10ExternalCauseCodes();
            $icd9cmCodes = $this->getIcd9cmCodes();

            // ENHANCED: Get appointment viewing context
            $appointmentContext = $appointment->getAppointmentViewingContext();

            // NEW: Get complete appointment history for this patient-doctor combination
            $appointmentHistory = $appointment->getAppointmentHistoryWithCurrent();

            Log::info('DoctorExaminationController::show - Enhanced context loaded', [
                'render_path' => 'Dokter/ExaminationPanel/Index',
                'patient_id' => $patient->id,
                'has_medical_history' => (bool)$medicalHistory,
                'has_odontogram' => (bool)$odontogram,
                'appointment_mode' => $appointmentContext['mode'],
                'next_appointment_id' => $appointmentContext['appointment_to_show'] ? $appointmentContext['appointment_to_show']->id : null,
                'can_edit_next' => $appointmentContext['can_edit'],
                'can_delete_next' => $appointmentContext['can_delete'],
                'appointment_history_count' => $appointmentHistory->count(),
            ]);

            // Prepare the data for the view
            $viewData = [
                'appointment' => $appointment,
                'patient' => $patient,
                'medicalHistory' => $medicalHistory,
                'bloodTypes' => $bloodTypes,
                'canEdit' => $canEditMedicalHistory,
                'odontogram' => $odontogram,
                'icd10DiagnosisCodes' => $icd10DiagnosisCodes,
                'icd10ExternalCauseCodes' => $icd10ExternalCauseCodes,
                'icd9cmCodes' => $icd9cmCodes,
                'odontogramStatistics' => $odontogram ? $odontogram->getStatistics() : null,
                'patientOdontogramHistory' => $this->getPatientOdontogramHistory($patient->id, $appointmentId),
                // ENHANCED: Add appointment context and history
                'appointmentContext' => $appointmentContext,
                'appointmentHistory' => $appointmentHistory,
            ];

            return Inertia::render('Dokter/ExaminationPanel/Index', $viewData);
        } catch (Exception $e) {
            Log::error('DoctorExaminationController::show - Exception', [
                'appointment_id' => $appointmentId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            if (app()->environment('local')) {
                return response()->json([
                    'error' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString()
                ], 500);
            }

            return redirect()->route('doctor.dashboard')
                ->with('error', 'Terjadi kesalahan saat memuat panel pemeriksaan: ' . $e->getMessage());
        }
    }

    /**
     * Get existing or create new odontogram for appointment with smart history logic
     */
    private function getOrCreateOdontogramWithHistory(Appointment $appointment, Patient $patient)
    {
        // Check if odontogram exists for this appointment
        $odontogram = $appointment->odontogram;

        // If not exists, create new one with smart logic
        if (!$odontogram) {
            try {
                DB::beginTransaction();

                // Check if this patient has previous appointments with odontograms
                $previousAppointmentWithOdontogram = $this->findLatestPatientOdontogram($patient->id, $appointment->id);

                $odontogram = new Odontogram([
                    'patient_id' => $appointment->patient_id,
                    'appointment_id' => $appointment->id,
                    'doctor_id' => $appointment->doctor_id,
                    'examination_date' => Carbon::today(),
                    'occlusion' => 'normal',
                    'torus_palatinus' => 'none',
                    'torus_mandibularis' => 'none',
                    'palatum' => 'medium',
                    'd_value' => 0,
                    'm_value' => 0,
                    'f_value' => 0,
                    'is_active' => true
                ]);

                // If patient has previous odontogram, copy the metadata and general notes
                if ($previousAppointmentWithOdontogram && $previousAppointmentWithOdontogram->odontogram) {
                    $this->copyOdontogramMetadata($previousAppointmentWithOdontogram->odontogram, $odontogram);
                }

                $odontogram->save();

                // If patient has previous odontogram, copy all tooth conditions, bridges, and indicators
                if ($previousAppointmentWithOdontogram && $previousAppointmentWithOdontogram->odontogram) {
                    $this->copyCompleteOdontogramData($previousAppointmentWithOdontogram->odontogram, $odontogram);
                }

                DB::commit();

                Log::info('Odontogram created successfully', [
                    'appointment_id' => $appointment->id,
                    'patient_id' => $patient->id,
                    'has_previous_data' => (bool)$previousAppointmentWithOdontogram,
                    'odontogram_id' => $odontogram->id
                ]);

                return $odontogram;
            } catch (Exception $e) {
                DB::rollBack();
                Log::error('Error creating odontogram: ' . $e->getMessage(), [
                    'appointment_id' => $appointment->id,
                    'patient_id' => $patient->id,
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString()
                ]);

                throw $e;
            }
        }

        return $odontogram;
    }

    /**
     * Find the latest odontogram for a patient (excluding current appointment)
     */
    private function findLatestPatientOdontogram($patientId, $currentAppointmentId)
    {
        return Appointment::where('patient_id', $patientId)
            ->where('id', '!=', $currentAppointmentId)
            ->whereHas('odontogram')
            ->with([
                'odontogram.toothConditions.primaryDiagnosis.icd10Diagnosis',
                'odontogram.toothConditions.secondaryDiagnoses.icd10Diagnosis',
                'odontogram.toothConditions.treatments',
                'odontogram.toothBridges.primaryDiagnosis.icd10Diagnosis',
                'odontogram.toothBridges.secondaryDiagnoses.icd10Diagnosis',
                'odontogram.toothBridges.treatments',
                'odontogram.toothIndicators.primaryDiagnosis.icd10Diagnosis',
                'odontogram.toothIndicators.secondaryDiagnoses.icd10Diagnosis',
                'odontogram.toothIndicators.treatments'
            ])
            ->orderBy('appointment_date', 'desc')
            ->orderBy('appointment_time', 'desc')
            ->first();
    }

    /**
     * Copy odontogram metadata from previous odontogram
     */
    private function copyOdontogramMetadata(Odontogram $sourceOdontogram, Odontogram $targetOdontogram)
    {
        $targetOdontogram->general_notes = $sourceOdontogram->general_notes;
        $targetOdontogram->occlusion = $sourceOdontogram->occlusion;
        $targetOdontogram->torus_palatinus = $sourceOdontogram->torus_palatinus;
        $targetOdontogram->torus_mandibularis = $sourceOdontogram->torus_mandibularis;
        $targetOdontogram->palatum = $sourceOdontogram->palatum;
        $targetOdontogram->diastema = $sourceOdontogram->diastema;
        $targetOdontogram->gigi_anomali = $sourceOdontogram->gigi_anomali;
        $targetOdontogram->others = $sourceOdontogram->others;

        Log::info('Odontogram metadata copied', [
            'source_id' => $sourceOdontogram->id,
            'target_id' => $targetOdontogram->id,
            'copied_notes' => !empty($sourceOdontogram->general_notes)
        ]);
    }

    /**
     * Copy complete odontogram data from previous appointment
     */
    private function copyCompleteOdontogramData(Odontogram $sourceOdontogram, Odontogram $targetOdontogram)
    {
        try {
            // Copy tooth conditions
            $conditionsCount = 0;
            $sourceOdontogram->toothConditions->each(function ($condition) use ($targetOdontogram, &$conditionsCount) {
                $newCondition = $condition->replicate(['id']);
                $newCondition->odontogram_id = $targetOdontogram->id;
                $newCondition->created_at = now();
                $newCondition->updated_at = now();
                $newCondition->save();
                $conditionsCount++;

                // Copy primary diagnosis for this condition
                if ($condition->primaryDiagnosis) {
                    $newPrimaryDiagnosis = $condition->primaryDiagnosis->replicate(['id']);
                    $newPrimaryDiagnosis->tooth_condition_id = $newCondition->id;
                    $newPrimaryDiagnosis->tooth_bridge_id = null;
                    $newPrimaryDiagnosis->tooth_indicator_id = null;
                    $newPrimaryDiagnosis->diagnosed_by = Auth::id();
                    $newPrimaryDiagnosis->diagnosed_at = now();
                    $newPrimaryDiagnosis->save();

                    // Copy secondary diagnoses
                    $condition->secondaryDiagnoses->each(function ($secondaryDiagnosis) use ($newPrimaryDiagnosis) {
                        $newSecondaryDiagnosis = $secondaryDiagnosis->replicate(['id']);
                        $newSecondaryDiagnosis->tooth_diagnoses_primary_id = $newPrimaryDiagnosis->id;
                        $newSecondaryDiagnosis->diagnosed_by = Auth::id();
                        $newSecondaryDiagnosis->diagnosed_at = now();
                        $newSecondaryDiagnosis->save();
                    });
                }

                // Copy treatments for this condition
                $condition->treatments->each(function ($treatment) use ($newCondition) {
                    $newTreatment = $treatment->replicate(['id']);
                    $newTreatment->tooth_condition_id = $newCondition->id;
                    $newTreatment->tooth_bridge_id = null;
                    $newTreatment->tooth_indicator_id = null;
                    $newTreatment->created_by = Auth::id();
                    $newTreatment->save();

                    // Copy treatment procedures
                    $treatment->procedures->each(function ($procedure) use ($newTreatment) {
                        $newTreatment->procedures()->create([
                            'icd_9cm_codes_id' => $procedure->icd_9cm_codes_id
                        ]);
                    });
                });
            });

            // Copy tooth bridges
            $bridgesCount = 0;
            $sourceOdontogram->toothBridges->each(function ($bridge) use ($targetOdontogram, &$bridgesCount) {
                $newBridge = $bridge->replicate(['id']);
                $newBridge->odontogram_id = $targetOdontogram->id;
                $newBridge->created_at = now();
                $newBridge->updated_at = now();
                $newBridge->save();
                $bridgesCount++;

                // Copy primary diagnosis for this bridge
                if ($bridge->primaryDiagnosis) {
                    $newPrimaryDiagnosis = $bridge->primaryDiagnosis->replicate(['id']);
                    $newPrimaryDiagnosis->tooth_condition_id = null;
                    $newPrimaryDiagnosis->tooth_bridge_id = $newBridge->id;
                    $newPrimaryDiagnosis->tooth_indicator_id = null;
                    $newPrimaryDiagnosis->diagnosed_by = Auth::id();
                    $newPrimaryDiagnosis->diagnosed_at = now();
                    $newPrimaryDiagnosis->save();

                    // Copy secondary diagnoses
                    $bridge->secondaryDiagnoses->each(function ($secondaryDiagnosis) use ($newPrimaryDiagnosis) {
                        $newSecondaryDiagnosis = $secondaryDiagnosis->replicate(['id']);
                        $newSecondaryDiagnosis->tooth_diagnoses_primary_id = $newPrimaryDiagnosis->id;
                        $newSecondaryDiagnosis->diagnosed_by = Auth::id();
                        $newSecondaryDiagnosis->diagnosed_at = now();
                        $newSecondaryDiagnosis->save();
                    });
                }

                // Copy treatments for this bridge
                $bridge->treatments->each(function ($treatment) use ($newBridge) {
                    $newTreatment = $treatment->replicate(['id']);
                    $newTreatment->tooth_condition_id = null;
                    $newTreatment->tooth_bridge_id = $newBridge->id;
                    $newTreatment->tooth_indicator_id = null;
                    $newTreatment->created_by = Auth::id();
                    $newTreatment->save();

                    // Copy treatment procedures
                    $treatment->procedures->each(function ($procedure) use ($newTreatment) {
                        $newTreatment->procedures()->create([
                            'icd_9cm_codes_id' => $procedure->icd_9cm_codes_id
                        ]);
                    });
                });
            });

            // Copy tooth indicators
            $indicatorsCount = 0;
            $sourceOdontogram->toothIndicators->each(function ($indicator) use ($targetOdontogram, &$indicatorsCount) {
                $newIndicator = $indicator->replicate(['id']);
                $newIndicator->odontogram_id = $targetOdontogram->id;
                $newIndicator->created_at = now();
                $newIndicator->updated_at = now();
                $newIndicator->save();
                $indicatorsCount++;

                // Copy primary diagnosis for this indicator
                if ($indicator->primaryDiagnosis) {
                    $newPrimaryDiagnosis = $indicator->primaryDiagnosis->replicate(['id']);
                    $newPrimaryDiagnosis->tooth_condition_id = null;
                    $newPrimaryDiagnosis->tooth_bridge_id = null;
                    $newPrimaryDiagnosis->tooth_indicator_id = $newIndicator->id;
                    $newPrimaryDiagnosis->diagnosed_by = Auth::id();
                    $newPrimaryDiagnosis->diagnosed_at = now();
                    $newPrimaryDiagnosis->save();

                    // Copy secondary diagnoses
                    $indicator->secondaryDiagnoses->each(function ($secondaryDiagnosis) use ($newPrimaryDiagnosis) {
                        $newSecondaryDiagnosis = $secondaryDiagnosis->replicate(['id']);
                        $newSecondaryDiagnosis->tooth_diagnoses_primary_id = $newPrimaryDiagnosis->id;
                        $newSecondaryDiagnosis->diagnosed_by = Auth::id();
                        $newSecondaryDiagnosis->diagnosed_at = now();
                        $newSecondaryDiagnosis->save();
                    });
                }

                // Copy treatments for this indicator
                $indicator->treatments->each(function ($treatment) use ($newIndicator) {
                    $newTreatment = $treatment->replicate(['id']);
                    $newTreatment->tooth_condition_id = null;
                    $newTreatment->tooth_bridge_id = null;
                    $newTreatment->tooth_indicator_id = $newIndicator->id;
                    $newTreatment->created_by = Auth::id();
                    $newTreatment->save();

                    // Copy treatment procedures
                    $treatment->procedures->each(function ($procedure) use ($newTreatment) {
                        $newTreatment->procedures()->create([
                            'icd_9cm_codes_id' => $procedure->icd_9cm_codes_id
                        ]);
                    });
                });
            });

            // Recalculate DMF-T values
            $targetOdontogram->calculateDmft();

            Log::info('Complete odontogram data copied', [
                'source_id' => $sourceOdontogram->id,
                'target_id' => $targetOdontogram->id,
                'conditions_copied' => $conditionsCount,
                'bridges_copied' => $bridgesCount,
                'indicators_copied' => $indicatorsCount,
            ]);
        } catch (Exception $e) {
            Log::error('Error copying complete odontogram data: ' . $e->getMessage(), [
                'source_id' => $sourceOdontogram->id,
                'target_id' => $targetOdontogram->id,
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);
            throw $e;
        }
    }

    /**
     * Get patient's odontogram history
     */
    private function getPatientOdontogramHistory($patientId, $currentAppointmentId)
    {
        return Appointment::where('patient_id', $patientId)
            ->where('id', '!=', $currentAppointmentId)
            ->whereHas('odontogram')
            ->with(['odontogram:id,appointment_id,examination_date,is_finalized,d_value,m_value,f_value'])
            ->orderBy('appointment_date', 'desc')
            ->orderBy('appointment_time', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($appointment) {
                return [
                    'appointment_id' => $appointment->id,
                    'appointment_date' => $appointment->appointment_date,
                    'appointment_time' => $appointment->appointment_time,
                    'odontogram' => $appointment->odontogram ? [
                        'id' => $appointment->odontogram->id,
                        'examination_date' => $appointment->odontogram->examination_date,
                        'is_finalized' => $appointment->odontogram->is_finalized,
                        'dmft_summary' => $appointment->odontogram->getDmftSummary(),
                    ] : null
                ];
            });
    }

    /**
     * Get ICD-10 diagnosis codes with error handling
     */
    private function getIcd10DiagnosisCodes()
    {
        try {
            return Icd10CodesDiagnoses::active()
                ->select('id', 'code', 'description')
                ->orderBy('code')
                ->limit(100)
                ->get();
        } catch (Exception $e) {
            Log::warning('Error loading ICD-10 diagnosis codes: ' . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * Get ICD-10 external cause codes with error handling
     */
    private function getIcd10ExternalCauseCodes()
    {
        try {
            return Icd10CodesExternalCause::active()
                ->select('id', 'code', 'description')
                ->orderBy('code')
                ->limit(100)
                ->get();
        } catch (Exception $e) {
            Log::warning('Error loading ICD-10 external cause codes: ' . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * Get ICD-9-CM codes with error handling
     */
    private function getIcd9cmCodes()
    {
        try {
            return Icd9cmCodes::active()
                ->select('id', 'code', 'description')
                ->orderBy('code')
                ->limit(100)
                ->get();
        } catch (Exception $e) {
            Log::warning('Error loading ICD-9-CM codes: ' . $e->getMessage());
            return collect([]);
        }
    }

    /**
     * Complete an appointment
     */
    public function completeAppointment(Request $request, $appointmentId)
    {
        try {
            $appointment = Appointment::findOrFail($appointmentId);

            // Check if this is the doctor's appointment
            $doctor = Doctor::where('user_id', Auth::id())->first();
            if (!$doctor || $appointment->doctor_id !== $doctor->id) {
                return redirect()->back()->with('error', 'Anda tidak memiliki izin untuk menyelesaikan janji temu ini.');
            }

            DB::transaction(function () use ($appointment, $request) {
                // Update appointment status
                $appointment->status = 'completed';
                $appointment->completion_notes = $request->completion_notes;
                $appointment->completed_at = now();
                $appointment->save();

                // Optional: finalize odontogram if exists and not already finalized
                if ($appointment->odontogram && !$appointment->odontogram->is_finalized) {
                    $appointment->odontogram->finalize(Auth::id());
                }
            });

            return redirect()->route('doctor.appointments.today')->with('success', 'Janji temu berhasil diselesaikan.');
        } catch (Exception $e) {
            Log::error('Error completing appointment', [
                'appointment_id' => $appointmentId,
                'error' => $e->getMessage()
            ]);

            return redirect()->back()->with('error', 'Gagal menyelesaikan janji temu: ' . $e->getMessage());
        }
    }

    /**
     * Mark appointment as no-show
     */
    public function markNoShow($appointmentId)
    {
        try {
            $appointment = Appointment::findOrFail($appointmentId);

            // Check if this is the doctor's appointment
            $doctor = Doctor::where('user_id', Auth::id())->first();
            if (!$doctor || $appointment->doctor_id !== $doctor->id) {
                return redirect()->back()->with('error', 'Anda tidak memiliki izin untuk menandai janji temu ini.');
            }

            // Update appointment status
            $appointment->status = 'no_show';
            $appointment->save();

            return redirect()->route('doctor.appointments.today')->with('success', 'Pasien ditandai tidak hadir.');
        } catch (Exception $e) {
            Log::error('Error marking appointment as no-show', [
                'appointment_id' => $appointmentId,
                'error' => $e->getMessage()
            ]);

            return redirect()->back()->with('error', 'Gagal menandai janji temu: ' . $e->getMessage());
        }
    }

    /**
     * Navigate to another appointment in the same patient-doctor history
     * Enhanced navigation between appointments
     */
    public function navigateToAppointment($appointmentId, $targetAppointmentId)
    {
        try {
            $user = Auth::user();
            $doctor = Doctor::where('user_id', $user->id)->first();

            if (!$doctor) {
                return redirect()->route('doctor.dashboard')
                    ->with('error', 'Doctor profile not found.');
            }

            // Verify both appointments belong to this doctor
            $currentAppointment = Appointment::findOrFail($appointmentId);
            $targetAppointment = Appointment::findOrFail($targetAppointmentId);

            if ($currentAppointment->doctor_id !== $doctor->id || $targetAppointment->doctor_id !== $doctor->id) {
                return redirect()->route('doctor.dashboard')
                    ->with('error', 'Anda tidak memiliki izin untuk mengakses appointment ini.');
            }

            // Verify both appointments are for the same patient
            if ($currentAppointment->patient_id !== $targetAppointment->patient_id) {
                return redirect()->route('doctor.examination.show', $appointmentId)
                    ->with('error', 'Appointment tersebut bukan untuk pasien yang sama.');
            }

            Log::info('DoctorExaminationController::navigateToAppointment - Navigation', [
                'from_appointment_id' => $appointmentId,
                'to_appointment_id' => $targetAppointmentId,
                'doctor_id' => $doctor->id,
                'patient_id' => $currentAppointment->patient_id,
            ]);

            // Redirect to the target appointment examination
            return redirect()->route('doctor.examination.show', $targetAppointmentId)
                ->with('success', 'Berhasil berpindah ke appointment yang dipilih.');
        } catch (Exception $e) {
            Log::error('DoctorExaminationController::navigateToAppointment - Error', [
                'from_appointment_id' => $appointmentId,
                'to_appointment_id' => $targetAppointmentId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('doctor.dashboard')
                ->with('error', 'Terjadi kesalahan saat berpindah appointment: ' . $e->getMessage());
        }
    }

    /**
     * Get appointment context (AJAX endpoint)
     * Quick appointment context check for frontend
     */
    public function getAppointmentContext($appointmentId)
    {
        try {
            $user = Auth::user();
            $doctor = Doctor::where('user_id', $user->id)->first();

            if (!$doctor) {
                return response()->json([
                    'error' => 'Doctor profile not found'
                ], 403);
            }

            $appointment = Appointment::with(['patient', 'doctor', 'schedule', 'queue'])
                ->findOrFail($appointmentId);

            // Verify doctor ownership
            if ($appointment->doctor_id !== $doctor->id) {
                return response()->json([
                    'error' => 'Unauthorized access to appointment'
                ], 403);
            }

            // Get appointment context
            $appointmentContext = $appointment->getAppointmentViewingContext();

            // Get appointment history
            $appointmentHistory = $appointment->getAppointmentHistoryWithCurrent();

            Log::info('DoctorExaminationController::getAppointmentContext - Success', [
                'appointment_id' => $appointmentId,
                'doctor_id' => $doctor->id,
                'context_mode' => $appointmentContext['mode'],
                'history_count' => $appointmentHistory->count(),
            ]);

            return response()->json([
                'success' => true,
                'appointmentContext' => $appointmentContext,
                'appointmentHistory' => $appointmentHistory,
                'appointment' => $appointment,
            ]);
        } catch (Exception $e) {
            Log::error('DoctorExaminationController::getAppointmentContext - Error', [
                'appointment_id' => $appointmentId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Failed to get appointment context: ' . $e->getMessage()
            ], 500);
        }
    }
}
