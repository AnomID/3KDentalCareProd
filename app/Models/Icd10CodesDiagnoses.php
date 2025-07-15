<?php

// App/Models/Icd10CodesDiagnoses.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Icd10CodesDiagnoses extends Model
{
    use HasFactory;

    protected $table = 'icd_10_codes_diagnoses';

    protected $fillable = [
        'code',
        'description',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected $attributes = [
        'is_active' => true,
    ];

    // Relationships
    public function primaryDiagnoses()
    {
        return $this->hasMany(ToothDiagnosesPrimary::class, 'icd_10_codes_diagnoses_id');
    }

    public function secondaryDiagnoses()
    {
        return $this->hasMany(ToothDiagnosesSecondary::class, 'icd_10_codes_diagnoses_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCode($query, $code)
    {
        return $query->where('code', 'LIKE', "%{$code}%");
    }

    public function scopeByDescription($query, $description)
    {
        return $query->where('description', 'LIKE', "%{$description}%");
    }

    // Methods
    public function getFullDescriptionAttribute()
    {
        return $this->code . ' - ' . $this->description;
    }
}
