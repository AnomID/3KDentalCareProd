<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class ToothDiagnosesSecondary extends Model
{
    use HasFactory;

    protected $table = 'tooth_diagnoses_secondary';

    protected $fillable = [
        'tooth_diagnoses_primary_id',
        'icd_10_codes_diagnoses_id',
        'diagnosis_notes',
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
    public function primaryDiagnosis(): BelongsTo
    {
        return $this->belongsTo(ToothDiagnosesPrimary::class, 'tooth_diagnoses_primary_id');
    }

    public function icd10Diagnosis(): BelongsTo
    {
        return $this->belongsTo(Icd10CodesDiagnoses::class, 'icd_10_codes_diagnoses_id');
    }

    // ✅ Add User relationship
    public function diagnosedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'diagnosed_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForPrimary($query, $primaryId)
    {
        return $query->where('tooth_diagnoses_primary_id', $primaryId);
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

    // ✅ Add boot method to auto-set diagnosed_at and diagnosed_by
    protected static function boot()
    {
        parent::boot();

        static::creating(function (ToothDiagnosesSecondary $diagnosis) {
            if (empty($diagnosis->diagnosed_at)) {
                $diagnosis->diagnosed_at = now();
            }

            // ✅ FIXED: Use Auth facade properly
            if (empty($diagnosis->diagnosed_by) && Auth::check()) {
                $diagnosis->diagnosed_by = Auth::id();
            }
        });

        static::created(function (ToothDiagnosesSecondary $diagnosis) {
            Log::info('Secondary tooth diagnosis created', [
                'id' => $diagnosis->id,
                'primary_diagnosis_id' => $diagnosis->tooth_diagnoses_primary_id,
                'icd_10_codes_diagnoses_id' => $diagnosis->icd_10_codes_diagnoses_id,
                'diagnosed_by' => $diagnosis->diagnosed_by,
            ]);
        });
    }
}
