<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Patient;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class PatientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $patients = [
            [
                'name' => 'Anom',
                'birth_place' => 'Jakarta',
                'birth_date' => '1985-01-15',
                'identity_type' => 'KTP',
                'citizenship' => 'Indonesian',
                'gender' => 'Male',
                'occupation' => 'Engineer',
                'address' => '123 Street Name',
                'blood_type' => 'A+',
            ],
            [
                'name' => 'Arsyha',
                'birth_place' => 'Bandung',
                'birth_date' => '1990-03-22',
                'identity_type' => 'KTP',
                'citizenship' => 'Indonesian',
                'gender' => 'Female',
                'occupation' => 'Teacher',
                'address' => '456 Avenue Name',
                'blood_type' => 'O+',
            ],
            [
                'name' => 'Arkananta',
                'birth_place' => 'Surabaya',
                'birth_date' => '1992-06-15',
                'identity_type' => 'KTP',
                'citizenship' => 'Indonesian',
                'gender' => 'Male',
                'occupation' => 'Designer',
                'address' => '789 Boulevard',
                'blood_type' => 'B+',
            ],

        ];

        $validIdentityTypes = ['KTP', 'PASSPORT', 'GUARDIAN'];

        foreach ($patients as $patientData) {
            if (!in_array($patientData['identity_type'], $validIdentityTypes)) {
                continue;
            }

            $email = strtolower(str_replace(' ', '_', $patientData['name'])) . '@example.com';

            $noIdentity = rand(1000000000, 9999999999);
            $phone = '08' . rand(100000000, 999999999);

            $patientUser = User::create([
                'name' => $patientData['name'],
                'email' => $email,
                'password' => Hash::make('test1234'),
                'role' => 'patient',
            ]);

            Patient::create([
                'user_id' => $patientUser->id,
                'name' => $patientData['name'],
                'birth_place' => $patientData['birth_place'],
                'birth_date' => $patientData['birth_date'],
                'identity_type' => $patientData['identity_type'],
                'no_identity' => $noIdentity,
                'citizenship' => $patientData['citizenship'],
                'gender' => $patientData['gender'],
                'occupation' => $patientData['occupation'],
                'address' => $patientData['address'],
                'phone' => $phone,
                'blood_type' => $patientData['blood_type'],
            ]);
        }
    }
}
