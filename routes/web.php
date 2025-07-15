<?php
// routes/web.php - Enhanced version with Enhanced Patient Management

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\PatientAppointmentController;
use App\Http\Controllers\DoctorAppointmentController;
use App\Http\Controllers\EmployeeAppointmentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DoctorController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\GuardianController;
use App\Http\Controllers\MedicalHistoryController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\ScheduleExceptionController;
use App\Http\Controllers\DoctorExaminationController;
use App\Http\Controllers\DoctorPatientController;
use App\Http\Controllers\EmployeeExaminationController;
use App\Http\Controllers\IcdController;
use App\Http\Controllers\OdontogramController;
use App\Http\Controllers\ToothDiagnosisController;
use App\Http\Controllers\ToothTreatmentController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    return Inertia::render('Home', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Shared API routes - ✅ Keep these (accessible by all authenticated users)
Route::middleware(['auth'])->group(function () {
    Route::get('/karyawan/api/patients', [EmployeeController::class, 'patientsAPI']);
    Route::get('/api/guardians', [EmployeeController::class, 'guardiansAPI'])->name('api.guardians');
    Route::get('/api/guardians/{id}', [EmployeeController::class, 'guardianShow'])->name('api.guardians.show');
    Route::get('/api/guardians', [GuardianController::class, 'index'])->name('api.guardians');
    Route::get('/api/guardians/{guardian}', [GuardianController::class, 'show'])->name('api.guardians.show');

    // Available doctors for a specific date
    Route::get('/api/appointments/available-doctors', [ScheduleController::class, 'getAvailableDoctors'])
        ->name('api.appointments.available-doctors');

    // Available schedules for a specific doctor and date  
    Route::get('/api/appointments/available-schedules', [ScheduleController::class, 'getAvailableSchedules'])
        ->name('api.appointments.available-schedules');

    // Legacy route for backward compatibility
    Route::post('/api/appointments/available-schedules', [AppointmentController::class, 'getAvailableSchedules'])
        ->name('api.appointments.available-schedules-legacy');

    Route::get('/appointments/get-available-schedules', [ScheduleController::class, 'getAvailableSchedules'])
        ->name('appointments.get-available-schedules');

    // ✅ SHARED API ROUTES - Accessible by all authenticated users (patients, doctors, employees)
    Route::get('/api/icd10-diagnosis-codes', [OdontogramController::class, 'getIcd10DiagnosisCodes'])
        ->name('api.icd10-diagnosis-codes');

    Route::get('/api/icd10-external-cause-codes', [OdontogramController::class, 'getIcd10ExternalCauseCodes'])
        ->name('api.icd10-external-cause-codes');

    Route::get('/api/icd9cm-codes', [OdontogramController::class, 'getIcd9cmCodes'])
        ->name('api.icd9cm-codes');
});

// Patient Routes
Route::middleware(['auth', 'role:patient', 'check.patient.profile'])->group(function () {
    // Patient Profile
    Route::get('/patient-form', [PatientController::class, 'createProfile'])->name('patient.form');
    Route::get('/patient-profile', [PatientController::class, 'showProfile'])->name('patient.profile');
    Route::post('/patient-store', [PatientController::class, 'storeProfile'])->name('patient.store');

    // Dashboard
    Route::get('/patient-dashboard', [DashboardController::class, 'index'])->name('patient.dashboard');

    // Appointments - using PatientAppointmentController
    Route::get('/appointments', [PatientAppointmentController::class, 'index'])->name('patient.appointments.index');
    Route::get('/appointments/create', [PatientAppointmentController::class, 'create'])->name('patient.appointments.create');
    Route::post('/appointments', [PatientAppointmentController::class, 'store'])->name('patient.appointments.store');
    Route::get('/appointments/{appointment}', [AppointmentController::class, 'show'])->name('patient.appointments.show');
    Route::put('/appointments/{appointment}/status', [AppointmentController::class, 'updateStatus'])->name('patient.appointments.update-status');
    Route::get('/api/patients/available-doctors', [PatientAppointmentController::class, 'getAvailableDoctors'])
        ->name('api.patients.available-doctors');
    Route::get('/api/patients/available-schedules', [PatientAppointmentController::class, 'getAvailableSchedules'])
        ->name('api.patients.available-schedules');

    // Patient can view their odontograms (read-only)
    Route::get('/patient/odontogram/{odontogram}/canvas-data', [OdontogramController::class, 'getCanvasData'])
        ->name('patient.odontogram.get-canvas-data');
});

// Doctor Routes
Route::middleware(['auth', 'role:doctor'])->group(function () {
    // Dashboard
    Route::get('/dokter/dashboard', [DashboardController::class, 'doctorDashboard'])->name('doctor.dashboard');

    // Appointments - ENHANCED with appointment history navigation
    Route::prefix('doctor/appointments')->name('doctor.appointments.')->group(function () {
        // Main appointment routes
        Route::get('/', [DoctorAppointmentController::class, 'index'])->name('index');
        Route::get('/today', [DoctorAppointmentController::class, 'today'])->name('today');

        // ENHANCED: Show appointment with tab support and history context
        Route::get('/{appointment}', [DoctorAppointmentController::class, 'show'])->name('show');

        // Status management
        Route::put('/{appointment}/status', [AppointmentController::class, 'updateStatus'])->name('update-status');

        // Enhanced appointment management routes
        Route::post('/create', [DoctorAppointmentController::class, 'createAppointment'])->name('create-appointment');
        Route::put('/{appointment}', [DoctorAppointmentController::class, 'update'])->name('update');
        Route::delete('/{appointment}', [DoctorAppointmentController::class, 'destroy'])->name('destroy');

        // NEW: Enhanced appointment history navigation
        Route::get('/{appointment}/history', [DoctorAppointmentController::class, 'showWithHistory'])
            ->name('show-history');

        // NEW: API endpoint to get appointment history for AJAX loading
        Route::get('/{appointment}/api/history', [DoctorAppointmentController::class, 'getAppointmentHistory'])
            ->name('api.history');
    });

    // NEW: Enhanced examination routes with appointment history support
    Route::prefix('doctor/examination')->name('doctor.examination.')->group(function () {
        // Main examination route - enhanced with appointment history
        Route::get('/{appointment}', [DoctorExaminationController::class, 'show'])
            ->name('show');

        // NEW: Navigate between appointments in history
        Route::get('/{appointment}/navigate/{targetAppointment}', [DoctorExaminationController::class, 'navigateToAppointment'])
            ->name('navigate');

        // Enhanced appointment status management
        Route::post('/{appointment}/complete', [DoctorExaminationController::class, 'completeAppointment'])
            ->name('complete');
        Route::post('/{appointment}/no-show', [DoctorExaminationController::class, 'markNoShow'])
            ->name('no-show');

        // NEW: Quick appointment context check (AJAX)
        Route::get('/{appointment}/context', [DoctorExaminationController::class, 'getAppointmentContext'])
            ->name('context');
    });

    // Medical History
    Route::post('medical-history/save-or-update/{patientId}', [MedicalHistoryController::class, 'saveOrUpdate'])->name('medical-history.saveOrUpdate');
    Route::get('medical-history/patient/{patientId}', [MedicalHistoryController::class, 'getByPatient'])->name('medical-history.getByPatient');
    Route::get('medical-history/patient/{patientId}', [MedicalHistoryController::class, 'show'])->name('medical-history.show');
    Route::get('medical-history/blood-types', [MedicalHistoryController::class, 'getBloodTypes'])->name('medical-history.getBloodTypes');

    // Odontogram routes - Full CRUD for doctors
    Route::get('/odontogram/{odontogram}/canvas-data', [OdontogramController::class, 'getCanvasData'])
        ->name('odontogram.get-canvas-data');

    // Update metadata odontogram (occlusion, torus, dll.)
    Route::post('/odontogram/{odontogram}/update', [OdontogramController::class, 'update'])
        ->name('odontogram.update');

    // Save tooth conditions, bridges, dan indicators
    Route::post('/odontogram/{odontogram}/tooth-conditions', [OdontogramController::class, 'saveToothConditions'])
        ->name('odontogram.save-tooth-conditions');

    Route::post('/odontogram/{odontogram}/tooth-bridges', [OdontogramController::class, 'saveToothBridges'])
        ->name('odontogram.save-tooth-bridges');

    Route::post('/odontogram/{odontogram}/tooth-indicators', [OdontogramController::class, 'saveToothIndicators'])
        ->name('odontogram.save-tooth-indicators');

    // Delete tooth conditions, bridges, dan indicators
    Route::delete('/tooth-condition/{toothCondition}', [OdontogramController::class, 'deleteToothCondition'])
        ->name('odontogram.delete-tooth-condition');

    Route::delete('/tooth-bridge/{toothBridge}', [OdontogramController::class, 'deleteToothBridge'])
        ->name('odontogram.delete-tooth-bridge');

    Route::delete('/tooth-indicator/{toothIndicator}', [OdontogramController::class, 'deleteToothIndicator'])
        ->name('odontogram.delete-tooth-indicator');

    // Reset odontogram
    Route::post('/odontogram/{odontogram}/reset', [OdontogramController::class, 'resetOdontogram'])
        ->name('odontogram.reset');

    // Finalize dan unfinalize
    Route::post('/odontogram/{odontogram}/finalize', [OdontogramController::class, 'finalize'])
        ->name('odontogram.finalize');

    Route::post('/odontogram/{odontogram}/unfinalize', [OdontogramController::class, 'unfinalize'])
        ->name('odontogram.unfinalize');

    // TOOTH DIAGNOSIS ROUTES - Perfect for secondary diagnosis support
    Route::prefix('tooth-diagnoses')->name('tooth-diagnoses.')->group(function () {
        // Primary diagnosis routes
        Route::post('/primary', [ToothDiagnosisController::class, 'storePrimary'])->name('store-primary');
        Route::put('/primary/{primaryDiagnosis}', [ToothDiagnosisController::class, 'updatePrimary'])->name('update-primary');
        Route::delete('/primary/{primaryDiagnosis}', [ToothDiagnosisController::class, 'destroyPrimary'])->name('destroy-primary');
        Route::get('/primary/{primaryDiagnosis}', [ToothDiagnosisController::class, 'show'])->name('show');

        // Secondary diagnosis routes - Perfect!
        Route::post('/secondary', [ToothDiagnosisController::class, 'storeSecondary'])->name('store-secondary');
        Route::put('/secondary/{secondaryDiagnosis}', [ToothDiagnosisController::class, 'updateSecondary'])->name('update-secondary');
        Route::delete('/secondary/{secondaryDiagnosis}', [ToothDiagnosisController::class, 'destroySecondary'])->name('destroy-secondary');

        // Status management
        Route::post('/set-no-diagnosis', [ToothDiagnosisController::class, 'setNoDiagnosis'])->name('set-no-diagnosis');
    });

    // TOOTH TREATMENT ROUTES - Perfect for bridge support
    Route::prefix('tooth-treatments')->name('tooth-treatments.')->group(function () {
        Route::post('/', [ToothTreatmentController::class, 'store'])->name('store');
        Route::put('/{toothTreatment}', [ToothTreatmentController::class, 'update'])->name('update');
        Route::delete('/{toothTreatment}', [ToothTreatmentController::class, 'destroy'])->name('destroy');
        Route::get('/{toothTreatment}', [ToothTreatmentController::class, 'show'])->name('show');

        // Treatment status management
        Route::post('/complete', [ToothTreatmentController::class, 'complete'])->name('complete');
        Route::post('/cancel', [ToothTreatmentController::class, 'cancel'])->name('cancel');
    });

    Route::prefix('doctor/patients')->name('doctor.patients.')->group(function () {
        Route::get('/', [DoctorPatientController::class, 'index'])->name('index');
        Route::get('/{patient}', [DoctorPatientController::class, 'show'])->name('show');
        Route::get('/{patient}/api/appointment-history', [DoctorPatientController::class, 'getAppointmentHistory'])->name('api.appointment-history');
        Route::get('/{patient}/appointments/{appointment}', [DoctorPatientController::class, 'showAppointment'])->name('show-appointment');
    });
});

// Employee Routes
Route::middleware(['auth', 'role:employee'])->group(function () {
    // Dashboard
    Route::get('/karyawan/dashboard', [DashboardController::class, 'index'])->name('employee.dashboard');

    // User Management - NEW ENHANCED ROUTES
    Route::prefix('karyawan')->group(function () {
        // User creation (existing)
        Route::get('/create-user', [EmployeeController::class, 'createUser'])->name('employee.create');
        Route::post('/create-user', [EmployeeController::class, 'storeUser'])->name('employee.store');

        // Enhanced User Management with filtering, sorting, and statistics
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::get('/users/{id}', [UserController::class, 'show'])->name('users.show');
        Route::post('/users/{id}/update-password', [UserController::class, 'updatePassword'])->name('users.update-password');
    });

    // =====================================================================================
    // 🚀 ENHANCED PATIENT MANAGEMENT with Statistics and Comprehensive Features
    // =====================================================================================

    // Main patient routes
    Route::get('/karyawan/patients', [PatientController::class, 'index'])->name('patients.index');
    Route::get('/patients/{id}', [PatientController::class, 'show'])->name('patients.show');
    Route::get('/patients/edit/{id}', [PatientController::class, 'edit'])->name('patients.edit');
    Route::put('/patients/{id}/update-patient', [PatientController::class, 'update'])->name('patients.update');

    // 🆕 NEW: Enhanced Patient API endpoints for AJAX functionality
    Route::prefix('patients/{patient}/api')->name('patients.api.')->group(function () {
        Route::get('/appointment-history', [PatientController::class, 'getAppointmentHistory'])
            ->name('appointment-history');
        Route::get('/medical-summary', [PatientController::class, 'getMedicalSummary'])
            ->name('medical-summary');
    });

    // 🆕 NEW: Global Patient API endpoints
    Route::prefix('api/patients')->name('api.patients.')->group(function () {
        Route::get('/search', [PatientController::class, 'searchPatients'])
            ->name('search');
        Route::post('/bulk-export', [PatientController::class, 'bulkExport'])
            ->name('bulk-export');
        Route::post('/bulk-update', [PatientController::class, 'bulkUpdate'])
            ->name('bulk-update');
    });

    // 🆕 NEW: Navigate to appointment from patient view (Employee read-only access)
    Route::get('/patients/{patient}/appointments/{appointment}', [PatientController::class, 'showAppointment'])
        ->name('patients.show-appointment');

    // 🆕 NEW: Patient quick actions for employees
    Route::prefix('patients/{patient}')->name('patients.')->group(function () {
        Route::post('/generate-rm', [PatientController::class, 'generateRMNumber'])
            ->name('generate-rm');
        Route::post('/update-medical-priority', [PatientController::class, 'updateMedicalPriority'])
            ->name('update-medical-priority');
        Route::post('/add-note', [PatientController::class, 'addEmployeeNote'])
            ->name('add-note');
        Route::post('/toggle-status', [PatientController::class, 'togglePatientStatus'])
            ->name('toggle-status');
    });

    // Guardian Management
    Route::get('/karyawan/guardians', [GuardianController::class, 'index'])->name('guardians.index');
    Route::get('/guardians/create', [GuardianController::class, 'create'])->name('guardians.create');
    Route::post('/guardians', [GuardianController::class, 'store'])->name('guardians.store');
    Route::get('/guardians/{guardian}', [GuardianController::class, 'show'])->name('guardians.show');
    Route::get('/guardians/{guardian}/edit', [GuardianController::class, 'edit'])->name('guardians.edit');
    Route::put('/guardians/{guardian}', [GuardianController::class, 'update'])->name('guardians.update');
    Route::delete('/guardians/{guardian}', [GuardianController::class, 'destroy'])->name('guardians.destroy');

    // Doctor Management
    Route::get('/doctors', [DoctorController::class, 'index'])->name('doctors.index');
    Route::get('/doctors/{doctor}', [DoctorController::class, 'show'])->name('doctors.show');
    Route::get('/doctors/{doctor}/edit', [DoctorController::class, 'edit'])->name('doctors.edit');
    Route::put('/doctors/{doctor}', [DoctorController::class, 'update'])->name('doctors.update');

    // Schedule
    Route::resource('schedules', ScheduleController::class);

    // Schedule Exceptions
    Route::resource('schedule-exceptions', ScheduleExceptionController::class);
    Route::get('doctor/{doctorId}/exceptions', [ScheduleExceptionController::class, 'upcomingExceptions'])
        ->name('schedule-exceptions.upcoming');
    Route::post('doctor-exceptions', [ScheduleExceptionController::class, 'getDoctorExceptions'])
        ->name('schedule-exceptions.doctor');

    // IMPORTANT: Today's appointments route must come BEFORE the {appointment} route
    Route::get('/employees/appointments/today', [EmployeeAppointmentController::class, 'today'])
        ->name('employee.appointments.today');

    // ENHANCED Appointments - Enhanced with read-only examination access
    Route::get('/employees/appointments-get-available-schedules', [EmployeeAppointmentController::class, 'getAvailableSchedules'])
        ->name('appointments.get-available-schedules');
    Route::get('/employees/appointments', [EmployeeAppointmentController::class, 'index'])
        ->name('employee.appointments.index');
    Route::get('/employees/appointments/create', [EmployeeAppointmentController::class, 'createForPatient'])
        ->name('employee.appointments.create-for-patient');
    Route::post('/employees/appointments', [EmployeeAppointmentController::class, 'store'])
        ->name('employee.appointments.store');

    // ENHANCED: Employee appointment show with examination access
    Route::get('/employees/appointments/{appointment}', [EmployeeAppointmentController::class, 'show'])
        ->name('employee.appointments.show');


    Route::put('/employees/appointments/{appointment}/status', [AppointmentController::class, 'updateStatus'])
        ->name('employee.appointments.update-status');

    // Employee can view odontograms (read-only)
    Route::get('/employee/odontogram/{odontogram}/canvas-data', [OdontogramController::class, 'getCanvasData'])
        ->name('employee.odontogram.get-canvas-data');

    // Employee can unfinalize odontograms
    Route::post('/employee/odontogram/{odontogram}/unfinalize', [OdontogramController::class, 'unfinalize'])
        ->name('employee.odontogram.unfinalize');

    // Employee Management - MUST come after the more specific routes
    Route::get('/employees', [EmployeeController::class, 'index'])
        ->name('employees.index');
    Route::get('/employees/{employee}', [EmployeeController::class, 'show'])
        ->where('employee', '[0-9]+') // Must be numeric ID
        ->name('employees.show');
    Route::get('/employees/{employee}/edit', [EmployeeController::class, 'edit'])
        ->where('employee', '[0-9]+') // Must be numeric ID
        ->name('employees.edit');
    Route::put('/employees/{employee}', [EmployeeController::class, 'update'])
        ->where('employee', '[0-9]+') // Must be numeric ID
        ->name('employees.update');

    // ICD CODES
    // ICD 9CM Routes
    Route::get('/icd/icd9cm', [IcdController::class, 'icd9cm'])->name('icd.icd9cm');
    Route::post('/icd/icd9cm/import', [IcdController::class, 'importIcd9cm'])->name('icd.icd9cm.import');

    // ICD 10 Diagnoses Routes
    Route::get('/icd/icd10-diagnoses', [IcdController::class, 'icd10Diagnoses'])->name('icd.icd10-diagnoses');
    Route::post('/icd/icd10-diagnoses/import', [IcdController::class, 'importIcd10Diagnoses'])->name('icd.icd10-diagnoses.import');

    // ICD 10 External Cause Routes
    Route::get('/icd/icd10-external-cause', [IcdController::class, 'icd10ExternalCause'])->name('icd.icd10-external-cause');
    Route::post('/icd/icd10-external-cause/import', [IcdController::class, 'importIcd10ExternalCause'])->name('icd.icd10-external-cause.import');
});

Route::post('/logout', function () {
    Auth::logout();
    return redirect('/');
})->name('logout');

require __DIR__ . '/auth.php';
