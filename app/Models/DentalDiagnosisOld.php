<?php

// app/Models/DentalDiagnosis.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DentalDiagnosisOld extends Model
{
    use HasFactory;

    protected $table = 'dental_diagnoses';

    protected $fillable = [
        'code',
        'name',
        'description',
        'suggested_icd_10_code',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // public function toothDiagnoses()
    // {
    //     return $this->hasMany(ToothDiagnosis::class);
    // }

    // /**
    //  * Relation to suggested ICD-10 code
    //  */
    // public function suggestedIcd10Code()
    // {
    //     return $this->belongsTo(Icd10Code::class, 'suggested_icd_10_code', 'code');
    // }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope untuk mencari diagnosis berdasarkan kategori ICD-10
     */
    public function scopeByIcdCategory($query, $category)
    {
        return $query->whereHas('suggestedIcd10Code', function ($q) use ($category) {
            $q->where('category', $category);
        });
    }






    /**
     * Get ICD-10 category from suggested code
     */
    public function getIcd10CategoryAttribute()
    {
        if (!$this->suggested_icd_10_code) {
            return null;
        }

        return $this->suggestedIcd10Code->category ?? null;
    }

    /**
     * Get full ICD-10 description
     */
    public function getFullIcd10DescriptionAttribute()
    {
        if (!$this->suggestedIcd10Code) {
            return null;
        }

        return $this->suggested_icd_10_code . ' - ' . $this->suggestedIcd10Code->description;
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
