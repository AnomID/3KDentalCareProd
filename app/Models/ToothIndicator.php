<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough; // ✅ TAMBAHKAN INI
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Log;

class ToothIndicator extends Model
{
    use HasFactory;

    protected $fillable = [
        'odontogram_id',
        'tooth_number',
        'indicator_type',
        'geometry_data',
        'diagnosis_status',
        'treatment_status',
        'is_active',
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

    // Constants remain the same
    const INDICATOR_TYPES = [
        'ARROW_TOP_LEFT',
        'ARROW_TOP_RIGHT',
        'ARROW_TOP_TURN_LEFT',
        'ARROW_TOP_TURN_RIGHT',
        'ARROW_BOTTOM_LEFT',
        'ARROW_BOTTOM_RIGHT',
        'ARROW_BOTTOM_TURN_LEFT',
        'ARROW_BOTTOM_TURN_RIGHT',
    ];

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
        return $this->hasOne(ToothDiagnosesPrimary::class, 'tooth_indicator_id')->where('is_active', true);
    }

    // ✅ FIXED: Return type yang benar
    public function secondaryDiagnoses(): HasManyThrough
    {
        return $this->hasManyThrough(
            ToothDiagnosesSecondary::class,
            ToothDiagnosesPrimary::class,
            'tooth_indicator_id',
            'tooth_diagnoses_primary_id',
            'id',
            'id'
        )->where('tooth_diagnoses_secondary.is_active', true);
    }

    public function treatments(): HasMany
    {
        return $this->hasMany(ToothTreatment::class, 'tooth_indicator_id');
    }

    public function activeTreatment(): HasOne
    {
        return $this->hasOne(ToothTreatment::class, 'tooth_indicator_id')->where('is_active', true);
    }

    public function plannedTreatments(): HasMany
    {
        return $this->hasMany(ToothTreatment::class, 'tooth_indicator_id')->where('status', ToothTreatment::STATUS_PLANNED);
    }

    // Scopes (remain the same)
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForTooth($query, $toothNumber)
    {
        return $query->where('tooth_number', $toothNumber);
    }

    public function scopeOfType($query, $indicatorType)
    {
        return $query->where('indicator_type', $indicatorType);
    }

    public function scopeByDiagnosisStatus($query, $status)
    {
        return $query->where('diagnosis_status', $status);
    }

    public function scopeNeedsDiagnosis($query)
    {
        return $query->where('diagnosis_status', self::DIAGNOSIS_NEEDS_DIAGNOSIS);
    }

    public function scopeHasDiagnosis($query)
    {
        return $query->where('diagnosis_status', self::DIAGNOSIS_HAS_DIAGNOSIS);
    }

    public function scopeNoDiagnosis($query)
    {
        return $query->where('diagnosis_status', self::DIAGNOSIS_NO_DIAGNOSIS);
    }

    public function scopeByTreatmentStatus($query, $status)
    {
        return $query->where('treatment_status', $status);
    }

    public function scopeNeedsTreatment($query)
    {
        return $query->where('treatment_status', self::TREATMENT_NEEDS_TREATMENT);
    }

    public function scopeTreatmentInProgress($query)
    {
        return $query->where('treatment_status', self::TREATMENT_IN_PROGRESS);
    }

    public function scopeTreatmentCompleted($query)
    {
        return $query->where('treatment_status', self::TREATMENT_COMPLETED);
    }

    // Accessors (remain mostly the same)
    public function getIndicatorTypeDescriptionAttribute()
    {
        $descriptions = [
            'ARROW_TOP_LEFT' => 'Panah Atas Kiri',
            'ARROW_TOP_RIGHT' => 'Panah Atas Kanan',
            'ARROW_TOP_TURN_LEFT' => 'Panah Atas Belok Kiri',
            'ARROW_TOP_TURN_RIGHT' => 'Panah Atas Belok Kanan',
            'ARROW_BOTTOM_LEFT' => 'Panah Bawah Kiri',
            'ARROW_BOTTOM_RIGHT' => 'Panah Bawah Kanan',
            'ARROW_BOTTOM_TURN_LEFT' => 'Panah Bawah Belok Kiri',
            'ARROW_BOTTOM_TURN_RIGHT' => 'Panah Bawah Belok Kanan',
        ];

        return $descriptions[$this->indicator_type] ?? $this->indicator_type;
    }

    public function getDiagnosisStatusNameAttribute(): string
    {
        return self::DIAGNOSIS_STATUSES[$this->diagnosis_status] ?? $this->diagnosis_status;
    }

