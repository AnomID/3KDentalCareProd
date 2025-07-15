<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Schedule;
use App\Models\ScheduleException;
use App\Models\ScheduleQuota;
use App\Models\Queue;
use App\Models\MedicalHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Log;

class DoctorAppointmentController extends AppointmentController
{
    /**
     * Display a listing of the doctor's appointments
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();

            // Find the doctor record associated with this user
            $doctor = Doctor::where('user_id', $user->id)->first();

            // Check if doctor record exists
            if (!$doctor) {
                return Inertia::render('Error', [
                    'status' => 400,
                    'message' => 'Your doctor profile is not set up properly. Please contact support.',
                ]);
            }

            // Start query with eager loading relationships
            $query = Appointment::with(['patient', 'doctor', 'schedule'])
                ->where('doctor_id', $doctor->id);

            // Apply date filter if provided
            if ($request->has('date')) {
                $query->whereDate('appointment_date', $request->date);
            }

            // Apply status filter if provided
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Get paginated data
            $appointments = $query->orderBy('appointment_date', 'desc')
                ->orderBy('appointment_time', 'asc')
                ->paginate(10)
                ->withQueryString();

            return Inertia::render('Dokter/Appointment/Index', [
                'appointments' => $appointments,
                'filters' => $request->only(['date', 'status']),
            ]);
        } catch (Exception $e) {
            return Inertia::render('Error', [
                'status' => 500,
                'message' => 'Error loading appointments: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Display today's appointments for the doctor
     */
    public function today(Request $request)
    {
        try {
            $user = Auth::user();

            // Find the doctor record associated with this user
            $doctor = Doctor::where('user_id', $user->id)->first();

            // Check if doctor record exists
            if (!$doctor) {
                return Inertia::render('Error', [
                    'status' => 400,
                    'message' => 'Your doctor profile is not set up properly. Please contact support.',
                ]);
            }

            // Start query with eager loading relationships
            $query = Appointment::with(['patient', 'doctor', 'schedule'])
                ->where('doctor_id', $doctor->id)
                ->whereDate('appointment_date', Carbon::today());

            // Apply status filter if provided
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Get paginated data
            $appointments = $query->orderBy('appointment_time', 'asc')
                ->paginate(10)
                ->withQueryString();

            return Inertia::render('Dokter/Appointment/Today', [
                'appointments' => $appointments,
                'filters' => $request->only(['status']),
                'today' => Carbon::today()->format('Y-m-d'),
            ]);
        } catch (Exception $e) {
            return Inertia::render('Error', [
                'status' => 500,
                'message' => 'Error loading today\'s appointments: ' . $e->getMessage(),
            ]);
        }
    }

