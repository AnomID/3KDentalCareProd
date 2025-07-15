<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class ToothTreatment extends Model
{
    use HasFactory;

    protected $fillable = [
        'tooth_condition_id',
        'tooth_bridge_id',
        'tooth_indicator_id',
        'notes',
        'status',
        'planned_date',
        'started_date',
        'completed_date',
        'created_by',
        'completed_by',
        'is_active'
    ];

    protected $casts = [
        'planned_date' => 'date',
        'started_date' => 'date',
        'completed_date' => 'date',
        'is_active' => 'boolean',
    ];

    protected $attributes = [
        'is_active' => true,
        'status' => 'planned'
    ];

    // Status constants
    const STATUS_PLANNED = 'planned';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    const STATUSES = [
        self::STATUS_PLANNED => 'Direncanakan',
        self::STATUS_IN_PROGRESS => 'Sedang Berlangsung',
        self::STATUS_COMPLETED => 'Selesai',
        self::STATUS_CANCELLED => 'Dibatalkan',
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

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    // Many-to-many relationship with ICD-9-CM codes
    public function procedures(): HasMany
    {
        return $this->hasMany(ToothTreatmentProcedure::class);
    }

    public function icd9cmCodes(): BelongsToMany
    {
        return $this->belongsToMany(Icd9cmCodes::class, 'tooth_treatment_procedures', 'tooth_treatment_id', 'icd_9cm_codes_id');
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

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopePlanned($query)
    {
        return $query->where('status', self::STATUS_PLANNED);
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', self::STATUS_IN_PROGRESS);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', self::STATUS_CANCELLED);
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

    // Accessors
    public function getStatusNameAttribute(): string
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }

    // Formatted treatment attribute
    public function getFormattedTreatmentAttribute(): string
    {
        $procedures = $this->icd9cmCodes;

        if ($procedures->isEmpty()) {
            return 'No procedures defined';
        }

        $procedureNames = $procedures->pluck('full_description')->implode(', ');
        $formatted = $procedureNames;

        if ($this->notes) {
            $formatted .= ' (Notes: ' . $this->notes . ')';
        }

        $formatted .= ' [Status: ' . $this->status_name . ']';

        return $formatted;
    }

    public function getTreatmentProceduresStringAttribute(): string
    {
        $procedures = $this->icd9cmCodes;

        if ($procedures->isEmpty()) {
            return 'No procedures';
        }

        return $procedures->pluck('full_description')->implode(', ');
    }

    // Methods
    public function canStart(): bool
    {
        return $this->status === self::STATUS_PLANNED;
    }

    public function canComplete(): bool
    {
        return in_array($this->status, [self::STATUS_PLANNED, self::STATUS_IN_PROGRESS]);
    }

    public function canCancel(): bool
    {
        return in_array($this->status, [self::STATUS_PLANNED, self::STATUS_IN_PROGRESS]);
    }

    public function startTreatment(): bool
    {
        if (!$this->canStart()) {
            return false;
        }

        return $this->update([
            'status' => self::STATUS_IN_PROGRESS,
            'started_date' => now()
        ]);
    }

    public function completeTreatment($completedBy = null): bool
    {
        if (!$this->canComplete()) {
            return false;
        }

        $updateData = [
            'status' => self::STATUS_COMPLETED,
            'completed_date' => now()
        ];

        if ($completedBy) {
            $updateData['completed_by'] = $completedBy;
        }

        if (!$this->started_date) {
            $updateData['started_date'] = now();
        }

        return $this->update($updateData);
    }

    public function cancelTreatment(): bool
    {
        if (!$this->canCancel()) {
            return false;
        }

        return $this->update([
            'status' => self::STATUS_CANCELLED
        ]);
    }

    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    public function isInProgress(): bool
    {
        return $this->status === self::STATUS_IN_PROGRESS;
    }

    public function isPlanned(): bool
    {
        return $this->status === self::STATUS_PLANNED;
    }

    public function isCancelled(): bool
    {
        return $this->status === self::STATUS_CANCELLED;
    }

    // Methods for managing procedures
    public function addProcedure($icd9cmCodeId): bool
    {
        // Check if procedure already exists
        if ($this->procedures()->where('icd_9cm_codes_id', $icd9cmCodeId)->exists()) {
            return false;
        }

        $this->procedures()->create([
            'icd_9cm_codes_id' => $icd9cmCodeId
        ]);

        return true;
    }

    public function removeProcedure($icd9cmCodeId): bool
    {
        return $this->procedures()->where('icd_9cm_codes_id', $icd9cmCodeId)->delete() > 0;
    }

    public function syncProcedures(array $icd9cmCodeIds): void
    {
        // Delete existing procedures
        $this->procedures()->delete();

        // Add new procedures
        foreach ($icd9cmCodeIds as $codeId) {
            $this->procedures()->create([
                'icd_9cm_codes_id' => $codeId
            ]);
        }
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function (ToothTreatment $treatment) {
            // ✅ FIXED: Use Auth facade properly
            if (empty($treatment->created_by) && Auth::check()) {
                $treatment->created_by = Auth::id();
            }
        });

        static::created(function (ToothTreatment $treatment) {
            // ✅ FIXED: Use Log facade properly
            Log::info('Tooth treatment created', [
                'id' => $treatment->id,
                'parent_type' => $treatment->parent_type,
                'status' => $treatment->status,
                'created_by' => $treatment->created_by,
            ]);
        });

        static::updated(function (ToothTreatment $treatment) {
            if ($treatment->isDirty('status')) {
                // ✅ FIXED: Use Log facade properly
                Log::info('Tooth treatment status changed', [
                    'id' => $treatment->id,
                    'old_status' => $treatment->getOriginal('status'),
                    'new_status' => $treatment->status,
                ]);
            }
        });

        static::deleting(function (ToothTreatment $treatment) {
            // Delete related procedures when treatment is deleted
            $treatment->procedures()->delete();
        });
    }
}
