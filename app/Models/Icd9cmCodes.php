<?php
// App/Models/Icd9cmCodes.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Icd9cmCodes extends Model
{
    use HasFactory;

    protected $table = 'icd_9cm_codes';

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
    public function treatmentProcedures()
    {
        return $this->hasMany(ToothTreatmentProcedure::class, 'icd_9cm_codes_id');
    }

    public function treatments()
    {
        return $this->belongsToMany(ToothTreatment::class, 'tooth_treatment_procedures', 'icd_9cm_codes_id', 'tooth_treatment_id');
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
