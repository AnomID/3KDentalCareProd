<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->foreignId('guardian_id')->nullable()->constrained('guardians')->onDelete('set null');
            $table->string('no_rm')->nullable()->unique();
            $table->string('name');
            $table->string('birth_place');
            $table->date('birth_date');
            // $table->integer('age');
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
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
