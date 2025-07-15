<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Employee;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EmployeeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $employees = [
            [
                'name' => 'Erin',
                'position' => 'Administrator',
                'address' => '123 Main St.',
                'phone' => '08123456789',
            ],
            [
                'name' => 'Eko',
                'position' => 'Receptionist',
                'address' => '456 Second Ave.',
                'phone' => '08234567890',
            ],
            [
                'name' => 'Erwin',
                'position' => 'Nurse',
                'address' => '789 Third Blvd.',
                'phone' => '08345678901',
            ],
            [
                'name' => 'Edi',
                'position' => 'Security',
                'address' => '321 Fourth Dr.',
                'phone' => '08456789012',
            ],
            [
                'name' => 'Eni',
                'position' => 'Accountant',
                'address' => '654 Fifth Rd.',
                'phone' => '08567890123',
            ]
        ];

        foreach ($employees as $employeeData) {
            $employeeUser = User::create([
                'name' => $employeeData['name'],
                'email' => strtolower(str_replace(' ', '_', $employeeData['name'])) . '@example.com',
                'password' => Hash::make('test1234'),
                'role' => 'employee',
            ]);

            Employee::create([
                'user_id' => $employeeUser->id,
                'code' => 'EMP' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT),
                'name' => $employeeData['name'],
                'position' => $employeeData['position'],
                'address' => $employeeData['address'],
                'phone' => $employeeData['phone'],
            ]);
        }
    }
}
