<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Log;

class ToothTreatmentProcedure extends Model
{
    use HasFactory;

    protected $table = 'tooth_treatment_procedures';

    protected $fillable = [
        'tooth_treatment_id',
        'icd_9cm_codes_id'
    ];

    // Disable timestamps if not needed
    public $timestamps = true;

    // Relationships
    public function toothTreatment(): BelongsTo
    {
        return $this->belongsTo(ToothTreatment::class);
    }

    public function icd9cmCode(): BelongsTo
    {
        return $this->belongsTo(Icd9cmCodes::class, 'icd_9cm_codes_id');
    }

    // Scopes
    public function scopeForTreatment($query, $treatmentId)
    {
        return $query->where('tooth_treatment_id', $treatmentId);
    }

    public function scopeByProcedureCode($query, $procedureCodeId)
    {
        return $query->where('icd_9cm_codes_id', $procedureCodeId);
    }

    // Methods
    public function getFormattedProcedureAttribute(): string
    {
        $icd9cm = $this->icd9cmCode;
        if (!$icd9cm) {
            return 'Unknown procedure';
        }

        return $icd9cm->code . ' - ' . $icd9cm->description;
    }

    protected static function boot()
    {
        parent::boot();

        static::created(function (ToothTreatmentProcedure $procedure) {
            // ✅ FIXED: Use Log facade properly
            Log::info('Treatment procedure created', [
                'id' => $procedure->id,
                'treatment_id' => $procedure->tooth_treatment_id,
                'icd_9cm_codes_id' => $procedure->icd_9cm_codes_id,
            ]);
        });

        static::deleted(function (ToothTreatmentProcedure $procedure) {
            // ✅ FIXED: Use Log facade properly
            Log::info('Treatment procedure deleted', [
                'id' => $procedure->id,
                'treatment_id' => $procedure->tooth_treatment_id,
                'icd_9cm_codes_id' => $procedure->icd_9cm_codes_id,
            ]);
        });
    }
}
