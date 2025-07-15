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
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medical_histories');
    }
};
