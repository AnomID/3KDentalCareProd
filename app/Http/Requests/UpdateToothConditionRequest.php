<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateToothConditionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = Auth::user();
        $toothCondition = $this->route('toothCondition');

        // Only doctors can edit tooth conditions
        if ($user->role !== 'doctor' || !$user->doctor) {
            return false;
        }

        // Check if tooth condition belongs to this doctor's odontogram
        if ($toothCondition && $toothCondition->odontogram->doctor_id !== $user->doctor->id) {
            return false;
        }

        // Check if odontogram is not finalized
        if ($toothCondition && $toothCondition->odontogram->is_finalized) {
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
            'surface' => 'nullable|string|in:M,O,D,V,L,B,T,all',
            'condition_code' => [
                'sometimes',
                'string',
                'in:AMF,COF,FIS,NVT,RCT,NON,UNE,PRE,ANO,CARIES,CFR,FMC,POC,RRX,MIS,IPX,FRM_ACR,BRIDGE'
            ],
            'geometry_data' => 'nullable|json',
            'diagnosis_id' => 'nullable|exists:dental_diagnoses,id',
            'icd_10_code' => 'nullable|string|max:10',
            'external_cause_code' => 'nullable|string|max:10',
            'diagnosis_notes' => 'nullable|string|max:65535',
            'external_cause_notes' => 'nullable|string|max:65535',
            'planned_treatment_id' => 'nullable|exists:dental_treatments,id',
            'treatment_plan_notes' => 'nullable|string|max:65535',
            'planned_date' => 'nullable|date|after_or_equal:today',
            'priority' => 'nullable|string|in:low,normal,high,urgent',
            'treatment_cost' => 'nullable|numeric|min:0|max:999999999',
            'treatment_status' => 'nullable|string|in:not_started,in_progress,completed,cancelled',
            'treatment_date' => 'nullable|date|before_or_equal:today',
            'treatment_notes' => 'nullable|string|max:65535',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'surface.in' => 'Permukaan gigi harus salah satu dari: M, O, D, V, L, B, T, all.',
            'condition_code.in' => 'Kode kondisi tidak valid.',
            'diagnosis_id.exists' => 'Diagnosis yang dipilih tidak valid.',
            'planned_treatment_id.exists' => 'Perawatan yang dipilih tidak valid.',
            'planned_date.after_or_equal' => 'Tanggal rencana tidak boleh kurang dari hari ini.',
            'priority.in' => 'Prioritas harus salah satu dari: low, normal, high, urgent.',
            'treatment_cost.numeric' => 'Biaya perawatan harus berupa angka.',
            'treatment_cost.min' => 'Biaya perawatan tidak boleh kurang dari 0.',
            'treatment_cost.max' => 'Biaya perawatan terlalu besar.',
            'treatment_status.in' => 'Status perawatan harus salah satu dari: not_started, in_progress, completed, cancelled.',
            'treatment_date.before_or_equal' => 'Tanggal perawatan tidak boleh lebih dari hari ini.',
            'diagnosis_notes.max' => 'Catatan diagnosis tidak boleh lebih dari 65535 karakter.',
            'external_cause_notes.max' => 'Catatan external cause tidak boleh lebih dari 65535 karakter.',
            'treatment_plan_notes.max' => 'Catatan rencana perawatan tidak boleh lebih dari 65535 karakter.',
            'treatment_notes.max' => 'Catatan perawatan tidak boleh lebih dari 65535 karakter.',
        ];
    }
}
