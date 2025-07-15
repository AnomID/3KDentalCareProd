<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Users table and related auth tables
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('role', ['patient', 'doctor', 'employee'])->default('patient');
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        // 2. Cache tables
        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->mediumText('value');
            $table->integer('expiration');
        });

        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('owner');
            $table->integer('expiration');
        });

        // 3. Job tables
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->string('queue')->index();
            $table->longText('payload');
            $table->unsignedTinyInteger('attempts');
            $table->unsignedInteger('reserved_at')->nullable();
            $table->unsignedInteger('available_at');
            $table->unsignedInteger('created_at');
        });

        Schema::create('job_batches', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->integer('total_jobs');
            $table->integer('pending_jobs');
            $table->integer('failed_jobs');
            $table->longText('failed_job_ids');
            $table->mediumText('options')->nullable();
            $table->integer('cancelled_at')->nullable();
            $table->integer('created_at');
            $table->integer('finished_at')->nullable();
        });

        Schema::create('failed_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->text('connection');
            $table->text('queue');
            $table->longText('payload');
            $table->longText('exception');
            $table->timestamp('failed_at')->useCurrent();
        });

        // 4. Guardians table
        Schema::create('guardians', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('relationship');
            $table->enum('identity_type', ['KTP', 'PASSPORT'])->nullable();
            $table->string('identity_number')->nullable()->unique();
            $table->string('phone_number')->nullable();
            $table->text('address')->nullable();
            $table->timestamps();
        });

        // 5. Patients table
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->foreignId('guardian_id')->nullable()->constrained('guardians')->onDelete('set null');
            $table->string('no_rm')->nullable()->unique();
            $table->string('name');
            $table->string('birth_place');
            $table->date('birth_date');
            $table->enum('identity_type', ['KTP', 'PASSPORT', 'GUARDIAN'])->default('KTP');
            $table->string('no_identity')->nullable()->unique();
            $table->string('citizenship')->default('Indonesia');
            $table->string('gender', 10);
            $table->string('occupation');
            $table->text('address');
            $table->string('phone', 15)->unique();
            $table->enum('blood_type', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);
            $table->timestamps();
        });

        // 6. Doctors table
        Schema::create('doctors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('code')->unique();
            $table->string('name');
            $table->string('specialization');
            $table->string('license_number')->unique();
            $table->date('license_start_date')->nullable();
            $table->date('license_expiry_date')->nullable();
            $table->text('address')->nullable();
            $table->string('phone', 15)->unique();
            $table->timestamps();
        });

        // 7. Employees table
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('code')->unique();
            $table->string('name');
            $table->string('position');
            $table->text('address');
            $table->string('phone', 15)->unique();
            $table->timestamps();
        });

        // 8. Medical histories table
        Schema::create('medical_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->string('blood_type')->nullable();
            $table->string('blood_pressure')->nullable();
            $table->string('blood_pressure_status')->nullable();
            $table->boolean('has_heart_disease')->default(false);
            $table->text('heart_disease_note')->nullable();
            $table->boolean('has_diabetes')->default(false);
            $table->text('diabetes_note')->nullable();
            $table->boolean('has_hemophilia')->default(false);
            $table->text('hemophilia_note')->nullable();
            $table->boolean('has_hepatitis')->default(false);
            $table->text('hepatitis_note')->nullable();
            $table->boolean('has_gastritis')->default(false);
            $table->text('gastritis_note')->nullable();
            $table->boolean('has_other_disease')->default(false);
            $table->text('other_disease_note')->nullable();
            $table->boolean('has_drug_allergy')->default(false);
            $table->text('drug_allergy_note')->nullable();
            $table->boolean('has_food_allergy')->default(false);
            $table->text('food_allergy_note')->nullable();
            $table->foreignId('updated_by_doctor_id')->nullable()->constrained('doctors');
            $table->timestamps();
        });

        // 9. Schedules table
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')->constrained()->onDelete('cascade');
            $table->tinyInteger('day_of_week')->comment('0: Minggu, 1: Senin, ..., 6: Sabtu');
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('status')->default(true)->comment('Aktif/Tidak Aktif');
            $table->string('notes')->nullable();
            $table->timestamps();
        });

        // 10. Schedule exceptions table
        Schema::create('schedule_exceptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')->constrained()->onDelete('cascade');
            $table->date('exception_date_start');
            $table->date('exception_date_end');
            $table->boolean('is_full_day')->default(true);
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->string('reason');
            $table->string('notes')->nullable();
            $table->timestamps();
        });

        // 11. Schedule quotas table
        Schema::create('schedule_quotas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_id')->constrained()->onDelete('cascade');
            $table->integer('quota')->default(10)->comment('Jumlah maksimal pasien per jadwal');
            $table->timestamps();
        });

        // 12. Queues table
        Schema::create('queues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->onDelete('restrict');
            $table->foreignId('doctor_id')->constrained()->onDelete('restrict');
            $table->foreignId('schedule_id')->constrained()->onDelete('restrict');
            $table->date('appointment_date');
            $table->integer('queue_number');
            $table->enum('status', ['waiting', 'processing', 'completed', 'canceled', 'no_show'])->default('waiting');
            $table->string('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Ensure queue numbers are unique per schedule and date
            $table->unique(['schedule_id', 'appointment_date', 'queue_number']);
        });

        // 13. Appointments table
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('doctor_id')->constrained('doctors')->onDelete('cascade');
            $table->foreignId('schedule_id')->constrained('schedules')->onDelete('cascade');
            $table->foreignId('queue_id')->nullable()->constrained('queues')->onDelete('set null');
            $table->foreignId('created_by_user_id')->constrained('users');

            $table->date('appointment_date');
            $table->time('appointment_time');
            $table->string('status')->default('scheduled');
            $table->text('chief_complaint')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            // Compound index for checking availability
            $table->index(['doctor_id', 'appointment_date', 'schedule_id']);
        });

        // 14. ICD Code tables (Updated structure)
        Schema::create('icd_10_codes_diagnoses', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique();
            $table->string('description');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active']);
        });

        Schema::create('icd_10_codes_external_cause', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique();
            $table->string('description');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active']);
            $table->index('code');
        });

        Schema::create('icd_9cm_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique();
            $table->string('description');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active']);
            $table->index('code');
        });

        // 15. Odontograms table
        Schema::create('odontograms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('appointment_id')->constrained('appointments')->onDelete('cascade')->unique();
            $table->foreignId('doctor_id')->constrained('doctors')->onDelete('cascade');
            $table->date('examination_date');
            $table->text('general_notes')->nullable();

            // Canvas data untuk save/load odontogram
            $table->json('canvas_data')->nullable()->comment('Data geometri canvas untuk save/load odontogram');

            // Metadata umum gigi sesuai panduan halaman 9
            $table->enum('occlusion', ['normal', 'cross', 'steep'])->nullable()->default('normal')->comment('Normal Bite/Cross Bite/Steep Bite');
            $table->enum('torus_palatinus', ['none', 'small', 'medium', 'large', 'multiple'])->nullable()->default('none')->comment('Tidak Ada/Kecil/Sedang/Besar/Multiple');
            $table->enum('torus_mandibularis', ['none', 'left', 'right', 'both'])->nullable()->default('none')->comment('Tidak ada/sisi kiri/sisi kanan/kedua sisi');
            $table->enum('palatum', ['deep', 'medium', 'shallow'])->nullable()->default('medium')->comment('Dalam/Sedang/Rendah');
            $table->text('diastema')->nullable()->comment('Dijelaskan dimana dan berapa lebarnya');
            $table->text('gigi_anomali')->nullable()->comment('Dijelaskan gigi yang mana, dan bentuknya');
            $table->text('others')->nullable()->comment('Hal-hal yang tidak tercakup diatas');

            // DMF-T values
            $table->unsignedInteger('d_value')->nullable()->default(0)->comment('Decayed (D)');
            $table->unsignedInteger('m_value')->nullable()->default(0)->comment('Missing (M)');
            $table->unsignedInteger('f_value')->nullable()->default(0)->comment('Filled (F)');

            // Photo and X-ray information
            $table->unsignedInteger('photo_count')->nullable()->default(0)->comment('Jumlah foto yang diambil');
            $table->enum('photo_type', ['digital', 'intraoral', 'both'])->nullable();
            $table->unsignedInteger('xray_count')->nullable()->default(0)->comment('Jumlah rontgen foto yang diambil');
            $table->json('xray_type')->nullable()->comment('Types: Dental/PA/OPG/Ceph');

            $table->boolean('is_finalized')->default(false)->comment('True jika odontogram sudah final');
            $table->timestamp('finalized_at')->nullable();
            $table->foreignId('finalized_by')->nullable()->constrained('users');

            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['patient_id', 'examination_date']);
            $table->index(['doctor_id', 'examination_date']);
            $table->index(['is_finalized', 'finalized_at']);
        });

        // 16. Tooth conditions table
        Schema::create('tooth_conditions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('odontogram_id')->constrained('odontograms')->onDelete('cascade');

            // Data dari Canvas
            $table->string('tooth_number', 5); // 18, 17, 16, etc.
            $table->string('surface', 1)->nullable(); // M, O, D, V, L, B, T or null
            $table->enum('condition_code', [
                'AMF',
                'COF',
                'FIS',
                'NVT',
                'RCT',
                'NON',
                'UNE',
                'PRE',
                'ANO',
                'CARIES',
                'CFR',
                'FMC',
                'POC',
                'RRX',
                'MIS',
                'IPX',
                'FRM_ACR',
                'BRIDGE'
            ]);
            $table->json('geometry_data')->nullable();

            // Status tracking untuk workflow management
            $table->enum('diagnosis_status', [
                'needs_diagnosis',
                'no_diagnosis',
                'has_diagnosis'
            ])->default('needs_diagnosis')->comment('Status diagnosis untuk workflow management');

            $table->enum('treatment_status', [
                'no_treatment',
                'needs_treatment',
                'treatment_in_progress',
                'treatment_completed',
                'treatment_cancelled'
            ])->default('no_treatment')->comment('Status treatment untuk workflow management');

            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['odontogram_id', 'tooth_number']);
            $table->index(['odontogram_id', 'condition_code']);
            $table->index(['diagnosis_status', 'is_active']);
            $table->index(['treatment_status', 'is_active']);
            $table->unique(['odontogram_id', 'tooth_number', 'surface', 'condition_code'], 'unique_tooth_condition');
        });

        // 17. Tooth bridges table
        Schema::create('tooth_bridges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('odontogram_id')->constrained('odontograms')->onDelete('cascade');
            $table->string('bridge_name')->default('Bridge')->comment('Nama/kode bridge');
            $table->json('connected_teeth')->comment('Array tooth numbers yang terhubung');
            $table->enum('bridge_type', ['fixed', 'removable', 'implant'])->default('fixed');
            $table->json('bridge_geometry')->nullable()->comment('Data geometri canvas untuk bridge');

            // Status columns (from update migration)
            $table->enum('diagnosis_status', [
                'needs_diagnosis',
                'no_diagnosis',
                'has_diagnosis'
            ])->default('needs_diagnosis');

            $table->enum('treatment_status', [
                'no_treatment',
                'needs_treatment',
                'treatment_in_progress',
                'treatment_completed',
                'treatment_cancelled'
            ])->default('no_treatment');

            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['odontogram_id', 'bridge_type']);
            $table->index(['odontogram_id', 'is_active']);
        });

        // 18. Tooth indicators table
        Schema::create('tooth_indicators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('odontogram_id')->constrained('odontograms')->onDelete('cascade');

            $table->string('tooth_number', 5);
            $table->enum('indicator_type', [
                'ARROW_TOP_LEFT',
                'ARROW_TOP_RIGHT',
                'ARROW_TOP_TURN_LEFT',
                'ARROW_TOP_TURN_RIGHT',
                'ARROW_BOTTOM_LEFT',
                'ARROW_BOTTOM_RIGHT',
                'ARROW_BOTTOM_TURN_LEFT',
                'ARROW_BOTTOM_TURN_RIGHT'
            ]);

            $table->enum('diagnosis_status', [
                'needs_diagnosis',
                'no_diagnosis',
                'has_diagnosis'
            ])->default('needs_diagnosis')->comment('Status diagnosis untuk workflow management');

            $table->enum('treatment_status', [
                'no_treatment',
                'needs_treatment',
                'treatment_in_progress',
                'treatment_completed',
                'treatment_cancelled'
            ])->default('no_treatment')->comment('Status treatment untuk workflow management');

            $table->json('geometry_data')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['odontogram_id', 'tooth_number']);
            $table->index(['odontogram_id', 'indicator_type']);
            $table->index(['odontogram_id', 'is_active']);
            $table->index(['diagnosis_status', 'is_active']);
            $table->index(['treatment_status', 'is_active']);
            $table->unique(['odontogram_id', 'tooth_number', 'indicator_type'], 'unique_tooth_indicator');
        });

        // 19. Tooth diagnoses primary table
        Schema::create('tooth_diagnoses_primary', function (Blueprint $table) {
            $table->id();

            // Parent references (one of these must be set)
            $table->foreignId('tooth_condition_id')->nullable()->constrained('tooth_conditions')->onDelete('cascade');
            $table->foreignId('tooth_bridge_id')->nullable()->constrained('tooth_bridges')->onDelete('cascade');
            $table->foreignId('tooth_indicator_id')->nullable()->constrained('tooth_indicators')->onDelete('cascade');

            // Primary diagnosis data
            $table->foreignId('icd_10_codes_diagnoses_id')->constrained('icd_10_codes_diagnoses')->onDelete('cascade');
            $table->text('diagnosis_notes')->nullable();

            // External cause data (optional)
            $table->foreignId('icd_10_codes_external_cause_id')->nullable()->constrained('icd_10_codes_external_cause')->onDelete('set null');
            $table->text('external_cause_notes')->nullable();

            // Metadata
            $table->foreignId('diagnosed_by')->constrained('users');
            $table->timestamp('diagnosed_at')->useCurrent();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Indexes with custom names
            $table->index(['tooth_condition_id', 'is_active'], 'tdp_condition_active_idx');
            $table->index(['tooth_bridge_id', 'is_active'], 'tdp_bridge_active_idx');
            $table->index(['tooth_indicator_id', 'is_active'], 'tdp_indicator_active_idx');
            $table->index(['icd_10_codes_diagnoses_id'], 'tdp_icd10_diag_idx');
            $table->index(['diagnosed_by', 'diagnosed_at'], 'tdp_diagnosed_idx');

            // Ensure only one primary diagnosis per parent
            $table->unique(['tooth_condition_id'], 'unique_primary_diagnosis_condition');
            $table->unique(['tooth_bridge_id'], 'unique_primary_diagnosis_bridge');
            $table->unique(['tooth_indicator_id'], 'unique_primary_diagnosis_indicator');
        });

        // 20. Tooth diagnoses secondary table
        Schema::create('tooth_diagnoses_secondary', function (Blueprint $table) {
            $table->id();

            // Reference to primary diagnosis
            $table->foreignId('tooth_diagnoses_primary_id')->constrained('tooth_diagnoses_primary')->onDelete('cascade');

            // Secondary diagnosis data
            $table->foreignId('icd_10_codes_diagnoses_id')->constrained('icd_10_codes_diagnoses')->onDelete('cascade');
            $table->text('diagnosis_notes')->nullable();

            // Metadata
            $table->foreignId('diagnosed_by')->constrained('users');
            $table->timestamp('diagnosed_at')->useCurrent();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Indexes with custom names to avoid MySQL length limit
            $table->index(['tooth_diagnoses_primary_id', 'is_active'], 'tds_primary_active_idx');
            $table->index(['icd_10_codes_diagnoses_id'], 'tds_icd10_diag_idx');
            $table->index(['diagnosed_by', 'diagnosed_at'], 'tds_diagnosed_idx');

            // Prevent duplicate secondary diagnoses with custom constraint name
            $table->unique(['tooth_diagnoses_primary_id', 'icd_10_codes_diagnoses_id'], 'unique_secondary_diag');
        });

        // 21. Tooth treatments table
        Schema::create('tooth_treatments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tooth_condition_id')->nullable()->constrained('tooth_conditions')->onDelete('cascade');
            $table->foreignId('tooth_bridge_id')->nullable()->constrained('tooth_bridges')->onDelete('cascade');
            $table->foreignId('tooth_indicator_id')->nullable()->constrained('tooth_indicators')->onDelete('cascade');

            $table->text('notes')->nullable();

            // Treatment status and dates
            $table->enum('status', [
                'planned',
                'in_progress',
                'completed',
                'cancelled'
            ])->default('planned');

            $table->date('planned_date')->nullable();
            $table->date('started_date')->nullable();
            $table->date('completed_date')->nullable();

            // Metadata
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('completed_by')->nullable()->constrained('users');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Indexes
            $table->index(['tooth_condition_id', 'status']);
            $table->index(['tooth_indicator_id', 'is_active']);
            $table->index(['status', 'is_active']);
            $table->index(['created_by']);
            $table->index(['completed_by']);
        });

        // 22. Tooth treatment procedures table
        Schema::create('tooth_treatment_procedures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tooth_treatment_id')->constrained('tooth_treatments')->onDelete('cascade');
            $table->foreignId('icd_9cm_codes_id')->constrained('icd_9cm_codes')->onDelete('cascade');
            $table->timestamps();

            // Indexes with custom names
            $table->index(['tooth_treatment_id'], 'ttp_treatment_idx');
            $table->index(['icd_9cm_codes_id'], 'ttp_icd9_idx');

            // Prevent duplicate procedures with custom constraint name
            $table->unique(['tooth_treatment_id', 'icd_9cm_codes_id'], 'unique_treatment_proc');
        });

        // 23. Odontogram revisions table
        Schema::create('odontogram_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('odontogram_id')->constrained('odontograms')->onDelete('cascade');
            $table->string('table_name')->comment('Tabel yang diubah: tooth_conditions, tooth_bridges, tooth_treatments, etc.');
            $table->unsignedBigInteger('record_id')->comment('ID record yang diubah');
            $table->enum('action', ['create', 'update', 'delete'])->default('update');
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->text('reason')->nullable();
            $table->foreignId('updated_by')->constrained('users');
            $table->timestamps();

            $table->index(['odontogram_id', 'created_at']);
            $table->index(['table_name', 'record_id']);
            $table->index(['updated_by', 'created_at']);
        });

        // 24. Odontogram attachments table
        Schema::create('odontogram_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('odontogram_id')->constrained('odontograms')->onDelete('cascade');
            $table->enum('type', ['photo', 'xray', 'document']);
            $table->string('file_path');
            $table->string('file_name');
            $table->string('mime_type')->nullable();
            $table->bigInteger('file_size')->nullable();
            $table->text('description')->nullable();
            $table->string('tooth_number', 5)->nullable()->comment('Jika attachment terkait gigi tertentu');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['odontogram_id', 'type']);
            $table->index(['tooth_number']);
            $table->index(['type', 'is_active']);
        });

        // 25. Odontogram templates table
        Schema::create('odontogram_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('template_data')->comment('Data template untuk quick apply');
            $table->foreignId('created_by')->constrained('users');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_public')->default(false)->comment('Template can be used by all users');
            $table->timestamps();

            $table->index(['created_by', 'is_active']);
            $table->index(['is_public', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop tables in reverse order of dependencies
        Schema::dropIfExists('odontogram_templates');
        Schema::dropIfExists('odontogram_attachments');
        Schema::dropIfExists('odontogram_revisions');
        Schema::dropIfExists('tooth_treatment_procedures');
        Schema::dropIfExists('tooth_treatments');
        Schema::dropIfExists('tooth_diagnoses_secondary');
        Schema::dropIfExists('tooth_diagnoses_primary');
        Schema::dropIfExists('tooth_indicators');
        Schema::dropIfExists('tooth_bridges');
        Schema::dropIfExists('tooth_conditions');
        Schema::dropIfExists('odontograms');
        Schema::dropIfExists('icd_9cm_codes');
        Schema::dropIfExists('icd_10_codes_external_cause');
        Schema::dropIfExists('icd_10_codes_diagnoses');
        Schema::dropIfExists('appointments');
        Schema::dropIfExists('queues');
        Schema::dropIfExists('schedule_quotas');
        Schema::dropIfExists('schedule_exceptions');
        Schema::dropIfExists('schedules');
        Schema::dropIfExists('medical_histories');
        Schema::dropIfExists('employees');
        Schema::dropIfExists('doctors');
        Schema::dropIfExists('patients');
        Schema::dropIfExists('guardians');
        Schema::dropIfExists('failed_jobs');
        Schema::dropIfExists('job_batches');
        Schema::dropIfExists('jobs');
        Schema::dropIfExists('cache_locks');
        Schema::dropIfExists('cache');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
