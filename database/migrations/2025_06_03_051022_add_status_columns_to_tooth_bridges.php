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
        Schema::table('tooth_bridges', function (Blueprint $table) {
            // Add diagnosis status column if it doesn't exist
            if (!Schema::hasColumn('tooth_bridges', 'diagnosis_status')) {
                $table->enum('diagnosis_status', [
                    'needs_diagnosis',
                    'no_diagnosis',
                    'has_diagnosis'
                ])->default('needs_diagnosis')->after('bridge_geometry');
            }

            // Add treatment status column if it doesn't exist
            if (!Schema::hasColumn('tooth_bridges', 'treatment_status')) {
                $table->enum('treatment_status', [
                    'no_treatment',
                    'needs_treatment',
                    'treatment_in_progress',
                    'treatment_completed',
                    'treatment_cancelled'
                ])->default('no_treatment')->after('diagnosis_status');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tooth_bridges', function (Blueprint $table) {
            if (Schema::hasColumn('tooth_bridges', 'diagnosis_status')) {
                $table->dropColumn('diagnosis_status');
            }

            if (Schema::hasColumn('tooth_bridges', 'treatment_status')) {
                $table->dropColumn('treatment_status');
            }
        });
    }
};
