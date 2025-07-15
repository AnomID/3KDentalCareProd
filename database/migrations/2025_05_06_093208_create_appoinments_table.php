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
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
