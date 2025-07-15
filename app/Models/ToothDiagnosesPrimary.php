<?php
// App/Models/ToothDiagnosesPrimary.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ToothDiagnosesPrimary extends Model
{
    use HasFactory;

    protected $table = 'tooth_diagnoses_primary';

    protected $fillable = [
        'tooth_condition_id',
        'tooth_bridge_id',
        'tooth_indicator_id',
        'icd_10_codes_diagnoses_id',
        'diagnosis_notes',
        'icd_10_codes_external_cause_id',
        'external_cause_notes',
        'diagnosed_by',
        'diagnosed_at',
        'is_active'
    ];

    protected $casts = [
        'diagnosed_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    protected $attributes = [
        'is_active' => true,
    ];

    // Relationships
    public function toothCondition(): BelongsTo
    {
        return $this->belongsTo(ToothCondition::class);
    }

    public function toothBridge(): BelongsTo
    {
        return $this->belongsTo(ToothBridge::class);
    }

    public function toothIndicator(): BelongsTo
    {
        return $this->belongsTo(ToothIndicator::class);
    }

    public function icd10Diagnosis(): BelongsTo
    {
        return $this->belongsTo(Icd10CodesDiagnoses::class, 'icd_10_codes_diagnoses_id');
    }

    public function icd10ExternalCause(): BelongsTo
    {
        return $this->belongsTo(Icd10CodesExternalCause::class, 'icd_10_codes_external_cause_id');
    }

    public function diagnosedBy()
    {
        return $this->belongsTo(User::class, 'diagnosed_by');
    }

    public function secondaryDiagnoses(): HasMany
    {
        return $this->hasMany(ToothDiagnosesSecondary::class, 'tooth_diagnoses_primary_id');
    }

    // Get parent (condition, bridge, or indicator)
    public function getParentAttribute()
    {
        if ($this->tooth_condition_id) {
            return $this->toothCondition;
        } elseif ($this->tooth_bridge_id) {
            return $this->toothBridge;
        } elseif ($this->tooth_indicator_id) {
            return $this->toothIndicator;
        }
        return null;
    }

    public function getParentTypeAttribute()
    {
        if ($this->tooth_condition_id) {
            return 'condition';
        } elseif ($this->tooth_bridge_id) {
            return 'bridge';
        } elseif ($this->tooth_indicator_id) {
            return 'indicator';
        }
        return null;
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForCondition($query, $conditionId)
    {
        return $query->where('tooth_condition_id', $conditionId);
    }

    public function scopeForBridge($query, $bridgeId)
    {
        return $query->where('tooth_bridge_id', $bridgeId);
    }

    public function scopeForIndicator($query, $indicatorId)
    {
        return $query->where('tooth_indicator_id', $indicatorId);
    }

    // Methods
    public function getFormattedDiagnosisAttribute()
    {
        $diagnosis = $this->icd10Diagnosis;
        if (!$diagnosis) {
            return 'No diagnosis';
        }

        $formatted = $diagnosis->code . ' - ' . $diagnosis->description;

        if ($this->diagnosis_notes) {
            $formatted .= ' (Notes: ' . $this->diagnosis_notes . ')';
        }

        return $formatted;
    }

    public function getFormattedExternalCauseAttribute()
    {
        $externalCause = $this->icd10ExternalCause;
        if (!$externalCause) {
            return null;
        }

        $formatted = $externalCause->code . ' - ' . $externalCause->description;

        if ($this->external_cause_notes) {
            $formatted .= ' (Notes: ' . $this->external_cause_notes . ')';
        }

        return $formatted;
    }

    public function hasExternalCause()
    {
        return !is_null($this->icd_10_codes_external_cause_id);
    }
}
