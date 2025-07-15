<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Tabel untuk menyimpan kode ICD-10
        Schema::create('icd_10_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique();
            $table->string('description');
            $table->string('category')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Index untuk performa search
            $table->index(['category', 'is_active']);
        });

        // Tabel untuk External Causes ICD-10
        Schema::create('external_causes', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique();
            $table->text('description');
            $table->string('category')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Index untuk performa search
            $table->index(['category', 'is_active']);
            $table->index('code');
        });

        // Tabel Master Diagnosa Gigi
        Schema::create('dental_diagnoses', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique();
            $table->string('name');
            $table->text('description')->nullable();

            // Suggested ICD-10 code mapping
            $table->string('suggested_icd_10_code', 10)->nullable()->comment('Suggested ICD-10 diagnosis code mapping');

            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Index untuk performa
            $table->index('suggested_icd_10_code');

            // Foreign key ke ICD-10 codes table (optional untuk referential integrity)
            $table->foreign('suggested_icd_10_code')->references('code')->on('icd_10_codes')->onDelete('set null');
        });

        // Tabel Master Perawatan
        Schema::create('dental_treatments', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique();
            $table->string('name');
            $table->text('description')->nullable();

            // ICD 9-CM procedure code
            $table->string('icd_9_cm_code', 10)->nullable()->comment('ICD 9-CM procedure code');

            // Suggested ICD-10 diagnosis code mapping
            $table->string('suggested_icd_10_code', 10)->nullable()->comment('Suggested ICD-10 diagnosis code mapping');

            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Index untuk search performance
            $table->index(['icd_9_cm_code']);
            $table->index(['suggested_icd_10_code']);

            // Foreign key ke ICD-10 codes table (optional untuk referential integrity)
            $table->foreign('suggested_icd_10_code')->references('code')->on('icd_10_codes')->onDelete('set null');
        });

        // Tabel untuk menyimpan odontogram
        Schema::create('odontograms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('appointment_id')->constrained('appointments')->onDelete('cascade')->unique(); // UNIQUE untuk memastikan 1 appointment = 1 odontogram
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

        // Tabel untuk menyimpan kondisi setiap gigi/permukaan - UPDATED
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

            // NEW: Status tracking untuk workflow management
            $table->enum('diagnosis_status', [
                'needs_diagnosis',     // Belum ada pilihan
                'no_diagnosis',        // Dipilih "Tanpa Diagnosa"  
                'has_diagnosis'        // Sudah ada diagnosis
            ])->default('needs_diagnosis')->comment('Status diagnosis untuk workflow management');

            $table->enum('treatment_status', [
                'no_treatment',        // Tidak perlu/belum treatment
                'needs_treatment',     // Butuh treatment
                'treatment_in_progress', // Treatment berlangsung
                'treatment_completed',   // Treatment selesai
                'treatment_cancelled'    // Treatment dibatalkan
            ])->default('no_treatment')->comment('Status treatment untuk workflow management');

            // Status basic
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['odontogram_id', 'tooth_number']);
            $table->index(['odontogram_id', 'condition_code']);
            $table->index(['diagnosis_status', 'is_active']);
            $table->index(['treatment_status', 'is_active']);
            $table->unique(['odontogram_id', 'tooth_number', 'surface', 'condition_code'], 'unique_tooth_condition');
        });

        // Tabel untuk bridge/splinting yang menghubungkan multiple gigi
        Schema::create('tooth_bridges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('odontogram_id')->constrained('odontograms')->onDelete('cascade');
            $table->string('bridge_name')->default('Bridge')->comment('Nama/kode bridge');
            $table->json('connected_teeth')->comment('Array tooth numbers yang terhubung');
            $table->enum('bridge_type', ['fixed', 'removable', 'implant'])->default('fixed');
            $table->json('bridge_geometry')->nullable()->comment('Data geometri canvas untuk bridge');

            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['odontogram_id', 'bridge_type']);
            $table->index(['odontogram_id', 'is_active']);
        });

        // Tabel untuk arrows/indikator pada odontogram
        Schema::create('tooth_indicators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('odontogram_id')->constrained('odontograms')->onDelete('cascade');

            // Core data - sama seperti tooth_conditions
            $table->string('tooth_number', 5); // 18, 17, 16, etc.
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
                'needs_diagnosis',     // Belum ada pilihan
                'no_diagnosis',        // Dipilih "Tanpa Diagnosa"  
                'has_diagnosis'        // Sudah ada diagnosis
            ])->default('needs_diagnosis')->comment('Status diagnosis untuk workflow management');

            $table->enum('treatment_status', [
                'no_treatment',        // Tidak perlu/belum treatment
                'needs_treatment',     // Butuh treatment
                'treatment_in_progress', // Treatment berlangsung
                'treatment_completed',   // Treatment selesai
                'treatment_cancelled'    // Treatment dibatalkan
            ])->default('no_treatment')->comment('Status treatment untuk workflow management');

            // Geometry data untuk canvas - sama seperti tooth_conditions
            $table->json('geometry_data')->nullable();

            // Status - sama seperti tooth_conditions
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Indexes - sama seperti tooth_conditions
            $table->index(['odontogram_id', 'tooth_number']);
            $table->index(['odontogram_id', 'indicator_type']);
            $table->index(['odontogram_id', 'is_active']);
            $table->index(['diagnosis_status', 'is_active']);
            $table->index(['treatment_status', 'is_active']);

            // Unique constraint untuk mencegah duplicate indicator pada tooth yang sama
            $table->unique(['odontogram_id', 'tooth_number', 'indicator_type'], 'unique_tooth_indicator');
        });

        // SIMPLIFIED tooth_diagnoses table - Hanya untuk tooth_conditions
        Schema::create('tooth_diagnoses', function (Blueprint $table) {
            $table->id();

            // Only tooth_condition_id - simplified relationship
            $table->foreignId('tooth_condition_id')->nullable()->constrained('tooth_conditions')->onDelete('cascade');
            $table->foreignId('tooth_bridge_id')->nullable()->constrained('tooth_bridges')->onDelete('cascade');
            $table->foreignId('tooth_indicator_id')->nullable()->after('tooth_bridge_id')->constrained('tooth_indicators')->onDelete('cascade');
            // Basic diagnosis data - simplified
            $table->foreignId('dental_diagnosis_id')->constrained('dental_diagnoses')->onDelete('cascade');
            $table->text('diagnosis_notes')->nullable();

            // ICD Code
            $table->string('icd_10_code', 10)->nullable();
            // External Cause
            $table->string('external_cause_code', 10)->nullable();
            $table->text('external_cause_notes')->nullable();

            // Basic metadata - simplified
            $table->foreignId('diagnosed_by')->constrained('users');
            $table->timestamp('diagnosed_at')->useCurrent();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Simplified indexes
            $table->index(['tooth_condition_id', 'is_active']);
            $table->index(['tooth_indicator_id', 'is_active']);
            $table->index(['dental_diagnosis_id']);
            $table->index(['diagnosed_by', 'diagnosed_at']);

            // Foreign key constraints for external causes and icd codes
            $table->foreign('icd_10_code')->references('code')->on('icd_10_codes')->onDelete('set null');
            $table->foreign('external_cause_code')->references('code')->on('external_causes')->onDelete('set null');
        });

        // NEW: Tabel untuk tooth treatments
        Schema::create('tooth_treatments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tooth_condition_id')->nullable()->constrained('tooth_conditions')->onDelete('cascade');
            $table->foreignId('tooth_bridge_id')->nullable()->constrained('tooth_bridges')->onDelete('cascade');
            $table->foreignId('tooth_indicator_id')->nullable()->after('tooth_bridge_id')->constrained('tooth_indicators')->onDelete('cascade');

            // Basic treatment data
            $table->foreignId('dental_treatment_id')->constrained('dental_treatments')->onDelete('cascade');
            $table->string('icd_9_cm_code', 10)->nullable()->comment('ICD 9-CM procedure code if applicable');
            $table->text('treatment_notes')->nullable();

            // Treatment status and dates
            $table->enum('status', [
                'planned',      // Direncanakan
                'in_progress',  // Sedang berlangsung
                'completed',    // Selesai
                'cancelled'     // Dibatalkan
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
            $table->index(['dental_treatment_id']);
            $table->index(['status', 'is_active']);
            $table->index(['created_by']);
            $table->index(['completed_by']);
        });

        // Tabel untuk riwayat perubahan (audit trail)
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

        // Tabel untuk lampiran
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

        // Tabel untuk template/preset condition
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
        Schema::dropIfExists('tooth_treatments');
        Schema::dropIfExists('tooth_diagnoses');
        Schema::dropIfExists('tooth_indicators');
        Schema::dropIfExists('tooth_bridges');
        Schema::dropIfExists('tooth_conditions');
        Schema::dropIfExists('odontograms');
        Schema::dropIfExists('dental_treatments');
        Schema::dropIfExists('dental_diagnoses');
        Schema::dropIfExists('external_causes');
        Schema::dropIfExists('icd_10_codes');
    }
};
