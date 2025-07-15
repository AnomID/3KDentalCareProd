<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OdontogramTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'template_data',
        'created_by',
        'is_active'
    ];

    protected $casts = [
        'template_data' => 'array',
        'is_active' => 'boolean'
    ];

    // Relationships
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('created_by', $userId);
    }

    // Methods
    public function deactivate(): bool
    {
        return $this->update(['is_active' => false]);
    }

    public function activate(): bool
    {
        return $this->update(['is_active' => true]);
    }

    public function getConditionsCountAttribute(): int
    {
        if (!$this->template_data || !isset($this->template_data['conditions'])) {
            return 0;
        }

        return count($this->template_data['conditions']);
    }

    public function getBridgesCountAttribute(): int
    {
        if (!$this->template_data || !isset($this->template_data['bridges'])) {
            return 0;
        }

        return count($this->template_data['bridges']);
    }

    public function getIndicatorsCountAttribute(): int
    {
        if (!$this->template_data || !isset($this->template_data['indicators'])) {
            return 0;
        }

        return count($this->template_data['indicators']);
    }

    public function getTotalItemsAttribute(): int
    {
        return $this->conditions_count + $this->bridges_count + $this->indicators_count;
    }

    public static function createFromOdontogram(Odontogram $odontogram, string $name, string $description = null): self
    {
        $templateData = [
            'conditions' => $odontogram->toothConditions()->get()->toArray(),
            'bridges' => $odontogram->toothBridges()->get()->toArray(),
            'indicators' => $odontogram->toothIndicators()->get()->toArray(),
            'general_settings' => [
                'occlusion' => $odontogram->occlusion,
                'torus_palatinus' => $odontogram->torus_palatinus,
                'torus_mandibularis' => $odontogram->torus_mandibularis,
                'palatum' => $odontogram->palatum,
                'diastema' => $odontogram->diastema,
                'gigi_anomali' => $odontogram->gigi_anomali,
                'others' => $odontogram->others
            ]
        ];

        return self::create([
            'name' => $name,
            'description' => $description,
            'template_data' => $templateData,
            'created_by' => \Illuminate\Support\Facades\Auth::id()
        ]);
    }

    public function applyToOdontogram(Odontogram $odontogram): bool
    {
        if (!$this->template_data) {
            return false;
        }

        $templateData = $this->template_data;

        // Apply general settings
        if (isset($templateData['general_settings'])) {
            $odontogram->update($templateData['general_settings']);
        }

        // Apply conditions
        if (isset($templateData['conditions'])) {
            foreach ($templateData['conditions'] as $conditionData) {
                // Remove ID and timestamps
                unset($conditionData['id'], $conditionData['created_at'], $conditionData['updated_at']);
                $conditionData['odontogram_id'] = $odontogram->id;

                ToothCondition::create($conditionData);
            }
        }

        // Apply bridges
        if (isset($templateData['bridges'])) {
            foreach ($templateData['bridges'] as $bridgeData) {
                // Remove ID and timestamps
                unset($bridgeData['id'], $bridgeData['created_at'], $bridgeData['updated_at']);
                $bridgeData['odontogram_id'] = $odontogram->id;

                ToothBridge::create($bridgeData);
            }
        }

        // Apply indicators
        if (isset($templateData['indicators'])) {
            foreach ($templateData['indicators'] as $indicatorData) {
                // Remove ID and timestamps
                unset($indicatorData['id'], $indicatorData['created_at'], $indicatorData['updated_at']);
                $indicatorData['odontogram_id'] = $odontogram->id;

                ToothIndicator::create($indicatorData);
            }
        }

        return true;
    }
}
