<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Employee;
use App\Models\Queue;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Display the dashboard based on user role
     */
    public function index()
    {
        $user = Auth::user();

        if ($user->role === 'patient') {
            return $this->patientDashboard();
        } elseif ($user->role === 'employee') {
            return $this->employeeDashboard();
        } elseif ($user->role === 'doctor') {
            return $this->doctorDashboard();
        }

        // Fallback
        return redirect()->route('login');
    }

    /**
     * Display the employee dashboard
     */
    public function employeeDashboard()
    {
        // Count statistics
        $totalPatients = Patient::count();
        $totalDoctors = Doctor::count();
        $totalAppointments = Appointment::count();
        $todayAppointments = Appointment::whereDate('appointment_date', Carbon::today())->count();
        $pendingAppointments = Appointment::whereIn('status', ['scheduled', 'confirmed'])->count();
        $completedAppointments = Appointment::where('status', 'completed')->count();

        // Today's appointments
        $todayAppointmentsList = Appointment::with(['patient', 'doctor'])
            ->whereDate('appointment_date', Carbon::today())
            ->orderBy('appointment_time')
            ->take(5)
            ->get();

        // Upcoming appointments (next 7 days excluding today)
        $upcomingAppointments = Appointment::with(['patient', 'doctor'])
            ->whereDate('appointment_date', '>', Carbon::today())
            ->whereDate('appointment_date', '<=', Carbon::today()->addDays(7))
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->orderBy('appointment_date')
            ->orderBy('appointment_time')
            ->take(5)
            ->get();

        // Recent patients
        $recentPatients = Patient::orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Doctors schedules today
        $doctorSchedulesToday = Schedule::with('doctor')
            ->where('day_of_week', Carbon::today()->format('w'))
            ->where('status', true)
            ->get()
            ->map(function ($schedule) {
                // Check if doctor has exceptions today
                $hasException = $schedule->doctor->scheduleExceptions()
                    ->where('exception_date_start', '<=', Carbon::today())
                    ->where('exception_date_end', '>=', Carbon::today())
                    ->exists();

                $schedule->available = !$hasException;
                return $schedule;
            });

        return Inertia::render('Karyawan/Dashboard', [
            'totalPatients' => $totalPatients,
            'totalDoctors' => $totalDoctors,
            'totalAppointments' => $totalAppointments,
            'todayAppointments' => $todayAppointments,
            'pendingAppointments' => $pendingAppointments,
            'completedAppointments' => $completedAppointments,
            'todayAppointmentsList' => $todayAppointmentsList,
            'upcomingAppointments' => $upcomingAppointments,
            'recentPatients' => $recentPatients,
            'doctorSchedulesToday' => $doctorSchedulesToday,
        ]);
    }

    /**
     * Display the doctor dashboard
     */
    public function doctorDashboard()
    {
        $user = Auth::user();
        $doctor = Doctor::where('user_id', $user->id)->first();

        if (!$doctor) {
            return redirect()->route('login')->with('error', 'Doctor profile not found');
        }

        // Today's appointments for this doctor
        $todayAppointments = Appointment::with('patient')
            ->where('doctor_id', $doctor->id)
            ->whereDate('appointment_date', Carbon::today())
            ->orderBy('appointment_time')
            ->get();

        // Count statistics for this doctor
        $totalPatients = Appointment::where('doctor_id', $doctor->id)
            ->distinct('patient_id')
            ->count('patient_id');

        $totalAppointments = Appointment::where('doctor_id', $doctor->id)->count();
        $completedAppointments = Appointment::where('doctor_id', $doctor->id)
            ->where('status', 'completed')
            ->count();

        $upcomingAppointments = Appointment::with('patient')
            ->where('doctor_id', $doctor->id)
            ->whereDate('appointment_date', '>', Carbon::today())
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->orderBy('appointment_date')
            ->orderBy('appointment_time')
            ->take(5)
            ->get();


        return Inertia::render('Dokter/Dashboard', [
            'doctor' => $doctor,
            'todayAppointments' => $todayAppointments,
            'totalPatients' => $totalPatients,
            'totalAppointments' => $totalAppointments,
            'completedAppointments' => $completedAppointments,
            'upcomingAppointments' => $upcomingAppointments,
        ]);
    }

    /**
     * Display the patient dashboard
     */
    public function patientDashboard()
    {
        $user = Auth::user();
        $patient = Patient::where('user_id', $user->id)->first();

        if (!$patient) {
            return redirect()->route('patient.form');
        }

        // Upcoming appointments
        $upcomingAppointments = Appointment::with(['doctor', 'schedule'])
            ->where('patient_id', $patient->id)
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->whereDate('appointment_date', '>=', Carbon::today())
            ->orderBy('appointment_date')
            ->orderBy('appointment_time')
            ->take(3)
            ->get();

        // Past appointments
        $pastAppointments = Appointment::with(['doctor'])
            ->where('patient_id', $patient->id)
            ->where('status', 'completed')
            ->orderBy('appointment_date', 'desc')
            ->take(5)
            ->get();

        // Count statistics
        $totalAppointments = Appointment::where('patient_id', $patient->id)->count();
        $completedAppointments = Appointment::where('patient_id', $patient->id)
            ->where('status', 'completed')
            ->count();

        return Inertia::render('Pasien/Dashboard', [
            'patient' => $patient,
            'upcomingAppointments' => $upcomingAppointments,
            'pastAppointments' => $pastAppointments,
            'totalAppointments' => $totalAppointments,
            'completedAppointments' => $completedAppointments,
        ]);
    }
}
