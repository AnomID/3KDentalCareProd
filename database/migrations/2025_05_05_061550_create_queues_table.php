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
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('queues');
    }
};
