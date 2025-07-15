<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

use Carbon\Carbon;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'birth_place',
        'birth_date',
        // 'age',
        'identity_type',
        'no_identity', //Unique
        'citizenship',
        'gender',
        'occupation',
        'address',
        'phone',
        'blood_type',
        'user_id',
        'guardian_id',
        'no_rm' //Unique
    ];

    protected $appends = ['age'];
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function guardian()
    {
        return $this->belongsTo(Guardian::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function getAgeAttribute()
    {
        return $this->birth_date ? Carbon::parse($this->birth_date)->age : null;
    }

    public function medicalHistory()
    {
        return $this->hasOne(MedicalHistory::class);
    }
    // protected static function booted()
    // {
    // static::creating(function ($patient) {
    //     // Ensure no_rm is set only if it hasn't been set already (optional)
    //     if (empty($patient->no_rm)) {
    //         $lastId = self::max('id') + 1;
    //         // Format: RM-[tahun][bulan]-[ID 3 digit]
    //         $patient->no_rm = 'RM3KDC-' . now()->format('Ym') . '-' . str_pad($lastId, 3, '0', STR_PAD_LEFT);
    //     }
    // });
    // }

    public function odontograms()
    {
        return $this->hasMany(Odontogram::class);
    }
}
