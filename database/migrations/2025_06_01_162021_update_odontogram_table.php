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
        // 1. Rename icd_10_codes to icd_10_codes_diagnoses and remove category
        Schema::table('icd_10_codes', function (Blueprint $table) {
            $table->dropColumn('category');
        });

        Schema::rename('icd_10_codes', 'icd_10_codes_diagnoses');

        // 2. Create icd_10_codes_external_cause table
        Schema::create('icd_10_codes_external_cause', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique();
            $table->string('description');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active']);
            $table->index('code');
        });

        // 3. Create icd_9cm_codes table
        Schema::create('icd_9cm_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique();
            $table->string('description');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active']);
            $table->index('code');
        });

        // 4. Create tooth_diagnoses_primary table (replaces tooth_diagnoses)
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

            // Indexes
            $table->index(['tooth_condition_id', 'is_active']);
            $table->index(['tooth_bridge_id', 'is_active']);
            $table->index(['tooth_indicator_id', 'is_active']);
            $table->index(['icd_10_codes_diagnoses_id']);
            $table->index(['diagnosed_by', 'diagnosed_at']);

            // Ensure only one primary diagnosis per parent
            $table->unique(['tooth_condition_id'], 'unique_primary_diagnosis_condition');
            $table->unique(['tooth_bridge_id'], 'unique_primary_diagnosis_bridge');
            $table->unique(['tooth_indicator_id'], 'unique_primary_diagnosis_indicator');
        });

        // 5. Create tooth_diagnoses_secondary table
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

            // Indexes
            $table->index(['tooth_diagnoses_primary_id', 'is_active']);
            $table->index(['icd_10_codes_diagnoses_id']);
            $table->index(['diagnosed_by', 'diagnosed_at']);

            // Prevent duplicate secondary diagnoses
            $table->unique(['tooth_diagnoses_primary_id', 'icd_10_codes_diagnoses_id'], 'unique_secondary_diagnosis');
        });

        // 6. Create tooth_treatment_procedures table (for many-to-many relationship with icd_9cm_codes)
        Schema::create('tooth_treatment_procedures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tooth_treatment_id')->constrained('tooth_treatments')->onDelete('cascade');
            $table->foreignId('icd_9cm_codes_id')->constrained('icd_9cm_codes')->onDelete('cascade');
            $table->timestamps();

            // Indexes
            $table->index(['tooth_treatment_id']);
            $table->index(['icd_9cm_codes_id']);

            // Prevent duplicate procedures
            $table->unique(['tooth_treatment_id', 'icd_9cm_codes_id'], 'unique_treatment_procedure');
        });

        // 7. Modify tooth_treatments table
        Schema::table('tooth_treatments', function (Blueprint $table) {
            // Drop old columns
            $table->dropColumn(['dental_treatment_id', 'icd_9_cm_code']);

            // Rename treatment_notes to just notes
            $table->renameColumn('treatment_notes', 'notes');
        });

        // 8. Drop old tables
        Schema::dropIfExists('tooth_diagnoses');
        Schema::dropIfExists('external_causes');
        Schema::dropIfExists('dental_diagnoses');
        Schema::dropIfExists('dental_treatments');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate external_causes table
        Schema::create('external_causes', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique();
            $table->text('description');
            $table->string('category')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['category', 'is_active']);
            $table->index('code');
        });

        // Recreate dental_diagnoses table
        Schema::create('dental_diagnoses', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('suggested_icd_10_code', 10)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('suggested_icd_10_code');
        });

        // Recreate dental_treatments table
        Schema::create('dental_treatments', function (Blueprint $table) {
            $table->id();
            $table->string('code', 10)->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('icd_9_cm_code', 10)->nullable();
            $table->string('suggested_icd_10_code', 10)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['icd_9_cm_code']);
            $table->index(['suggested_icd_10_code']);
        });

        // Recreate tooth_diagnoses table
        Schema::create('tooth_diagnoses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tooth_condition_id')->nullable()->constrained('tooth_conditions')->onDelete('cascade');
            $table->foreignId('tooth_bridge_id')->nullable()->constrained('tooth_bridges')->onDelete('cascade');
            $table->foreignId('tooth_indicator_id')->nullable()->constrained('tooth_indicators')->onDelete('cascade');
            $table->foreignId('dental_diagnosis_id')->constrained('dental_diagnoses')->onDelete('cascade');
            $table->text('diagnosis_notes')->nullable();
            $table->string('icd_10_code', 10)->nullable();
            $table->string('external_cause_code', 10)->nullable();
            $table->text('external_cause_notes')->nullable();
            $table->foreignId('diagnosed_by')->constrained('users');
            $table->timestamp('diagnosed_at')->useCurrent();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Restore tooth_treatments table
        Schema::table('tooth_treatments', function (Blueprint $table) {
            $table->renameColumn('notes', 'treatment_notes');
            $table->foreignId('dental_treatment_id')->nullable()->constrained('dental_treatments')->onDelete('cascade');
            $table->string('icd_9_cm_code', 10)->nullable();
        });

        // Drop new tables
        Schema::dropIfExists('tooth_treatment_procedures');
        Schema::dropIfExists('tooth_diagnoses_secondary');
        Schema::dropIfExists('tooth_diagnoses_primary');
        Schema::dropIfExists('icd_9cm_codes');
        Schema::dropIfExists('icd_10_codes_external_cause');

        // Restore icd_10_codes table
        Schema::rename('icd_10_codes_diagnoses', 'icd_10_codes');
        Schema::table('icd_10_codes', function (Blueprint $table) {
            $table->string('category')->nullable()->after('description');
        });
    }
};
