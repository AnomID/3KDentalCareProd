<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateOdontogramRequest extends FormRequest
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
            'general_notes' => 'nullable|string|max:65535',
            'occlusion' => 'nullable|string|in:normal,cross,steep',
            'torus_palatinus' => 'nullable|string|in:none,small,medium,large,multiple',
            'torus_mandibularis' => 'nullable|string|in:none,left,right,both',
            'palatum' => 'nullable|string|in:deep,medium,shallow',
            'diastema' => 'nullable|string|max:65535',
            'gigi_anomali' => 'nullable|string|max:65535',
            'others' => 'nullable|string|max:65535',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'occlusion.in' => 'Occlusion harus salah satu dari: normal, cross, steep.',
            'torus_palatinus.in' => 'Torus palatinus harus salah satu dari: none, small, medium, large, multiple.',
            'torus_mandibularis.in' => 'Torus mandibularis harus salah satu dari: none, left, right, both.',
            'palatum.in' => 'Palatum harus salah satu dari: deep, medium, shallow.',
            'general_notes.max' => 'Catatan umum tidak boleh lebih dari 65535 karakter.',
            'diastema.max' => 'Diastema tidak boleh lebih dari 65535 karakter.',
            'gigi_anomali.max' => 'Gigi anomali tidak boleh lebih dari 65535 karakter.',
            'others.max' => 'Catatan lainnya tidak boleh lebih dari 65535 karakter.',
        ];
    }
}