    public function getTreatmentStatusNameAttribute(): string
    {
        return self::TREATMENT_STATUSES[$this->treatment_status] ?? $this->treatment_status;
    }

    // Formatted attributes
    public function getFormattedDiagnosisAttribute(): string
    {
        $primaryDiagnosis = $this->primaryDiagnosis;

        if (!$primaryDiagnosis) {
            return match ($this->diagnosis_status) {
                self::DIAGNOSIS_NO_DIAGNOSIS => 'Tanpa Diagnosa',
                self::DIAGNOSIS_NEEDS_DIAGNOSIS => 'Perlu Keputusan',
                default => 'No diagnosis'
            };
        }

        $formatted = $primaryDiagnosis->formatted_diagnosis;

        // Add secondary diagnoses if any
        $secondaryDiagnoses = $this->secondaryDiagnoses;
        if ($secondaryDiagnoses->count() > 0) {
            $formatted .= ' + ' . $secondaryDiagnoses->count() . ' secondary diagnosis(es)';
        }

        return $formatted;
    }

    public function getFormattedTreatmentAttribute(): string
    {
        $treatment = $this->activeTreatment;

        if (!$treatment) {
            return match ($this->treatment_status) {
                self::TREATMENT_NO_TREATMENT => 'Tanpa Treatment',
                self::TREATMENT_NEEDS_TREATMENT => 'Perlu Treatment',
                default => 'No treatment'
            };
        }

        return $treatment->formatted_treatment;
    }

    // Other methods (remain mostly the same but updated)
    public static function isValidIndicatorType($type)
    {
        return in_array($type, self::INDICATOR_TYPES);
    }

    public function getPosAttribute()
    {
        return $this->tooth_number;
    }

    public function getCodeAttribute()
    {
        $modeMap = [
            'ARROW_TOP_LEFT' => 19,
            'ARROW_TOP_RIGHT' => 20,
            'ARROW_TOP_TURN_LEFT' => 21,
            'ARROW_TOP_TURN_RIGHT' => 22,
            'ARROW_BOTTOM_LEFT' => 23,
            'ARROW_BOTTOM_RIGHT' => 24,
            'ARROW_BOTTOM_TURN_LEFT' => 25,
            'ARROW_BOTTOM_TURN_RIGHT' => 26,
        ];

        return $modeMap[$this->indicator_type] ?? 19;
    }

    // Methods for diagnosis and treatment management
    public function hasDiagnosis(): bool
    {
        return $this->diagnosis_status === self::DIAGNOSIS_HAS_DIAGNOSIS && $this->primaryDiagnosis !== null;
    }

    public function hasTreatment(): bool
    {
        return $this->treatment_status !== self::TREATMENT_NO_TREATMENT && $this->activeTreatment !== null;
    }

    public function canAddDiagnosis(): bool
    {
        return in_array($this->diagnosis_status, [
            self::DIAGNOSIS_NEEDS_DIAGNOSIS,
            self::DIAGNOSIS_NO_DIAGNOSIS
        ]);
    }

    public function canAddTreatment(): bool
    {
        return $this->diagnosis_status === self::DIAGNOSIS_HAS_DIAGNOSIS &&
            in_array($this->treatment_status, [
                self::TREATMENT_NO_TREATMENT,
                self::TREATMENT_NEEDS_TREATMENT
            ]);
    }

    public function canSetNoDiagnosis(): bool
    {
        return in_array($this->diagnosis_status, [
            self::DIAGNOSIS_NEEDS_DIAGNOSIS,
            self::DIAGNOSIS_HAS_DIAGNOSIS
        ]);
    }

    public function setNoDiagnosis(): bool
    {
        if (!$this->canSetNoDiagnosis()) {
            return false;
        }

        // Delete existing primary diagnosis (which will cascade to secondary)
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

    public function setHasDiagnosis(): bool
    {
        return $this->update([
            'diagnosis_status' => self::DIAGNOSIS_HAS_DIAGNOSIS
        ]);
    }

    protected static function boot()
    {
        parent::boot();

        static::created(function (ToothIndicator $indicator) {
            Log::info('ToothIndicator created', [
                'id' => $indicator->id,
                'tooth_number' => $indicator->tooth_number,
                'indicator_type' => $indicator->indicator_type,
                'diagnosis_status' => $indicator->diagnosis_status,
                'treatment_status' => $indicator->treatment_status,
            ]);
        });
    }
}
