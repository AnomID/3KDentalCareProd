<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Appointment;
use App\Models\User;
use App\Models\ToothCondition;
use App\Models\ToothBridge;
use App\Models\ToothIndicator;
use App\Models\OdontogramAttachment;
use App\Models\OdontogramRevision;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Odontogram extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'appointment_id',
        'doctor_id',
        'examination_date',
        'general_notes',
        'canvas_data',
        'occlusion',
        'torus_palatinus',
        'torus_mandibularis',
        'palatum',
        'diastema',
        'gigi_anomali',
        'others',
        'd_value',
        'm_value',
        'f_value',
        'photo_count',
        'photo_type',
        'xray_count',
        'xray_type',
        'is_finalized',
        'finalized_at',
        'finalized_by',
        'is_active'
    ];

    protected $casts = [
        'examination_date' => 'date',
        'canvas_data' => 'array',
        'xray_type' => 'array',
        'finalized_at' => 'datetime',
        'is_finalized' => 'boolean',
        'is_active' => 'boolean',
    ];

    protected $attributes = [
        'is_active' => true,
        'occlusion' => 'normal',
        'torus_palatinus' => 'none',
        'torus_mandibularis' => 'none',
        'palatum' => 'medium',
        'd_value' => 0,
        'm_value' => 0,
        'f_value' => 0,
    ];

    // Relationships
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function finalizedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'finalized_by');
    }

    public function toothConditions(): HasMany
    {
        return $this->hasMany(ToothCondition::class);
    }

    public function toothBridges(): HasMany
    {
        return $this->hasMany(ToothBridge::class);
    }

    public function toothIndicators(): HasMany
    {
        return $this->hasMany(ToothIndicator::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(OdontogramAttachment::class);
    }

    public function revisions(): HasMany
    {
        return $this->hasMany(OdontogramRevision::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFinalized($query)
    {
        return $query->where('is_finalized', true);
    }

    public function scopeNotFinalized($query)
    {
        return $query->where('is_finalized', false);
    }

    public function scopeByPatient($query, $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    public function scopeByDoctor($query, $doctorId)
    {
        return $query->where('doctor_id', $doctorId);
    }

    // Methods
    public function calculateDmft()
    {
        $d_value = 0; // Decayed
        $m_value = 0; // Missing
        $f_value = 0; // Filled

        $conditions = $this->toothConditions;

        foreach ($conditions as $condition) {
            switch ($condition->condition_code) {
                case 'CARIES':
                    $d_value++;
                    break;
                case 'MIS': // Missing
                    $m_value++;
                    break;
                case 'AMF': // Amalgam filling
                case 'COF': // Composite filling
                case 'FIS': // Fissure sealant
                    $f_value++;
                    break;
                case 'FMC': // Full metal crown
                case 'POC': // Porcelain crown
                case 'IPX': // Implant
                    $f_value++; // Count as filled/restored
                    break;
                case 'RCT': // Root canal treatment
                    $f_value++; // Count as treated
                    break;
            }
        }

        $this->update([
            'd_value' => $d_value,
            'm_value' => $m_value,
            'f_value' => $f_value,
        ]);

        return [
            'd_value' => $d_value,
            'm_value' => $m_value,
            'f_value' => $f_value,
            'dmf_total' => $d_value + $m_value + $f_value
        ];
    }

    public function finalize($userId)
    {
        $this->update([
            'is_finalized' => true,
            'finalized_at' => now(),
            'finalized_by' => $userId,
        ]);

        return $this;
    }

    public function unfinalize()
    {
        $this->update([
            'is_finalized' => false,
            'finalized_at' => null,
            'finalized_by' => null,
        ]);

        return $this;
    }

    public function getDmftSummary()
    {
        return [
            'decayed' => $this->d_value ?? 0,
            'missing' => $this->m_value ?? 0,
            'filled' => $this->f_value ?? 0,
            'total' => ($this->d_value ?? 0) + ($this->m_value ?? 0) + ($this->f_value ?? 0)
        ];
    }

    // FIXED: Updated getStatistics method to work with new schema
    public function getStatistics()
    {
        return [
            'tooth_conditions_count' => $this->toothConditions()->count(),
            'bridges_count' => $this->toothBridges()->count(),
            'indicators_count' => $this->toothIndicators()->count(),

            // Updated to use new diagnosis system
            'conditions_with_diagnosis' => $this->toothConditions()
                ->where('diagnosis_status', 'has_diagnosis')
                ->count(),

            'conditions_needing_diagnosis' => $this->toothConditions()
                ->where('diagnosis_status', 'needs_diagnosis')
                ->count(),

            'conditions_no_diagnosis' => $this->toothConditions()
                ->where('diagnosis_status', 'no_diagnosis')
                ->count(),

            'conditions_with_treatment' => $this->toothConditions()
                ->whereIn('treatment_status', ['treatment_in_progress', 'treatment_completed'])
                ->count(),

            'conditions_treatment_completed' => $this->toothConditions()
                ->where('treatment_status', 'treatment_completed')
                ->count(),

            'conditions_treatment_in_progress' => $this->toothConditions()
                ->where('treatment_status', 'treatment_in_progress')
                ->count(),

            'dmft' => $this->getDmftSummary(),
            'finalization_status' => [
                'is_finalized' => $this->is_finalized,
                'finalized_at' => $this->finalized_at,
                'finalized_by' => $this->finalized_by,
            ]
        ];
    }

    public function canBeEdited()
    {
        return !$this->is_finalized && $this->is_active;
    }

    public function getConditionsByTooth()
    {
        return $this->toothConditions()
            ->with(['primaryDiagnosis.icd10Diagnosis', 'treatments.procedures.icd9cmCode'])
            ->get()
            ->groupBy('tooth_number');
    }


    public function exportData()
    {
        return [
            'odontogram_info' => [
                'id' => $this->id,
                'patient_id' => $this->patient_id,
                'appointment_id' => $this->appointment_id,
                'doctor_id' => $this->doctor_id,
                'examination_date' => $this->examination_date,
                'general_notes' => $this->general_notes,
                'is_finalized' => $this->is_finalized,
                'finalized_at' => $this->finalized_at,
            ],
            'metadata' => [
                'occlusion' => $this->occlusion,
                'torus_palatinus' => $this->torus_palatinus,
                'torus_mandibularis' => $this->torus_mandibularis,
                'palatum' => $this->palatum,
                'diastema' => $this->diastema,
                'gigi_anomali' => $this->gigi_anomali,
                'others' => $this->others,
            ],
            'dmft' => $this->getDmftSummary(),
            'statistics' => $this->getStatistics(),
            'conditions' => $this->toothConditions()
                ->with(['primaryDiagnosis.icd10Diagnosis', 'treatments.procedures.icd9cmCode'])
                ->get()
                ->toArray(),
            'bridges' => $this->toothBridges()
                ->get()
                ->toArray(),
            'indicators' => $this->toothIndicators()->get()->toArray(),
        ];
    }
}
