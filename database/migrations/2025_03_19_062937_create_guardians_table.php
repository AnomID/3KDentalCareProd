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
        Schema::create('guardians', function (Blueprint $table) {
            $table->id();
            // $table->foreignId('patient_id')->nullable()->constrained('patiens')->onDelete('cascade');
            $table->string('name')->nullable();
            $table->string('relationship'); 
            $table->enum('identity_type', ['KTP', 'PASSPORT'])->nullable();
            $table->string('identity_number')->nullable()->unique(); 
            $table->string('phone_number')->nullable();
            $table->text('address')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guardians');
    }
};
