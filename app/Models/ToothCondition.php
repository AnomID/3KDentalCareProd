<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough; // ✅ TAMBAHKAN INI
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Log;

class ToothCondition extends Model
{
    use HasFactory;

    protected $fillable = [
        'odontogram_id',
        'tooth_number',
        'surface',
        'condition_code',
        'geometry_data',
        'diagnosis_status',
        'treatment_status',
        'is_active'
    ];

    protected $casts = [
        'geometry_data' => 'array',
        'is_active' => 'boolean',
    ];

    protected $attributes = [
        'is_active' => true,
        'diagnosis_status' => 'needs_diagnosis',
        'treatment_status' => 'no_treatment'
    ];

    // Constants
    const DIAGNOSIS_NEEDS_DIAGNOSIS = 'needs_diagnosis';
    const DIAGNOSIS_NO_DIAGNOSIS = 'no_diagnosis';
    const DIAGNOSIS_HAS_DIAGNOSIS = 'has_diagnosis';

    const DIAGNOSIS_STATUSES = [
        self::DIAGNOSIS_NEEDS_DIAGNOSIS => 'Perlu Keputusan',
        self::DIAGNOSIS_NO_DIAGNOSIS => 'Tanpa Diagnosa',
        self::DIAGNOSIS_HAS_DIAGNOSIS => 'Ada Diagnosa',
    ];

    const TREATMENT_NO_TREATMENT = 'no_treatment';
    const TREATMENT_NEEDS_TREATMENT = 'needs_treatment';
    const TREATMENT_IN_PROGRESS = 'treatment_in_progress';
    const TREATMENT_COMPLETED = 'treatment_completed';
    const TREATMENT_CANCELLED = 'treatment_cancelled';

    const TREATMENT_STATUSES = [
        self::TREATMENT_NO_TREATMENT => 'Tanpa Treatment',
        self::TREATMENT_NEEDS_TREATMENT => 'Perlu Treatment',
        self::TREATMENT_IN_PROGRESS => 'Treatment Berlangsung',
        self::TREATMENT_COMPLETED => 'Treatment Selesai',
        self::TREATMENT_CANCELLED => 'Treatment Dibatalkan',
    ];

    // Relationships
    public function odontogram(): BelongsTo
    {
        return $this->belongsTo(Odontogram::class);
    }

    public function primaryDiagnosis(): HasOne
    {
        return $this->hasOne(ToothDiagnosesPrimary::class, 'tooth_condition_id')->where('is_active', true);
    }

    // ✅ FIXED: Return type yang benar
    public function secondaryDiagnoses(): HasManyThrough
    {
        return $this->hasManyThrough(
            ToothDiagnosesSecondary::class,
            ToothDiagnosesPrimary::class,
            'tooth_condition_id',
            'tooth_diagnoses_primary_id',
            'id',
            'id'
        )->where('tooth_diagnoses_secondary.is_active', true);
    }

    public function treatments(): HasMany
    {
        return $this->hasMany(ToothTreatment::class, 'tooth_condition_id');
    }

    public function activeTreatment(): HasOne
    {
        return $this->hasOne(ToothTreatment::class, 'tooth_condition_id')->where('is_active', true);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByTooth($query, $toothNumber)
    {
        return $query->where('tooth_number', $toothNumber);
    }

    public function scopeByDiagnosisStatus($query, $status)
    {
        return $query->where('diagnosis_status', $status);
    }

    public function scopeByTreatmentStatus($query, $status)
    {
        return $query->where('treatment_status', $status);
    }

    // Methods
    public function hasDiagnosis(): bool
    {
        return $this->diagnosis_status === self::DIAGNOSIS_HAS_DIAGNOSIS && $this->primaryDiagnosis !== null;
    }

    public function hasTreatment(): bool
    {
        return $this->treatment_status !== self::TREATMENT_NO_TREATMENT && $this->activeTreatment !== null;
    }

    public function setHasDiagnosis(): bool
    {
        return $this->update([
            'diagnosis_status' => self::DIAGNOSIS_HAS_DIAGNOSIS
        ]);
    }

    public function setNoDiagnosis(): bool
    {
        // Delete existing primary diagnosis (will cascade to secondary)
        if ($this->primaryDiagnosis) {
            $this->primaryDiagnosis->delete();
        }

        // Cancel any treatment
        $this->treatments()->update(['status' => ToothTreatment::STATUS_CANCELLED]);

        return $this->update([
            'diagnosis_status' => self::DIAGNOSIS_NO_DIAGNOSIS,
            'treatment_status' => self::TREATMENT_NO_TREATMENT
        ]);
    }

    // Accessors
    public function getConditionNameAttribute(): string
    {
        return match ($this->condition_code) {
            'AMF' => 'Tambalan Amalgam',
            'COF' => 'Tambalan Composite',
            'FIS' => 'Pit & Fissure Sealant',
            'NVT' => 'Gigi Non Vital',
            'RCT' => 'Perawatan Saluran Akar',
            'NON' => 'Gigi Tidak Ada',
            'UNE' => 'Un-Erupted',
            'PRE' => 'Partial-Erupt',
            'ANO' => 'Anomali',
            'CARIES' => 'Karies',
            'CFR' => 'Fraktur',
            'FMC' => 'Full Metal Crown',
            'POC' => 'Porcelain Crown',
            'RRX' => 'Sisa Akar',
            'MIS' => 'Gigi Hilang',
            'IPX' => 'Implant + Crown',
            'FRM_ACR' => 'Gigi Tiruan',
            'BRIDGE' => 'Bridge',
            default => $this->condition_code
        };
    }


    public function getDiagnosisStatusNameAttribute(): string
    {
        return self::DIAGNOSIS_STATUSES[$this->diagnosis_status] ?? $this->diagnosis_status;
    }

    public function getTreatmentStatusNameAttribute(): string
    {
        return self::TREATMENT_STATUSES[$this->treatment_status] ?? $this->treatment_status;
    }
}
