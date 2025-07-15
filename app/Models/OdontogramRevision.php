<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OdontogramRevision extends Model
{
    use HasFactory;

    protected $fillable = [
        'odontogram_id',
        'table_name',
        'record_id',
        'action',
        'old_values',
        'new_values',
        'reason',
        'updated_by'
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array'
    ];

    public $timestamps = true;

    // Relationships
    public function odontogram(): BelongsTo
    {
        return $this->belongsTo(Odontogram::class);
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Scopes
    public function scopeByOdontogram($query, $odontogramId)
    {
        return $query->where('odontogram_id', $odontogramId);
    }

    public function scopeByTable($query, $tableName)
    {
        return $query->where('table_name', $tableName);
    }

    public function scopeByAction($query, $action)
    {
        return $query->where('action', $action);
    }

    public function scopeRecentFirst($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('updated_by', $userId);
    }

    // Methods
    public function getChangesAttribute(): array
    {
        if (!$this->old_values || !$this->new_values) {
            return [];
        }

        $changes = [];
        $oldValues = $this->old_values;
        $newValues = $this->new_values;

        foreach ($newValues as $key => $newValue) {
            $oldValue = $oldValues[$key] ?? null;

            if ($oldValue !== $newValue) {
                $changes[$key] = [
                    'old' => $oldValue,
                    'new' => $newValue
                ];
            }
        }

        return $changes;
    }

    public function getFormattedChangesAttribute(): array
    {
        $changes = $this->changes;
        $formatted = [];

        foreach ($changes as $field => $values) {
            $fieldName = $this->formatFieldName($field);
            $oldValue = $this->formatValue($values['old']);
            $newValue = $this->formatValue($values['new']);

            $formatted[] = [
                'field' => $fieldName,
                'old' => $oldValue,
                'new' => $newValue,
                'change' => "{$fieldName}: {$oldValue} → {$newValue}"
            ];
        }

        return $formatted;
    }

    public function getActionColorAttribute(): string
    {
        return match ($this->action) {
            'create' => 'success',
            'update' => 'warning',
            'delete' => 'danger',
            default => 'secondary'
        };
    }

    public function getActionIconAttribute(): string
    {
        return match ($this->action) {
            'create' => 'plus-circle',
            'update' => 'edit',
            'delete' => 'trash',
            default => 'circle'
        };
    }

    public function getTableDisplayNameAttribute(): string
    {
        return match ($this->table_name) {
            'odontograms' => 'Odontogram',
            'tooth_conditions' => 'Tooth Condition',
            'tooth_bridges' => 'Tooth Bridge',
            'tooth_indicators' => 'Tooth Indicator',
            'odontogram_attachments' => 'Attachment',
            default => ucwords(str_replace('_', ' ', $this->table_name))
        };
    }

    private function formatFieldName(string $field): string
    {
        $fieldNames = [
            'tooth_number' => 'Tooth Number',
            'surface' => 'Surface',
            'condition_code' => 'Condition',
            'treatment_status' => 'Treatment Status',
            'diagnosis_id' => 'Diagnosis',
            'icd_10_code' => 'ICD-10 Code',
            'planned_treatment_id' => 'Planned Treatment',
            'treatment_cost' => 'Treatment Cost',
            'priority' => 'Priority',
            'is_finalized' => 'Status',
            'd_value' => 'Decayed (D)',
            'm_value' => 'Missing (M)',
            'f_value' => 'Filled (F)',
            'occlusion' => 'Occlusion',
            'torus_palatinus' => 'Torus Palatinus',
            'torus_mandibularis' => 'Torus Mandibularis',
            'palatum' => 'Palatum'
        ];

        return $fieldNames[$field] ?? ucwords(str_replace('_', ' ', $field));
    }

    private function formatValue($value): string
    {
        if (is_null($value)) {
            return 'null';
        }

        if (is_bool($value)) {
            return $value ? 'true' : 'false';
        }

        if (is_array($value)) {
            return json_encode($value);
        }

        return (string) $value;
    }
}
