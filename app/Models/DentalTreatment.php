<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DentalTreatment extends Model
{
    use HasFactory;

    protected $table = 'dental_treatments';

    protected $fillable = [
        'code',
        'name',
        'description',
        'icd_9_cm_code',
        'suggested_icd_10_code',
        'is_active'
    ];
    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected $attributes = [
        'is_active' => true,
    ];


    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCode($query, $code)
    {
        return $query->where('code', $code);
    }

    // Accessors
    public function getFullNameAttribute(): string
    {
        return "{$this->code} - {$this->name}";
    }
}
