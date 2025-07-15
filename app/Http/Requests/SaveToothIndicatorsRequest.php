<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class SaveToothIndicatorsRequest extends FormRequest
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
            'indicators' => 'required|array|min:1',
            'indicators.*.tooth_number' => 'required|string|max:5|regex:/^[0-9]{2}$/',
            'indicators.*.indicator_type' => [
                'required',
                'string',
                'in:ARROW_TOP_LEFT,ARROW_TOP_RIGHT,ARROW_TOP_TURN_LEFT,ARROW_TOP_TURN_RIGHT,ARROW_BOTTOM_LEFT,ARROW_BOTTOM_RIGHT,ARROW_BOTTOM_TURN_LEFT,ARROW_BOTTOM_TURN_RIGHT'
            ],
            'indicators.*.geometry_data' => 'nullable|json',
            'indicators.*.notes' => 'nullable|string|max:65535',
            // Backward compatibility
            'indicators.*.tooth' => 'nullable|string|max:5|regex:/^[0-9]{2}$/',
            'indicators.*.type' => 'nullable|string',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'indicators.required' => 'Data indikator harus disediakan.',
            'indicators.array' => 'Data indikator harus berupa array.',
            'indicators.min' => 'Minimal harus ada 1 indikator.',
            'indicators.*.tooth_number.required' => 'Nomor gigi harus diisi.',
            'indicators.*.tooth_number.regex' => 'Nomor gigi harus berupa 2 digit angka.',
            'indicators.*.indicator_type.required' => 'Tipe indikator harus diisi.',
            'indicators.*.indicator_type.in' => 'Tipe indikator tidak valid.',
            'indicators.*.notes.max' => 'Catatan tidak boleh lebih dari 65535 karakter.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Custom validation: Check tooth number validity
            if ($this->has('indicators')) {
                foreach ($this->input('indicators') as $index => $indicator) {
                    $toothNumber = $indicator['tooth_number'] ?? $indicator['tooth'] ?? null;

                    if ($toothNumber && !$this->isValidToothNumber($toothNumber)) {
                        $validator->errors()->add(
                            "indicators.{$index}.tooth_number",
                            'Nomor gigi tidak valid dalam sistem FDI.'
                        );
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
