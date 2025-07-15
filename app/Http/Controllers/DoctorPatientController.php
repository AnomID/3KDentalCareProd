<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Exception;

class DoctorPatientController extends Controller
{
    /**
     * Display a listing of patients who have appointments with this doctor
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

            // Get search and filter parameters
            $search = $request->input('search', '');
            $sortField = $request->input('sort_field', 'name');
            $sortDirection = $request->input('sort_direction', 'asc');
            $statusFilter = $request->input('status_filter', 'all');

            // Get patients who have appointments with this doctor
            $query = Patient::query()
                ->whereHas('appointments', function ($appointmentQuery) use ($doctor) {
                    $appointmentQuery->where('doctor_id', $doctor->id);
                })
                ->with([
                    'appointments' => function ($appointmentQuery) use ($doctor) {
                        $appointmentQuery->where('doctor_id', $doctor->id)
                            ->orderBy('appointment_date', 'desc')
                            ->orderBy('appointment_time', 'desc');
                    },
                    'medicalHistory'
                ]);

            // Apply search filter
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('no_rm', 'like', "%{$search}%");
                });
            }

            // Apply status filter based on most recent appointment
            if ($statusFilter !== 'all') {
                $query->whereHas('appointments', function ($appointmentQuery) use ($doctor, $statusFilter) {
                    $appointmentQuery->where('doctor_id', $doctor->id);

                    if ($statusFilter === 'active') {
                        $appointmentQuery->whereIn('status', [
                            Appointment::STATUS_SCHEDULED,
                            Appointment::STATUS_CONFIRMED,
                            Appointment::STATUS_IN_PROGRESS
                        ]);
                    } elseif ($statusFilter === 'completed') {
                        $appointmentQuery->where('status', Appointment::STATUS_COMPLETED);
                    } elseif ($statusFilter === 'cancelled') {
                        $appointmentQuery->whereIn('status', [
                            Appointment::STATUS_CANCELED,
                            Appointment::STATUS_NO_SHOW
                        ]);
                    }
                });
            }

            // Apply sorting
            $query->orderBy($sortField, $sortDirection);

            // Get paginated results
            $patients = $query->paginate(15)->appends(request()->query());

            // Add statistics for each patient
            foreach ($patients as $patient) {
                // Get appointment statistics
                $appointmentStats = $patient->appointments()
                    ->where('doctor_id', $doctor->id)
                    ->selectRaw('
                        COUNT(*) as total_appointments,
                        COUNT(CASE WHEN status = ? THEN 1 END) as completed_appointments,
                        COUNT(CASE WHEN status IN (?, ?, ?) THEN 1 END) as active_appointments,
                        MAX(appointment_date) as last_appointment_date
                    ', [
                        Appointment::STATUS_COMPLETED,
                        Appointment::STATUS_SCHEDULED,
                        Appointment::STATUS_CONFIRMED,
                        Appointment::STATUS_IN_PROGRESS
                    ])
                    ->first();

                $patient->appointment_stats = [
                    'total' => $appointmentStats->total_appointments ?? 0,
                    'completed' => $appointmentStats->completed_appointments ?? 0,
                    'active' => $appointmentStats->active_appointments ?? 0,
                    'last_appointment' => $appointmentStats->last_appointment_date
                ];

                // Get most recent appointment
                $patient->latest_appointment = $patient->appointments()
                    ->where('doctor_id', $doctor->id)
                    ->orderBy('appointment_date', 'desc')
                    ->orderBy('appointment_time', 'desc')
                    ->first();
            }

            Log::info('DoctorPatientController::index - Loaded patients', [
                'doctor_id' => $doctor->id,
                'total_patients' => $patients->total(),
                'current_page' => $patients->currentPage(),
                'search' => $search,
                'status_filter' => $statusFilter
            ]);

            return Inertia::render('Dokter/PatientInformation/Index', [
                'patients' => $patients,
                'doctor' => $doctor,
                'filters' => [
                    'search' => $search,
                    'sort_field' => $sortField,
                    'sort_direction' => $sortDirection,
                    'status_filter' => $statusFilter,
                ],
                'statusOptions' => [
                    'all' => 'Semua Status',
                    'active' => 'Aktif (Terjadwal/Dikonfirmasi)',
                    'completed' => 'Selesai',
                    'cancelled' => 'Dibatalkan/Tidak Hadir'
                ]
            ]);
        } catch (Exception $e) {
            Log::error('DoctorPatientController::index - Error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Inertia::render('Error', [
                'status' => 500,
                'message' => 'Error loading patients: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Display the specified patient with full information and appointment history
     */
    public function show($patientId)
    {
        try {
            $user = Auth::user();

            // Find the doctor record associated with this user
            $doctor = Doctor::where('user_id', $user->id)->first();

            if (!$doctor) {
                return Inertia::render('Error', [
                    'status' => 400,
                    'message' => 'Your doctor profile is not set up properly. Please contact support.',
                ]);
            }

            // Get patient with relationships
            $patient = Patient::with([
                'user',
                'guardian',
                'medicalHistory'
            ])->findOrFail($patientId);

            // Verify that this patient has appointments with this doctor
            $hasAppointment = Appointment::where('patient_id', $patientId)
                ->where('doctor_id', $doctor->id)
                ->exists();

            if (!$hasAppointment) {
                return redirect()->route('doctor.patients.index')
                    ->with('error', 'Anda tidak memiliki riwayat appointment dengan pasien ini.');
            }

            // Get complete appointment history for this patient-doctor combination
            $appointmentHistory = Appointment::where('patient_id', $patientId)
                ->where('doctor_id', $doctor->id)
                ->with([
                    'schedule',
                    'queue',
                    'odontogram' => function ($query) {
                        $query->select('id', 'appointment_id', 'examination_date', 'is_finalized', 'd_value', 'm_value', 'f_value');
                    }
                ])
                ->orderBy('appointment_date', 'desc')
                ->orderBy('appointment_time', 'desc')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($appointment) {
                    // Add formatted dates for display
                    $appointment->formatted_date = $appointment->appointment_date
                        ? \Carbon\Carbon::parse($appointment->appointment_date)->format('d F Y')
                        : '';
                    $appointment->formatted_time = $appointment->appointment_time
                        ? \Carbon\Carbon::parse($appointment->appointment_time)->format('H:i')
                        : '';

                    // Add status label in Indonesian
                    $statuses = Appointment::getStatusesIndonesian();
                    $appointment->status_label = $statuses[$appointment->status] ?? 'Unknown';

                    return $appointment;
                });

            // Get appointment statistics
            $appointmentStats = [
                'total' => $appointmentHistory->count(),
                'completed' => $appointmentHistory->where('status', Appointment::STATUS_COMPLETED)->count(),
                'active' => $appointmentHistory->whereIn('status', [
                    Appointment::STATUS_SCHEDULED,
                    Appointment::STATUS_CONFIRMED,
                    Appointment::STATUS_IN_PROGRESS
                ])->count(),
                'cancelled' => $appointmentHistory->whereIn('status', [
                    Appointment::STATUS_CANCELED,
                    Appointment::STATUS_NO_SHOW
                ])->count(),
                'first_appointment' => $appointmentHistory->last()?->appointment_date,
                'last_appointment' => $appointmentHistory->first()?->appointment_date,
            ];

            // Get blood types for medical history form
            $bloodTypes = [
                'A+',
                'A-',
                'B+',
                'B-',
                'AB+',
                'AB-',
                'O+',
                'O-'
            ];

            Log::info('DoctorPatientController::show - Patient loaded', [
                'patient_id' => $patientId,
                'doctor_id' => $doctor->id,
                'appointment_count' => $appointmentHistory->count(),
                'has_medical_history' => (bool)$patient->medicalHistory
            ]);

            return Inertia::render('Dokter/PatientInformation/Show', [
                'patient' => $patient,
                'doctor' => $doctor,
                'appointmentHistory' => $appointmentHistory,
                'appointmentStats' => $appointmentStats,
                'bloodTypes' => $bloodTypes,
                'medicalHistory' => $patient->medicalHistory,
            ]);
        } catch (Exception $e) {
            Log::error('DoctorPatientController::show - Error', [
                'patient_id' => $patientId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('doctor.patients.index')
                ->with('error', 'Terjadi kesalahan saat memuat informasi pasien: ' . $e->getMessage());
        }
    }

    /**
     * Get patient appointment history for AJAX calls
     */
    public function getAppointmentHistory($patientId)
    {
        try {
            $user = Auth::user();
            $doctor = Doctor::where('user_id', $user->id)->first();

            if (!$doctor) {
                return response()->json([
                    'error' => 'Doctor profile not found'
                ], 403);
            }

            // Verify access
            $hasAppointment = Appointment::where('patient_id', $patientId)
                ->where('doctor_id', $doctor->id)
                ->exists();

            if (!$hasAppointment) {
                return response()->json([
                    'error' => 'Unauthorized access to patient data'
                ], 403);
            }

            // Get appointment history
            $appointmentHistory = Appointment::where('patient_id', $patientId)
                ->where('doctor_id', $doctor->id)
                ->with(['schedule', 'queue', 'odontogram'])
                ->orderBy('appointment_date', 'desc')
                ->orderBy('appointment_time', 'desc')
                ->get()
                ->map(function ($appointment) {
                    $appointment->formatted_date = $appointment->appointment_date
                        ? \Carbon\Carbon::parse($appointment->appointment_date)->format('d F Y')
                        : '';
                    $appointment->formatted_time = $appointment->appointment_time
                        ? \Carbon\Carbon::parse($appointment->appointment_time)->format('H:i')
                        : '';

                    $statuses = Appointment::getStatusesIndonesian();
                    $appointment->status_label = $statuses[$appointment->status] ?? 'Unknown';

                    return $appointment;
                });

            return response()->json([
                'success' => true,
                'appointmentHistory' => $appointmentHistory,
                'patientId' => $patientId,
                'doctorId' => $doctor->id,
            ]);
        } catch (Exception $e) {
            Log::error('DoctorPatientController::getAppointmentHistory - Error', [
                'patient_id' => $patientId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to load appointment history'
            ], 500);
        }
    }

    /**
     * Navigate to specific appointment from patient view
     */
    public function showAppointment($patientId, $appointmentId)
    {
        try {
            $user = Auth::user();
            $doctor = Doctor::where('user_id', $user->id)->first();

            if (!$doctor) {
                return redirect()->route('doctor.dashboard')
                    ->with('error', 'Doctor profile not found.');
            }

            // Verify appointment belongs to this doctor and patient
            $appointment = Appointment::where('id', $appointmentId)
                ->where('patient_id', $patientId)
                ->where('doctor_id', $doctor->id)
                ->firstOrFail();

            Log::info('DoctorPatientController::showAppointment - Navigation', [
                'patient_id' => $patientId,
                'appointment_id' => $appointmentId,
                'doctor_id' => $doctor->id
            ]);

            // Redirect to appointment show page
            return redirect()->route('doctor.appointments.show', $appointmentId)
                ->with('success', 'Membuka appointment yang dipilih dari riwayat pasien.');
        } catch (Exception $e) {
            Log::error('DoctorPatientController::showAppointment - Error', [
                'patient_id' => $patientId,
                'appointment_id' => $appointmentId,
                'error' => $e->getMessage()
            ]);

            return redirect()->route('doctor.patients.show', $patientId)
                ->with('error', 'Terjadi kesalahan saat membuka appointment: ' . $e->getMessage());
        }
    }
}
