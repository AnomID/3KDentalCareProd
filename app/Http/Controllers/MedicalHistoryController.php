<?php

namespace App\Http\Controllers;

use App\Models\MedicalHistory;
use App\Models\Patient;
use App\Models\Doctor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Exception;

class MedicalHistoryController extends Controller
{
    /**
     * Display the medical history of a patient
     */
    public function show($patientId)
    {
        try {
            // Check permissions - only doctors and the patient themselves should view
            $user = Auth::user();
            $patient = Patient::findOrFail($patientId);

            if ($user->role === 'patient') {
                $userPatient = Patient::where('user_id', $user->id)->first();
                if (!$userPatient || $userPatient->id !== $patient->id) {
                    abort(403, 'Anda tidak memiliki akses ke riwayat medis ini.');
                }
            } elseif ($user->role === 'doctor') {
                // Dokter boleh melihat riwayat medis pasien
                // Mungkin perlu tambahan logika jika hanya dokter yang menangani pasien yang boleh melihat
            } elseif ($user->role !== 'admin' && $user->role !== 'employee') {
                abort(403, 'Anda tidak memiliki akses ke riwayat medis ini.');
            }

            $medicalHistory = $patient->medicalHistory;
            $bloodTypes = MedicalHistory::BLOOD_TYPES;

            // Log untuk debugging
            Log::info('MedicalHistory::show - Patient: ' . $patient->id . ', Has Medical History: ' . ($medicalHistory ? 'Yes' : 'No'));

            return Inertia::render('MedicalHistory/Show', [
                'patient' => $patient,
                'medicalHistory' => $medicalHistory,
                'bloodTypes' => $bloodTypes,
            ]);
        } catch (Exception $e) {
            Log::error('MedicalHistory::show - Error: ' . $e->getMessage(), [
                'patient_id' => $patientId,
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'Error loading medical history: ' . $e->getMessage());
        }
    }

    /**
     * Simpan atau perbarui medical history pasien
     */
    public function saveOrUpdate(Request $request, $patientId)
    {
        try {
            // Check permissions - only doctors should update medical history
            $user = Auth::user();
            if ($user->role !== 'doctor') {
                abort(403, 'Hanya dokter yang dapat memperbarui riwayat medis.');
            }

            $doctor = Doctor::where('user_id', $user->id)->first();
            if (!$doctor) {
                abort(403, 'Data dokter tidak ditemukan.');
            }

            // Validasi input dari form
            $validator = Validator::make($request->all(), [
                'blood_type' => 'nullable|string',
                'blood_pressure' => 'nullable|string|max:10',
                'blood_pressure_status' => 'nullable|string|in:normal,hypertension,hypotension',
                'has_heart_disease' => 'boolean',
                'heart_disease_note' => 'nullable|string|max:500',
                'has_diabetes' => 'boolean',
                'diabetes_note' => 'nullable|string|max:500',
                'has_hemophilia' => 'boolean',
                'hemophilia_note' => 'nullable|string|max:500',
                'has_hepatitis' => 'boolean',
                'hepatitis_note' => 'nullable|string|max:500',
                'has_gastritis' => 'boolean',
                'gastritis_note' => 'nullable|string|max:500',
                'has_other_disease' => 'boolean',
                'other_disease_note' => 'nullable|string|max:500',
                'has_drug_allergy' => 'boolean',
                'drug_allergy_note' => 'nullable|string|max:500',
                'has_food_allergy' => 'boolean',
                'food_allergy_note' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                if ($request->wantsJson()) {
                    return response()->json(['errors' => $validator->errors()], 422);
                }
                return redirect()->back()->withErrors($validator)->withInput();
            }

            // Cek apakah pasien memiliki riwayat medis
            $patient = Patient::findOrFail($patientId);
            $medicalHistory = $patient->medicalHistory;

            // Data yang akan disimpan
            $data = $request->all();

            // Tambahkan ID dokter yang mengupdate
            $data['updated_by_doctor_id'] = $doctor->id;

            // Pastikan nilai boolean di-convert dengan benar
            $booleanFields = [
                'has_heart_disease',
                'has_diabetes',
                'has_hemophilia',
                'has_hepatitis',
                'has_gastritis',
                'has_other_disease',
                'has_drug_allergy',
                'has_food_allergy'
            ];

            foreach ($booleanFields as $field) {
                $data[$field] = filter_var($data[$field], FILTER_VALIDATE_BOOLEAN);
            }

            // Debugging
            Log::info('MedicalHistory::saveOrUpdate - Data:', $data);

            // Jika sudah ada, update
            if ($medicalHistory) {
                $medicalHistory->update($data);
                $success = 'Medical history updated successfully';
            } else {
                // Jika belum ada, buat baru
                $data['patient_id'] = $patientId;
                $medicalHistory = MedicalHistory::create($data);
                $success = 'Medical history created successfully';
            }

            // Log hasil untuk debugging
            Log::info('MedicalHistory::saveOrUpdate - Result: ' . ($medicalHistory->wasRecentlyCreated ? 'created' : 'updated') . ', ID: ' . $medicalHistory->id);

            // Jika request dari Inertia/AJAX
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => $success,
                    'medical_history' => $medicalHistory,
                ]);
            }

            // Jika request dari form normal, redirect sesuai parameter redirect_url jika ada
            if ($request->has('redirect_url')) {
                return redirect($request->input('redirect_url'))->with('success', $success);
            }

            // Default redirect
            return redirect()->back()->with('success', $success);
        } catch (Exception $e) {
            Log::error('MedicalHistory::saveOrUpdate - Error: ' . $e->getMessage(), [
                'patient_id' => $patientId,
                'request_data' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error saving medical history: ' . $e->getMessage()
                ], 500);
            }

            return redirect()->back()->with('error', 'Error saving medical history: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Mendapatkan data medical history pasien via API
     */
    public function getByPatient($patientId)
    {
        try {
            // Check permissions - only doctors and the patient themselves should view
            $user = Auth::user();
            $patient = Patient::findOrFail($patientId);

            if ($user->role === 'patient') {
                $userPatient = Patient::where('user_id', $user->id)->first();
                if (!$userPatient || $userPatient->id !== $patient->id) {
                    abort(403, 'Anda tidak memiliki akses ke riwayat medis ini.');
                }
            } elseif ($user->role === 'doctor') {
                // Dokter boleh melihat riwayat medis pasien
                // Mungkin perlu tambahan logika jika hanya dokter yang menangani pasien yang boleh melihat
            } elseif ($user->role !== 'admin' && $user->role !== 'employee') {
                abort(403, 'Anda tidak memiliki akses ke riwayat medis ini.');
            }

            $medicalHistory = $patient->medicalHistory;

            return response()->json([
                'success' => true,
                'medical_history' => $medicalHistory,
            ]);
        } catch (Exception $e) {
            Log::error('MedicalHistory::getByPatient - Error: ' . $e->getMessage(), [
                'patient_id' => $patientId,
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error retrieving medical history: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan daftar golongan darah untuk dropdown
     */
    public function getBloodTypes()
    {
        try {
            return response()->json([
                'success' => true,
                'blood_types' => MedicalHistory::BLOOD_TYPES,
            ]);
        } catch (Exception $e) {
            Log::error('MedicalHistory::getBloodTypes - Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error retrieving blood types: ' . $e->getMessage()
            ], 500);
        }
    }
}
