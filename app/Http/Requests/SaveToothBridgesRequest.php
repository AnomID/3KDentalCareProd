<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class SaveToothBridgesRequest extends FormRequest
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
            'bridges' => 'required|array|min:1',
            'bridges.*.bridge_name' => 'nullable|string|max:255',
            'bridges.*.connected_teeth' => 'required|array|min:2|max:10',
            'bridges.*.connected_teeth.*' => 'required|string|max:5|regex:/^[0-9]{2}$/',
            'bridges.*.bridge_type' => 'required|string|in:fixed,removable,implant',
            'bridges.*.bridge_geometry' => 'nullable|json',
            'bridges.*.diagnosis_id' => 'nullable|exists:dental_diagnoses,id',
            'bridges.*.icd_10_code' => 'nullable|string|max:10',
            'bridges.*.diagnosis_notes' => 'nullable|string|max:65535',
            'bridges.*.planned_treatment_id' => 'nullable|exists:dental_treatments,id',
            'bridges.*.treatment_notes' => 'nullable|string|max:65535',
            'bridges.*.status' => 'nullable|string|in:planned,in_progress,completed',
            // Backward compatibility
            'bridges.*.from' => 'nullable|string|max:5|regex:/^[0-9]{2}$/',
            'bridges.*.to' => 'nullable|string|max:5|regex:/^[0-9]{2}$/',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'bridges.required' => 'Data bridge harus disediakan.',
            'bridges.array' => 'Data bridge harus berupa array.',
            'bridges.min' => 'Minimal harus ada 1 bridge.',
            'bridges.*.bridge_name.max' => 'Nama bridge tidak boleh lebih dari 255 karakter.',
            'bridges.*.connected_teeth.required' => 'Gigi yang terhubung harus diisi.',
            'bridges.*.connected_teeth.array' => 'Gigi yang terhubung harus berupa array.',
            'bridges.*.connected_teeth.min' => 'Bridge minimal harus menghubungkan 2 gigi.',
            'bridges.*.connected_teeth.max' => 'Bridge maksimal dapat menghubungkan 10 gigi.',
            'bridges.*.connected_teeth.*.required' => 'Nomor gigi harus diisi.',
            'bridges.*.connected_teeth.*.regex' => 'Nomor gigi harus berupa 2 digit angka.',
            'bridges.*.bridge_type.required' => 'Tipe bridge harus diisi.',
            'bridges.*.bridge_type.in' => 'Tipe bridge harus salah satu dari: fixed, removable, implant.',
            'bridges.*.diagnosis_id.exists' => 'Diagnosis yang dipilih tidak valid.',
            'bridges.*.planned_treatment_id.exists' => 'Perawatan yang dipilih tidak valid.',
            'bridges.*.status.in' => 'Status bridge harus salah satu dari: planned, in_progress, completed.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Custom validation for connected teeth
            if ($this->has('bridges')) {
                foreach ($this->input('bridges') as $index => $bridge) {
                    if (isset($bridge['connected_teeth'])) {
                        foreach ($bridge['connected_teeth'] as $teethIndex => $toothNumber) {
                            if (!$this->isValidToothNumber($toothNumber)) {
                                $validator->errors()->add(
                                    "bridges.{$index}.connected_teeth.{$teethIndex}",
                                    'Nomor gigi tidak valid dalam sistem FDI.'
                                );
                            }
                        }

                        // Check for duplicate teeth in the same bridge
                        $uniqueTeeth = array_unique($bridge['connected_teeth']);
                        if (count($uniqueTeeth) !== count($bridge['connected_teeth'])) {
                            $validator->errors()->add(
                                "bridges.{$index}.connected_teeth",
                                'Tidak boleh ada gigi yang sama dalam satu bridge.'
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
