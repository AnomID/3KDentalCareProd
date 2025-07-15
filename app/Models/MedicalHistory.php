<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedicalHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'blood_type',
        'blood_pressure',
        'blood_pressure_status',
        'has_heart_disease',
        'heart_disease_note',
        'has_diabetes',
        'diabetes_note',
        'has_hemophilia',
        'hemophilia_note',
        'has_hepatitis',
        'hepatitis_note',
        'has_gastritis',
        'gastritis_note',
        'has_other_disease',
        'other_disease_note',
        'has_drug_allergy',
        'drug_allergy_note',
        'has_food_allergy',
        'food_allergy_note',
        'updated_by_doctor_id'
    ];

    protected $casts = [
        'has_heart_disease' => 'boolean',
        'has_diabetes' => 'boolean',
        'has_hemophilia' => 'boolean',
        'has_hepatitis' => 'boolean',
        'has_gastritis' => 'boolean',
        'has_other_disease' => 'boolean',
        'has_drug_allergy' => 'boolean',
        'has_food_allergy' => 'boolean',
    ];

    const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const BP_STATUS_NORMAL = 'normal';
    const BP_STATUS_HYPERTENSION = 'hypertension';
    const BP_STATUS_HYPOTENSION = 'hypotension';

    /**
     * Get the patient this history belongs to.
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * Get the doctor who updated this history.
     */
    public function updatedByDoctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'updated_by_doctor_id');
    }

    /**
     * Get formatted blood pressure status
     */
    public function getFormattedBloodPressureStatusAttribute()
    {
        $statusMap = [
            self::BP_STATUS_NORMAL => 'Normal',
            self::BP_STATUS_HYPERTENSION => 'Hypertensi',
            self::BP_STATUS_HYPOTENSION => 'Hypotensi',
        ];

        return $statusMap[$this->blood_pressure_status] ?? 'Tidak Diketahui';
    }
}
