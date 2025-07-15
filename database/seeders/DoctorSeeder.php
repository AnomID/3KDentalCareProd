<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Doctor;
use App\Models\Schedule;
use App\Models\ScheduleQuota;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DoctorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $doctors = [
            [
                'name' => 'Dr.Dani',
                'specialization' => 'Cardiologist',
                'license_number' => 'CARDIO123',
                'phone' => '08123456789',
                'address' => '123 Heart Lane',
            ],
            [
                'name' => 'Dr.Dwi',
                'specialization' => 'Neurologist',
                'license_number' => 'NEURO456',
                'phone' => '08234567890',
                'address' => '456 Brain Avenue',
            ],
            [
                'name' => 'Dr.Doni',
                'specialization' => 'Dermatologist',
                'license_number' => 'DERM789',
                'phone' => '08345678901',
                'address' => '789 Skin Street',
            ],
            [
                'name' => 'Dr.Darius',
                'specialization' => 'Pediatrician',
                'license_number' => 'PEDI101',
                'phone' => '08456789012',
                'address' => '321 Kids Road',
            ],
            [
                'name' => 'Dr.Dona',
                'specialization' => 'Orthopedist',
                'license_number' => 'ORTHO202',
                'phone' => '08567890123',
                'address' => '654 Bone Boulevard',
            ]
        ];

        foreach ($doctors as $doctorData) {
            $doctorUser = User::create([
                'name' => $doctorData['name'],
                'email' => strtolower(str_replace(' ', '_', $doctorData['name'])) . '@example.com',
                'password' => Hash::make('test1234'),
                'role' => 'doctor',
            ]);

            $doctor = Doctor::create([
                'user_id' => $doctorUser->id,
                'code' => 'DOC' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT),
                'name' => $doctorData['name'],
                'specialization' => $doctorData['specialization'],
                'license_number' => $doctorData['license_number'],
                'phone' => $doctorData['phone'],
                'license_start_date' => now(),
                'license_expiry_date' => now()->addYears(5),
                'address' => $doctorData['address'],
            ]);

            $this->createSchedulesForDoctor($doctor);
        }
    }

    /**
     * Create schedule and quota for a doctor.
     *
     * @param Doctor $doctor
     * @return void
     */
    private function createSchedulesForDoctor($doctor)
    {
        $schedules = [
            ['day_of_week' => 1, 'start_time' => '09:00', 'end_time' => '12:00', 'status' => true],
            ['day_of_week' => 3, 'start_time' => '14:00', 'end_time' => '17:00', 'status' => true],
            ['day_of_week' => 5, 'start_time' => '10:00', 'end_time' => '13:00', 'status' => true],
        ];

        foreach ($schedules as $scheduleData) {
            $schedule = Schedule::create([
                'doctor_id' => $doctor->id,
                'day_of_week' => $scheduleData['day_of_week'],
                'start_time' => $scheduleData['start_time'],
                'end_time' => $scheduleData['end_time'],
                'status' => $scheduleData['status'],
                'notes' => 'Regular consultation',
            ]);

            ScheduleQuota::create([
                'schedule_id' => $schedule->id,
                'quota' => rand(5, 10),
            ]);
        }
    }
}
