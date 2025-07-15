<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScheduleQuota extends Model
{
    use HasFactory;

    protected $fillable = [
        'schedule_id',
        'quota',
    ];

    /**
     * Get the schedule that owns the quota.
     */
    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    /**
     * Get the remaining quota for a specific date
     */
    public function getRemainingForDate($date)
    {
        $bookedAppointments = Queue::where('schedule_id', $this->schedule_id)
            ->whereDate('appointment_date', $date)
            ->count();

        return max(0, $this->quota - $bookedAppointments);
    }

    /**
     * Check if there's quota available for a specific date
     */
    public function hasAvailableQuota($date)
    {
        return $this->getRemainingForDate($date) > 0;
    }
}
