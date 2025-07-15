<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class SaveToothConditionsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = Auth::user();
        $odontogram = $this->route('odontogram');

        // Only doctors can edit odontograms
        if ($user->role !== 'doctor' || !$user->doctor) {
            return false;
        }

        // Check if odontogram belongs to this doctor
        if ($odontogram && $odontogram->doctor_id !== $user->doctor->id) {
            return false;
        }

        // Check if odontogram is not finalized
        if ($odontogram && $odontogram->is_finalized) {
            return false;
        }

        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'conditions' => 'required|array|min:1',
            'conditions.*.tooth_number' => 'required|string|max:5|regex:/^[0-9]{2}$/',
            'conditions.*.surface' => 'nullable|string|in:M,O,D,V,L,B,T,all',
            'conditions.*.condition_code' => [
                'required',
                'string',
                'in:AMF,COF,FIS,NVT,RCT,NON,UNE,PRE,ANO,CARIES,CFR,FMC,POC,RRX,MIS,IPX,FRM_ACR,BRIDGE'
            ],
            'conditions.*.geometry_data' => 'nullable|json',
            'conditions.*.diagnosis_id' => 'nullable|exists:dental_diagnoses,id',
            'conditions.*.icd_10_code' => 'nullable|string|max:10',
            'conditions.*.external_cause_code' => 'nullable|string|max:10',
            'conditions.*.diagnosis_notes' => 'nullable|string|max:65535',
            'conditions.*.external_cause_notes' => 'nullable|string|max:65535',
            'conditions.*.planned_treatment_id' => 'nullable|exists:dental_treatments,id',
            'conditions.*.treatment_plan_notes' => 'nullable|string|max:65535',
            'conditions.*.planned_date' => 'nullable|date|after_or_equal:today',
            'conditions.*.priority' => 'nullable|string|in:low,normal,high,urgent',
            'conditions.*.treatment_cost' => 'nullable|numeric|min:0|max:999999999',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'conditions.required' => 'Data kondisi gigi harus disediakan.',
            'conditions.array' => 'Data kondisi gigi harus berupa array.',
            'conditions.min' => 'Minimal harus ada 1 kondisi gigi.',
            'conditions.*.tooth_number.required' => 'Nomor gigi harus diisi.',
            'conditions.*.tooth_number.regex' => 'Nomor gigi harus berupa 2 digit angka.',
            'conditions.*.surface.in' => 'Permukaan gigi harus salah satu dari: M, O, D, V, L, B, T, all.',
            'conditions.*.condition_code.required' => 'Kode kondisi harus diisi.',
            'conditions.*.condition_code.in' => 'Kode kondisi tidak valid.',
            'conditions.*.diagnosis_id.exists' => 'Diagnosis yang dipilih tidak valid.',
            'conditions.*.planned_treatment_id.exists' => 'Perawatan yang dipilih tidak valid.',
            'conditions.*.planned_date.after_or_equal' => 'Tanggal rencana tidak boleh kurang dari hari ini.',
            'conditions.*.priority.in' => 'Prioritas harus salah satu dari: low, normal, high, urgent.',
            'conditions.*.treatment_cost.numeric' => 'Biaya perawatan harus berupa angka.',
            'conditions.*.treatment_cost.min' => 'Biaya perawatan tidak boleh kurang dari 0.',
            'conditions.*.treatment_cost.max' => 'Biaya perawatan terlalu besar.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Custom validation: Check tooth number validity
            if ($this->has('conditions')) {
                foreach ($this->input('conditions') as $index => $condition) {
                    if (isset($condition['tooth_number'])) {
                        if (!$this->isValidToothNumber($condition['tooth_number'])) {
                            $validator->errors()->add(
                                "conditions.{$index}.tooth_number",
                                'Nomor gigi tidak valid dalam sistem FDI.'
                            );
                        }
                    }
                }
            }
        });
    }

    /**
     * Validate tooth number according to FDI system.
     */
    private function isValidToothNumber(string $toothNumber): bool
    {
        $num = (int) $toothNumber;

        // Adult teeth: 11-18, 21-28, 31-38, 41-48
        $adultRanges = [
            [11, 18],
            [21, 28],
            [31, 38],
            [41, 48]
        ];

        // Deciduous teeth: 51-55, 61-65, 71-75, 81-85
        $deciduousRanges = [
            [51, 55],
            [61, 65],
            [71, 75],
            [81, 85]
        ];

        $allRanges = array_merge($adultRanges, $deciduousRanges);

        foreach ($allRanges as [$min, $max]) {
            if ($num >= $min && $num <= $max) {
                return true;
            }
        }

        return false;
    }
}