    public function show($id)
    {
        try {
            $user = Auth::user();
            $appointment = Appointment::findOrFail($id);

            // Verifikasi bahwa appointment milik dokter ini
            $doctor = Doctor::where('user_id', $user->id)->first();
            if (!$doctor || $appointment->doctor_id !== $doctor->id) {
                Log::warning('DoctorAppointmentController::show - Unauthorized access attempt', [
                    'appointment_id' => $id,
                    'user_id' => $user->id,
                    'doctor_id' => $doctor ? $doctor->id : null,
                    'appointment_doctor_id' => $appointment->doctor_id
                ]);
                return redirect()->route('doctor.dashboard')
                    ->with('error', 'Janji temu ini bukan milik Anda.');
            }

            // Load appointment with all necessary relationships
            $appointment->load(['patient', 'doctor', 'schedule', 'queue', 'odontogram']);

            // Ambil pasien dengan relasi medicalHistory secara eksplisit
            $patient = Patient::with('medicalHistory')->where('id', $appointment->patient_id)->first();
            $medicalHistory = $patient->medicalHistory;

            // Ambil data yang dibutuhkan untuk appointment saat ini
            $canCancel = $appointment->status === 'confirmed';
            $canComplete = $appointment->status === 'confirmed';
            $canMarkNoShow = $appointment->status === 'confirmed';
            $medicalRecord = $appointment->medicalRecord ?? null;
            $bloodTypes = MedicalHistory::BLOOD_TYPES;

            // NEW: Get examination context for appointment management
            $examinationContext = null;
            try {
                $examinationContext = $appointment->getExaminationViewPermissions();
                Log::info('DoctorAppointmentController::show - Examination context loaded', [
                    'appointment_id' => $appointment->id,
                    'examination_mode' => $examinationContext['mode'],
                    'can_edit' => $examinationContext['can_edit'],
                    'can_delete' => $examinationContext['can_delete'],
                ]);
            } catch (Exception $e) {
                Log::warning('DoctorAppointmentController::show - Failed to get examination context', [
                    'appointment_id' => $appointment->id,
                    'error' => $e->getMessage()
                ]);
            }

            // ENHANCED: Get complete appointment history for this patient-doctor combination
            $appointmentHistory = collect([]);
            try {
                // Get all appointments for this patient-doctor combination
                $allAppointments = Appointment::where('patient_id', $patient->id)
                    ->where('doctor_id', $doctor->id)
                    ->with(['patient', 'doctor', 'schedule', 'queue', 'odontogram'])
                    ->orderBy('appointment_date', 'desc')
                    ->orderBy('appointment_time', 'desc')
                    ->orderBy('created_at', 'desc')
                    ->get();

                // Mark current appointment and add navigation context
                $appointmentHistory = $allAppointments->map(function ($historyAppointment) use ($appointment) {
                    $historyAppointment->is_current = $historyAppointment->id === $appointment->id;

                    // Add additional context for UI
                    $historyAppointment->formatted_date = $historyAppointment->appointment_date
                        ? Carbon::parse($historyAppointment->appointment_date)->format('d F Y')
                        : '';
                    $historyAppointment->formatted_time = $historyAppointment->appointment_time
                        ? Carbon::parse($historyAppointment->appointment_time)->format('H:i')
                        : '';

                    return $historyAppointment;
                });

                Log::info('DoctorAppointmentController::show - Appointment history loaded', [
                    'appointment_id' => $appointment->id,
                    'patient_id' => $patient->id,
                    'doctor_id' => $doctor->id,
                    'history_count' => $appointmentHistory->count(),
                    'current_appointment_found' => $appointmentHistory->where('is_current', true)->count()
                ]);
            } catch (Exception $e) {
                Log::error('DoctorAppointmentController::show - Failed to get appointment history', [
                    'appointment_id' => $appointment->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                // Fallback to empty collection
                $appointmentHistory = collect([]);
            }

            Log::info('DoctorAppointmentController::show - Loading appointment with enhanced data', [
                'appointment_id' => $appointment->id,
                'patient_id' => $patient->id,
                'has_medical_history' => (bool)$medicalHistory,
                'examination_mode' => $examinationContext ? $examinationContext['mode'] : 'none',
                'history_count' => $appointmentHistory->count(),
                'view' => 'Dokter/Appointment/Show'
            ]);

            return Inertia::render('Dokter/Appointment/Show', [
                'appointment' => $appointment,
                'patientData' => $patient,
                'canCancel' => $canCancel,
                'canComplete' => $canComplete,
                'canMarkNoShow' => $canMarkNoShow,
                'medicalRecord' => $medicalRecord,
                'medicalHistory' => $medicalHistory,
                'bloodTypes' => $bloodTypes,
                // Enhanced data for appointment management
                'examinationContext' => $examinationContext,
                'appointmentHistory' => $appointmentHistory->values(),
            ]);
        } catch (Exception $e) {
            Log::error('DoctorAppointmentController::show - Error', [
                'appointment_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('doctor.dashboard')
                ->with('error', 'Terjadi kesalahan saat memuat data janji temu: ' . $e->getMessage());
        }
    }


    public function showWithHistory($id)
    {
        try {
            $user = Auth::user();
            $appointment = Appointment::findOrFail($id);

            // Verifikasi bahwa appointment milik dokter ini
            $doctor = Doctor::where('user_id', $user->id)->first();
            if (!$doctor || $appointment->doctor_id !== $doctor->id) {
                return redirect()->route('doctor.dashboard')
                    ->with('error', 'Janji temu ini bukan milik Anda.');
            }

            // Load appointment with all necessary relationships
            $appointment->load(['patient', 'doctor', 'schedule', 'queue', 'odontogram']);

            // Get patient with medical history
            $patient = Patient::with('medicalHistory')->where('id', $appointment->patient_id)->first();
            $medicalHistory = $patient->medicalHistory;

            // Get appointment data
            $canCancel = $appointment->status === 'confirmed';
            $canComplete = $appointment->status === 'confirmed';
            $canMarkNoShow = $appointment->status === 'confirmed';
            $medicalRecord = $appointment->medicalRecord ?? null;
            $bloodTypes = MedicalHistory::BLOOD_TYPES;

            // Get examination context
            $examinationContext = null;
            try {
                $examinationContext = $appointment->getExaminationViewPermissions();
            } catch (Exception $e) {
                Log::warning('Failed to get examination context', [
                    'appointment_id' => $appointment->id,
                    'error' => $e->getMessage()
                ]);
            }

            // Get complete appointment history
            $appointmentHistory = collect([]);
            try {
                $allAppointments = Appointment::where('patient_id', $patient->id)
                    ->where('doctor_id', $doctor->id)
                    ->with(['patient', 'doctor', 'schedule', 'queue', 'odontogram'])
                    ->orderBy('appointment_date', 'desc')
                    ->orderBy('appointment_time', 'desc')
                    ->orderBy('created_at', 'desc')
                    ->get();

                $appointmentHistory = $allAppointments->map(function ($historyAppointment) use ($appointment) {
                    $historyAppointment->is_current = $historyAppointment->id === $appointment->id;
                    $historyAppointment->formatted_date = $historyAppointment->appointment_date
                        ? Carbon::parse($historyAppointment->appointment_date)->format('d F Y')
                        : '';
                    $historyAppointment->formatted_time = $historyAppointment->appointment_time
                        ? Carbon::parse($historyAppointment->appointment_time)->format('H:i')
                        : '';
                    return $historyAppointment;
                });
            } catch (Exception $e) {
                Log::error('Failed to get appointment history', [
                    'appointment_id' => $appointment->id,
                    'error' => $e->getMessage()
                ]);
                $appointmentHistory = collect([]);
            }

            return Inertia::render('Dokter/Appointment/Show', [
                'appointment' => $appointment,
                'patientData' => $patient,
                'canCancel' => $canCancel,
                'canComplete' => $canComplete,
                'canMarkNoShow' => $canMarkNoShow,
                'medicalRecord' => $medicalRecord,
                'medicalHistory' => $medicalHistory,
                'bloodTypes' => $bloodTypes,
                'examinationContext' => $examinationContext,
                'appointmentHistory' => $appointmentHistory->values(),
                'defaultTab' => 'history',
            ]);
        } catch (Exception $e) {
            Log::error('DoctorAppointmentController::showWithHistory - Error', [
                'appointment_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('doctor.dashboard')
                ->with('error', 'Terjadi kesalahan saat memuat data janji temu: ' . $e->getMessage());
        }
    }
    public function getAppointmentHistory($id)
    {
        try {
            $user = Auth::user();
            $appointment = Appointment::findOrFail($id);

            // Verify doctor ownership
            $doctor = Doctor::where('user_id', $user->id)->first();
            if (!$doctor || $appointment->doctor_id !== $doctor->id) {
                return response()->json([
                    'error' => 'Unauthorized access'
                ], 403);
            }

            // Get complete appointment history for this patient-doctor combination
            $appointmentHistory = Appointment::where('patient_id', $appointment->patient_id)
                ->where('doctor_id', $doctor->id)
                ->with(['patient', 'doctor', 'schedule', 'queue', 'odontogram'])
                ->orderBy('appointment_date', 'desc')
                ->orderBy('appointment_time', 'desc')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($historyAppointment) use ($appointment) {
                    $historyAppointment->is_current = $historyAppointment->id === $appointment->id;
                    $historyAppointment->formatted_date = $historyAppointment->appointment_date
                        ? Carbon::parse($historyAppointment->appointment_date)->format('d F Y')
                        : '';
                    $historyAppointment->formatted_time = $historyAppointment->appointment_time
                        ? Carbon::parse($historyAppointment->appointment_time)->format('H:i')
                        : '';
                    return $historyAppointment;
                });

            return response()->json([
                'success' => true,
                'appointmentHistory' => $appointmentHistory->values(),
                'currentAppointmentId' => $appointment->id,
            ]);
        } catch (Exception $e) {
            Log::error('DoctorAppointmentController::getAppointmentHistory - Error', [
                'appointment_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to load appointment history'
            ], 500);
        }
    }
    public function navigateToAppointment($currentAppointmentId, $targetAppointmentId)
    {
        try {
            $user = Auth::user();
            $doctor = Doctor::where('user_id', $user->id)->first();

            if (!$doctor) {
                return redirect()->route('doctor.dashboard')
                    ->with('error', 'Doctor profile not found.');
            }

            // Verify both appointments belong to this doctor
            $currentAppointment = Appointment::findOrFail($currentAppointmentId);
            $targetAppointment = Appointment::findOrFail($targetAppointmentId);

            if ($currentAppointment->doctor_id !== $doctor->id || $targetAppointment->doctor_id !== $doctor->id) {
                return redirect()->route('doctor.dashboard')
                    ->with('error', 'Unauthorized access to appointments.');
            }

            // Verify they are for the same patient
            if ($currentAppointment->patient_id !== $targetAppointment->patient_id) {
                return redirect()->route('doctor.appointments.show', $currentAppointmentId)
                    ->with('error', 'Appointments are not for the same patient.');
            }

            Log::info('DoctorAppointmentController::navigateToAppointment', [
                'from_appointment' => $currentAppointmentId,
                'to_appointment' => $targetAppointmentId,
                'doctor_id' => $doctor->id,
                'patient_id' => $currentAppointment->patient_id
            ]);

            // Redirect to target appointment with history tab active
            return redirect()->route('doctor.appointments.show', $targetAppointmentId)
                ->with('success', 'Berhasil membuka appointment yang dipilih dari riwayat.');
        } catch (Exception $e) {
            Log::error('DoctorAppointmentController::navigateToAppointment - Error', [
                'current_appointment_id' => $currentAppointmentId,
                'target_appointment_id' => $targetAppointmentId,
                'error' => $e->getMessage()
            ]);

            return redirect()->route('doctor.dashboard')
                ->with('error', 'Terjadi kesalahan saat membuka appointment: ' . $e->getMessage());
        }
    }
    /**
     * Create a new appointment from the examination panel (follow-up)
     */
    public function createAppointment(Request $request)
    {
        try {
            $user = Auth::user();
            $doctor = Doctor::where('user_id', $user->id)->first();

            if (!$doctor) {
                return response()->json([
                    'error' => 'Doctor profile not found'
                ], 403);
            }

            Log::info('DoctorAppointmentController::createAppointment - Starting', [
                'request_data' => $request->all(),
                'doctor_id' => $doctor->id,
                'user_id' => $user->id
            ]);

            // Validate the request
            $validated = $request->validate([
                'patient_id' => 'required|exists:patients,id',
                'doctor_id' => 'required|exists:doctors,id',
                'schedule_id' => 'required|exists:schedules,id',
                'appointment_date' => 'required|date|after_or_equal:tomorrow',
                'appointment_time' => 'required',
                'chief_complaint' => 'required|string|max:1000',
                'notes' => 'nullable|string|max:1000',
                'status' => 'nullable|in:scheduled,confirmed'
            ]);

            // Verify doctor ownership
            if ($validated['doctor_id'] != $doctor->id) {
                return response()->json([
                    'error' => 'You can only create appointments for yourself'
                ], 403);
            }

            // Verify patient exists
            $patient = Patient::find($validated['patient_id']);
            if (!$patient) {
                return response()->json([
                    'error' => 'Patient not found'
                ], 404);
            }

            // Get and verify the selected schedule
            $schedule = Schedule::with('scheduleQuota')->find($validated['schedule_id']);
            if (!$schedule) {
                return response()->json([
                    'error' => 'Schedule not found'
                ], 404);
            }

            // Verify doctor and schedule match
            if ($schedule->doctor_id != $validated['doctor_id']) {
                Log::error('Doctor and schedule mismatch', [
                    'schedule_doctor_id' => $schedule->doctor_id,
                    'request_doctor_id' => $validated['doctor_id']
                ]);
                return response()->json([
                    'error' => 'Schedule does not belong to this doctor'
                ], 422);
            }

            Log::info('DoctorAppointmentController::createAppointment - Initial validation passed', [
                'schedule_id' => $schedule->id,
                'doctor_id' => $schedule->doctor_id,
                'patient_id' => $patient->id
            ]);

            DB::beginTransaction();

            // Check doctor availability
            if (!$this->isDoctorAvailable($validated['doctor_id'], $validated['schedule_id'], $validated['appointment_date'])) {
                DB::rollBack();
                return response()->json([
                    'error' => 'Dokter tidak tersedia pada jadwal yang dipilih atau kuota sudah penuh'
                ], 422);
            }

            // Generate queue number
            $queueNumber = $this->generateQueueNumber($validated['appointment_date'], $validated['schedule_id']);

            Log::info('DoctorAppointmentController::createAppointment - Queue number generated', [
                'queue_number' => $queueNumber
            ]);

            // Create the queue FIRST
            $queue = Queue::create([
                'patient_id' => $validated['patient_id'],
                'doctor_id' => $validated['doctor_id'],
                'schedule_id' => $validated['schedule_id'],
                'appointment_date' => $validated['appointment_date'],
                'queue_number' => $queueNumber,
                'status' => Queue::STATUS_WAITING,
                'is_active' => true,
            ]);

            Log::info('DoctorAppointmentController::createAppointment - Queue created', [
                'queue_id' => $queue->id,
                'queue_number' => $queue->queue_number
            ]);

            // Create the appointment
            $appointment = Appointment::create([
                'patient_id' => $validated['patient_id'],
                'doctor_id' => $validated['doctor_id'],
                'schedule_id' => $validated['schedule_id'],
                'appointment_date' => $validated['appointment_date'],
                'appointment_time' => $validated['appointment_time'],
                'chief_complaint' => $validated['chief_complaint'],
                'notes' => $validated['notes'] ?? '',
                'status' => $validated['status'] ?? 'scheduled',
                'created_by_user_id' => $user->id,
                'queue_id' => $queue->id,
            ]);

            DB::commit();

            // UPDATED: Load relationship data untuk response
            $appointment->load(['patient', 'doctor', 'schedule', 'queue']);

            Log::info('DoctorAppointmentController::createAppointment - Success', [
                'appointment_id' => $appointment->id,
                'doctor_id' => $doctor->id,
                'patient_id' => $validated['patient_id'],
                'appointment_date' => $validated['appointment_date'],
                'queue_id' => $queue->id
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            DB::rollBack();

            Log::error('DoctorAppointmentController::createAppointment - Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'error' => 'Terjadi kesalahan saat membuat appointment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * UPDATED: Check if appointment can be edited/deleted
     */
    public function canManageAppointment($appointmentId)
    {
        try {
            $user = Auth::user();
            $doctor = Doctor::where('user_id', $user->id)->first();

            if (!$doctor) {
                return false;
            }

            $appointment = Appointment::find($appointmentId);
            if (!$appointment) {
                return false;
            }

            // Verify ownership
            if ($appointment->doctor_id !== $doctor->id) {
                return false;
            }

            // ATURAN BARU: Hanya appointment dengan status 'scheduled' yang dapat di-edit/hapus
            return $appointment->status === Appointment::STATUS_SCHEDULED;
        } catch (Exception $e) {
            Log::error('Error checking appointment management permission', [
                'appointment_id' => $appointmentId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Update appointment (hanya untuk status scheduled)
     */
    public function update(Request $request, $id)
    {
        try {
            $user = Auth::user();
            $doctor = Doctor::where('user_id', $user->id)->first();

            if (!$doctor) {
                return response()->json([
                    'error' => 'Doctor profile not found'
                ], 403);
            }

            $appointment = Appointment::findOrFail($id);

            // Verify ownership
            if ($appointment->doctor_id !== $doctor->id) {
                return response()->json([
                    'error' => 'You can only update your own appointments'
                ], 403);
            }

            // ATURAN BARU: Check if appointment can be managed
            if (!$this->canManageAppointment($id)) {
                return response()->json([
                    'error' => 'Appointment ini tidak dapat diubah karena statusnya bukan "scheduled"'
                ], 422);
            }

            Log::info('DoctorAppointmentController::update - Starting', [
                'appointment_id' => $appointment->id,
                'doctor_id' => $doctor->id,
                'current_status' => $appointment->status,
                'request_data' => $request->all()
            ]);

            // Validate the request
            $validated = $request->validate([
                'schedule_id' => 'required|exists:schedules,id',
                'appointment_date' => 'required|date|after_or_equal:tomorrow',
                'appointment_time' => 'required',
                'chief_complaint' => 'required|string|max:1000',
                'notes' => 'nullable|string|max:1000',
            ]);

            // Get and verify the selected schedule
            $schedule = Schedule::with('scheduleQuota')->find($validated['schedule_id']);
            if (!$schedule) {
                return response()->json([
                    'error' => 'Schedule not found'
                ], 404);
            }

            // Verify doctor and schedule match
            if ($schedule->doctor_id != $doctor->id) {
                return response()->json([
                    'error' => 'Schedule does not belong to this doctor'
                ], 422);
            }

            DB::beginTransaction();

            // Check availability (exclude current appointment from count)
            if (!$this->isDoctorAvailableForUpdate($doctor->id, $validated['schedule_id'], $validated['appointment_date'], $appointment->id)) {
                DB::rollBack();
                return response()->json([
                    'error' => 'Dokter tidak tersedia pada jadwal yang dipilih atau kuota sudah penuh'
                ], 422);
            }

            // Update the appointment
            $appointment->update([
                'schedule_id' => $validated['schedule_id'],
                'appointment_date' => $validated['appointment_date'],
                'appointment_time' => $validated['appointment_time'],
                'chief_complaint' => $validated['chief_complaint'],
                'notes' => $validated['notes'] ?? '',
            ]);

            // Update queue if exists
            if ($appointment->queue) {
                $appointment->queue->update([
                    'schedule_id' => $validated['schedule_id'],
                    'appointment_date' => $validated['appointment_date'],
                ]);
            }

            DB::commit();

            Log::info('DoctorAppointmentController::update - Success', [
                'appointment_id' => $appointment->id,
                'doctor_id' => $doctor->id
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            DB::rollBack();

            Log::error('DoctorAppointmentController::update - Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'appointment_id' => $id,
                'request_data' => $request->all()
            ]);

            return response()->json([
                'error' => 'Terjadi kesalahan saat mengupdate appointment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete appointment (hanya untuk status scheduled)
     */
    public function destroy($id)
    {
        try {
            $user = Auth::user();
            $doctor = Doctor::where('user_id', $user->id)->first();

            if (!$doctor) {
                return response()->json([
                    'error' => 'Doctor profile not found'
                ], 403);
            }

            $appointment = Appointment::findOrFail($id);

            // Verify ownership
            if ($appointment->doctor_id !== $doctor->id) {
                return response()->json([
                    'error' => 'You can only delete your own appointments'
                ], 403);
            }

            // ATURAN BARU: Check if appointment can be managed
            if (!$this->canManageAppointment($id)) {
                return response()->json([
                    'error' => 'Appointment ini tidak dapat dihapus karena statusnya bukan "scheduled"'
                ], 422);
            }

            Log::info('DoctorAppointmentController::destroy - Starting', [
                'appointment_id' => $appointment->id,
                'doctor_id' => $doctor->id,
                'current_status' => $appointment->status
            ]);

            DB::beginTransaction();

            // Delete related queue first
            if ($appointment->queue) {
                $appointment->queue->delete();
            }

            // Delete the appointment
            $appointment->delete();

            DB::commit();

            Log::info('DoctorAppointmentController::destroy - Success', [
                'appointment_id' => $appointment->id,
                'doctor_id' => $doctor->id
            ]);
        } catch (Exception $e) {
            DB::rollBack();

            Log::error('DoctorAppointmentController::destroy - Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'appointment_id' => $id
            ]);

            return response()->json([
                'error' => 'Terjadi kesalahan saat menghapus appointment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if doctor is available (copied from EmployeeAppointmentController)
     */
    private function isDoctorAvailable($doctorId, $scheduleId, $appointmentDate)
    {
        try {
            Log::info('DoctorAppointmentController::isDoctorAvailable - Checking', [
                'doctor_id' => $doctorId,
                'schedule_id' => $scheduleId,
                'appointment_date' => $appointmentDate
            ]);

            // Get the schedule
            $schedule = Schedule::with('scheduleQuota')->find($scheduleId);
            if (!$schedule) {
                Log::warning('Schedule not found', ['schedule_id' => $scheduleId]);
                return false;
            }

            // Check if schedule belongs to doctor
            if ($schedule->doctor_id != $doctorId) {
                Log::warning('Doctor/schedule mismatch', [
                    'expected_doctor_id' => $doctorId,
                    'actual_doctor_id' => $schedule->doctor_id
                ]);
                return false;
            }

            // Check if schedule is active
            if (!$schedule->status) {
                Log::warning('Schedule is inactive');
                return false;
            }

            // Get the day of week for the selected date
            $dayOfWeek = Carbon::parse($appointmentDate)->dayOfWeek;

            // Check if schedule matches the day of week
            if ($schedule->day_of_week != $dayOfWeek) {
                Log::warning('Day of week mismatch', [
                    'expected_day' => $dayOfWeek,
                    'schedule_day' => $schedule->day_of_week
                ]);
                return false;
            }

            // Check for schedule exceptions
            $hasException = ScheduleException::where('doctor_id', $doctorId)
                ->where('exception_date_start', '<=', $appointmentDate)
                ->where('exception_date_end', '>=', $appointmentDate)
                ->exists();

            if ($hasException) {
                Log::warning('Schedule exception found');
                return false;
            }

            // Check quota availability
            $maxQuota = $schedule->scheduleQuota ? $schedule->scheduleQuota->quota : 10;

            // Use Queue count
            $bookedAppointments = Queue::where('schedule_id', $scheduleId)
                ->whereDate('appointment_date', $appointmentDate)
                ->count();

            $isAvailable = $bookedAppointments < $maxQuota;

            Log::info('DoctorAppointmentController::isDoctorAvailable - Result', [
                'max_quota' => $maxQuota,
                'booked_appointments' => $bookedAppointments,
                'is_available' => $isAvailable
            ]);

            return $isAvailable;
        } catch (Exception $e) {
            Log::error('Error checking doctor availability', [
                'doctor_id' => $doctorId,
                'schedule_id' => $scheduleId,
                'date' => $appointmentDate,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Generate queue number 
     */
    private function generateQueueNumber($date, $scheduleId)
    {
        try {
            $lastQueue = Queue::whereDate('appointment_date', $date)
                ->where('schedule_id', $scheduleId)
                ->orderBy('queue_number', 'desc')
                ->first();

            if ($lastQueue) {
                return $lastQueue->queue_number + 1;
            }

            return 1;
        } catch (Exception $e) {
            Log::error('Error generating queue number', [
                'date' => $date,
                'schedule_id' => $scheduleId,
                'error' => $e->getMessage()
            ]);
            return 1;
        }
    }

    /**
     * Check if doctor is available for update (exclude current appointment)
     */
    private function isDoctorAvailableForUpdate($doctorId, $scheduleId, $appointmentDate, $excludeAppointmentId)
    {
        try {
            // Get the schedule
            $schedule = Schedule::with('scheduleQuota')->find($scheduleId);
            if (!$schedule) {
                return false;
            }

            // Check if schedule belongs to doctor
            if ($schedule->doctor_id != $doctorId) {
                return false;
            }

            // Check if schedule is active
            if (!$schedule->status) {
                return false;
            }

            // Get the day of week for the selected date
            $dayOfWeek = Carbon::parse($appointmentDate)->dayOfWeek;

            // Check if schedule matches the day of week
            if ($schedule->day_of_week != $dayOfWeek) {
                return false;
            }

            // Check for schedule exceptions
            $hasException = ScheduleException::where('doctor_id', $doctorId)
                ->where('exception_date_start', '<=', $appointmentDate)
                ->where('exception_date_end', '>=', $appointmentDate)
                ->exists();

            if ($hasException) {
                return false;
            }

            // Check quota availability (exclude current appointment)
            $maxQuota = $schedule->scheduleQuota ? $schedule->scheduleQuota->quota : 10;

            // Count existing appointments for this schedule and date (exclude current appointment)
            $bookedAppointments = Queue::where('schedule_id', $scheduleId)
                ->whereDate('appointment_date', $appointmentDate)
                ->whereHas('appointment', function ($query) use ($excludeAppointmentId) {
                    $query->where('id', '!=', $excludeAppointmentId);
                })
                ->count();

            $isAvailable = $bookedAppointments < $maxQuota;

            Log::info('DoctorAppointmentController::isDoctorAvailableForUpdate - Result', [
                'max_quota' => $maxQuota,
                'booked_appointments' => $bookedAppointments,
                'exclude_appointment_id' => $excludeAppointmentId,
                'is_available' => $isAvailable
            ]);

            return $isAvailable;
        } catch (Exception $e) {
            Log::error('Error checking doctor availability for update', [
                'doctor_id' => $doctorId,
                'schedule_id' => $scheduleId,
                'date' => $appointmentDate,
                'exclude_appointment_id' => $excludeAppointmentId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}
