<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ToothBridge extends Model
{
    use HasFactory;

    protected $fillable = [
        'odontogram_id',
        'bridge_name',
        'connected_teeth',
        'bridge_type',
        'bridge_geometry',
        'diagnosis_status',
        'treatment_status',
        'is_active'
    ];

    protected $casts = [
        'connected_teeth' => 'array',
        'bridge_geometry' => 'array',
        'is_active' => 'boolean',
    ];

    protected $attributes = [
        'is_active' => true,
        'bridge_type' => 'fixed',
        'bridge_name' => 'Bridge',
        'diagnosis_status' => 'needs_diagnosis',
        'treatment_status' => 'no_treatment'
    ];

    // Constants
    const TYPE_FIXED = 'fixed';
    const TYPE_REMOVABLE = 'removable';
    const TYPE_IMPLANT = 'implant';

    const DIAGNOSIS_NEEDS_DIAGNOSIS = 'needs_diagnosis';
    const DIAGNOSIS_NO_DIAGNOSIS = 'no_diagnosis';
    const DIAGNOSIS_HAS_DIAGNOSIS = 'has_diagnosis';

    const TREATMENT_NO_TREATMENT = 'no_treatment';
    const TREATMENT_NEEDS_TREATMENT = 'needs_treatment';
    const TREATMENT_IN_PROGRESS = 'treatment_in_progress';
    const TREATMENT_COMPLETED = 'treatment_completed';
    const TREATMENT_CANCELLED = 'treatment_cancelled';

    const BRIDGE_TYPES = [
        self::TYPE_FIXED => 'Fixed Bridge',
        self::TYPE_REMOVABLE => 'Removable Bridge',
        self::TYPE_IMPLANT => 'Implant Bridge',
    ];

    const DIAGNOSIS_STATUSES = [
        self::DIAGNOSIS_NEEDS_DIAGNOSIS => 'Perlu Keputusan',
        self::DIAGNOSIS_NO_DIAGNOSIS => 'Tanpa Diagnosa',
        self::DIAGNOSIS_HAS_DIAGNOSIS => 'Ada Diagnosa',
    ];

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
        return $this->hasOne(ToothDiagnosesPrimary::class, 'tooth_bridge_id')->where('is_active', true);
    }

    public function secondaryDiagnoses(): HasManyThrough
    {
        return $this->hasManyThrough(
            ToothDiagnosesSecondary::class,
            ToothDiagnosesPrimary::class,
            'tooth_bridge_id',
            'tooth_diagnoses_primary_id',
            'id',
            'id'
        )->where('tooth_diagnoses_secondary.is_active', true);
    }

    public function treatments(): HasMany
    {
        return $this->hasMany(ToothTreatment::class, 'tooth_bridge_id');
    }

    public function activeTreatment(): HasOne
    {
        return $this->hasOne(ToothTreatment::class, 'tooth_bridge_id')->where('is_active', true);
    }

    public function plannedTreatments(): HasMany
    {
        return $this->hasMany(ToothTreatment::class, 'tooth_bridge_id')->where('status', ToothTreatment::STATUS_PLANNED);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('bridge_type', $type);
    }

    public function scopeByConnectedTeeth($query, array $teeth)
    {
        $teethJson = json_encode($teeth);
        return $query->whereRaw("connected_teeth::text = ?", [$teethJson]);
    }

    public function scopeByDiagnosisStatus($query, $status)
    {
        return $query->where('diagnosis_status', $status);
    }

    public function scopeByTreatmentStatus($query, $status)
    {
        return $query->where('treatment_status', $status);
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

    // Accessors
    public function getBridgeTypeNameAttribute(): string
    {
        return self::BRIDGE_TYPES[$this->bridge_type] ?? $this->bridge_type;
    }

    public function getConnectedTeethCountAttribute(): int
    {
        return count($this->connected_teeth ?? []);
    }

    public function getConnectedTeethStringAttribute(): string
    {
        if (empty($this->connected_teeth)) {
            return 'No teeth connected';
        }

        return implode(', ', $this->connected_teeth);
    }

    public function getFromToothAttribute(): ?string
    {
        return $this->connected_teeth[0] ?? null;
    }

    public function getToToothAttribute(): ?string
    {
        return $this->connected_teeth[1] ?? null;
    }

    public function getDiagnosisStatusNameAttribute(): string
    {
        return self::DIAGNOSIS_STATUSES[$this->diagnosis_status] ?? $this->diagnosis_status;
    }

    public function getTreatmentStatusNameAttribute(): string
    {
        return self::TREATMENT_STATUSES[$this->treatment_status] ?? $this->treatment_status;
    }

    // Status calculation based on relationships
    public function getDiagnosisStatusAttribute($value)
    {
        // If we have a stored value, use it
        if ($value) {
            return $value;
        }

        // Otherwise, calculate based on relationships
        if ($this->primaryDiagnosis !== null) {
            return self::DIAGNOSIS_HAS_DIAGNOSIS;
        }

        return self::DIAGNOSIS_NEEDS_DIAGNOSIS;
    }

    public function getTreatmentStatusAttribute($value)
    {
        // If we have a stored value, use it
        if ($value) {
            return $value;
        }

        // Otherwise, calculate based on relationships
        $activeTreatment = $this->activeTreatment;

        if (!$activeTreatment) {
            return self::TREATMENT_NO_TREATMENT;
        }

        return match ($activeTreatment->status) {
            ToothTreatment::STATUS_PLANNED => self::TREATMENT_NEEDS_TREATMENT,
            ToothTreatment::STATUS_IN_PROGRESS => self::TREATMENT_IN_PROGRESS,
            ToothTreatment::STATUS_COMPLETED => self::TREATMENT_COMPLETED,
            ToothTreatment::STATUS_CANCELLED => self::TREATMENT_NO_TREATMENT,
            default => self::TREATMENT_NO_TREATMENT
        };
    }

    // Formatted diagnosis/treatment attributes
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

    // Diagnosis & Treatment Status Methods
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
        return $this->hasDiagnosis() &&
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

    // ✅ Method to set has diagnosis - similar to ToothCondition
    public function setHasDiagnosis(): bool
    {
        return $this->update([
            'diagnosis_status' => self::DIAGNOSIS_HAS_DIAGNOSIS
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

    // Original Bridge Methods (remain the same)
    public function isConnectingTooth(string $toothNumber): bool
    {
        return in_array($toothNumber, $this->connected_teeth ?? []);
    }

    public function addConnectedTooth(string $toothNumber): bool
    {
        $connectedTeeth = $this->connected_teeth ?? [];

        if (!in_array($toothNumber, $connectedTeeth)) {
            $connectedTeeth[] = $toothNumber;
            $this->connected_teeth = $connectedTeeth;
            return $this->save();
        }

        return false;
    }

    public function removeConnectedTooth(string $toothNumber): bool
    {
        $connectedTeeth = $this->connected_teeth ?? [];
        $index = array_search($toothNumber, $connectedTeeth);

        if ($index !== false) {
            unset($connectedTeeth[$index]);
            $this->connected_teeth = array_values($connectedTeeth);
            return $this->save();
        }

        return false;
    }

    public function getTeethRange(): array
    {
        $teeth = $this->connected_teeth ?? [];

        if (empty($teeth)) {
            return [];
        }

        usort($teeth, function ($a, $b) {
            return (int)$a - (int)$b;
        });

        return [
            'start' => $teeth[0],
            'end' => end($teeth),
            'all' => $teeth
        ];
    }

    public function isValid(): bool
    {
        return count($this->connected_teeth ?? []) >= 2;
    }

    public function getDescription(): string
    {
        if (!$this->isValid()) {
            return 'Invalid bridge (less than 2 teeth)';
        }

        $range = $this->getTeethRange();
        return sprintf(
            '%s bridge connecting teeth %s',
            $this->bridge_type_name,
            $this->connected_teeth_string
        );
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function (ToothBridge $bridge) {
            if (empty($bridge->bridge_name)) {
                $bridge->bridge_name = 'Bridge';
            }
        });

        static::saving(function (ToothBridge $bridge) {
            if (count($bridge->connected_teeth ?? []) < 2) {
                throw new \InvalidArgumentException('Bridge must connect at least 2 teeth');
            }

            if (!is_array($bridge->bridge_geometry)) {
                $bridge->bridge_geometry = [];
            }
        });
    }
}
