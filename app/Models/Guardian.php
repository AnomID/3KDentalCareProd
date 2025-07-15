<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Guardian extends Model
{
    use HasFactory;
    protected $table = 'guardians';
    protected $fillable = [
        'name',
        'relationship',
        'identity_type',
        'identity_number',
        'phone_number',
        'address',
    ];
    protected $hidden = [
        'created_at',
        'updated_at',
    ];
    public function patient()
    {
        return $this->hasMany(Patient::class);
    }
}
