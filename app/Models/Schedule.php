<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class Schedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'doctor_id',
        'day_of_week',
        'start_time',
        'end_time',
        'status',
        'notes'
    ];

    protected $casts = [
        'day_of_week' => 'integer',
        'status' => 'boolean',
    ];

    /**
     * Mutator for start_time - converts various time formats to H:i
     */
    public function setStartTimeAttribute($value)
    {
        $this->attributes['start_time'] = $this->convertTimeFormat($value);
    }

    /**
     * Mutator for end_time - converts various time formats to H:i
     */
    public function setEndTimeAttribute($value)
    {
        $this->attributes['end_time'] = $this->convertTimeFormat($value);
    }

    /**
     * Accessor for start_time - returns in H:i format
     */
    public function getStartTimeAttribute($value)
    {
        if (!$value) return null;

        try {
            return Carbon::createFromFormat('H:i:s', $value)->format('H:i');
        } catch (\Exception $e) {
            try {
                return Carbon::createFromFormat('H:i', $value)->format('H:i');
            } catch (\Exception $e2) {
                return $value;
            }
        }
    }

    /**
     * Accessor for end_time - returns in H:i format
     */
    public function getEndTimeAttribute($value)
    {
        if (!$value) return null;

        try {
            return Carbon::createFromFormat('H:i:s', $value)->format('H:i');
        } catch (\Exception $e) {
            try {
                return Carbon::createFromFormat('H:i', $value)->format('H:i');
            } catch (\Exception $e2) {
                return $value;
            }
        }
    }

    /**
     * Convert time from various formats to H:i format
     */
    private function convertTimeFormat($time)
    {
        if (empty($time)) {
            return null;
        }

        try {
            // Try to parse the time in different formats
            $parsedTime = Carbon::createFromFormat('H:i', $time);
            return $parsedTime->format('H:i');
        } catch (\Exception $e1) {
            try {
                // Try parsing with seconds
                $parsedTime = Carbon::createFromFormat('H:i:s', $time);
                return $parsedTime->format('H:i');
            } catch (\Exception $e2) {
                try {
                    // Try parsing AM/PM format
                    $parsedTime = Carbon::createFromFormat('h:i A', $time);
                    return $parsedTime->format('H:i');
                } catch (\Exception $e3) {
                    try {
                        // Try parsing AM/PM format without space
                        $parsedTime = Carbon::createFromFormat('h:iA', $time);
                        return $parsedTime->format('H:i');
                    } catch (\Exception $e4) {
                        try {
                            // Try parsing with g:i A format (single digit hour)
                            $parsedTime = Carbon::createFromFormat('g:i A', $time);
                            return $parsedTime->format('H:i');
                        } catch (\Exception $e5) {
                            try {
                                // Try parsing with g:iA format (single digit hour, no space)
                                $parsedTime = Carbon::createFromFormat('g:iA', $time);
                                return $parsedTime->format('H:i');
                            } catch (\Exception $e6) {
                                // If all formats fail, return original time
                                return $time;
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Get the doctor that owns the schedule.
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    /**
     * Get the schedule quota associated with the schedule.
     */
    public function scheduleQuota(): HasOne
    {
        return $this->hasOne(ScheduleQuota::class);
    }

    /**
     * Get the appointments for the schedule.
     */
    public function appointments(): HasMany
    {
        return $this->hasMany(Queue::class);
    }

    /**
     * Convert day_of_week to Indonesian day name
     */
    public function getDayNameAttribute()
    {
        $days = [
            0 => 'Minggu',
            1 => 'Senin',
            2 => 'Selasa',
            3 => 'Rabu',
            4 => 'Kamis',
            5 => 'Jumat',
            6 => 'Sabtu',
        ];

        return $days[$this->day_of_week] ?? '';
    }

    /**
     * Format time for display
     */
    public function getFormattedTimeAttribute()
    {
        return substr($this->start_time, 0, 5) . ' - ' . substr($this->end_time, 0, 5);
    }

    /**
     * Get start time in 12-hour format with AM/PM
     */
    public function getStartTimeAmPmAttribute()
    {
        try {
            return Carbon::createFromFormat('H:i', $this->start_time)->format('g:i A');
        } catch (\Exception $e) {
            return $this->start_time;
        }
    }

    /**
     * Get end time in 12-hour format with AM/PM
     */
    public function getEndTimeAmPmAttribute()
    {
        try {
            return Carbon::createFromFormat('H:i', $this->end_time)->format('g:i A');
        } catch (\Exception $e) {
            return $this->end_time;
        }
    }

    /**
     * Get formatted time range in 12-hour format
     */
    public function getFormattedTimeAmPmAttribute()
    {
        return $this->start_time_am_pm . ' - ' . $this->end_time_am_pm;
    }

    /**
     * Check if this schedule is available on a specific date
     */
    public function isAvailableOnDate($date)
    {
        // Check if the doctor has any exceptions on this date
        $hasException = ScheduleException::where('doctor_id', $this->doctor_id)
            ->where('exception_date_start', '<=', $date)
            ->where('exception_date_end', '>=', $date)
            ->exists();

        if ($hasException) {
            return false;
        }

        // Check if the schedule's day of week matches the date's day of week
        $dateObj = new \DateTime($date);
        $dayOfWeek = (int) $dateObj->format('w'); // 0 (Sunday) to 6 (Saturday)

        if ($dayOfWeek !== $this->day_of_week) {
            return false;
        }

        // Check if the schedule is active
        if (!$this->status) {
            return false;
        }

        // Check if doctor's license is valid
        if ($this->doctor->license_expiry_date && $this->doctor->license_expiry_date < $date) {
            return false;
        }

        // Check if there's still quota available
        $totalQuota = $this->scheduleQuota->quota;
        $bookedAppointments = Queue::where('schedule_id', $this->id)
            ->whereDate('appointment_date', $date)
            ->count();

        return $bookedAppointments < $totalQuota;
    }

    /**
     * Get the remaining quota for a specific date
     */
    public function getRemainingQuota($date)
    {
        $totalQuota = $this->scheduleQuota->quota;
        $bookedAppointments = Queue::where('schedule_id', $this->id)
            ->whereDate('appointment_date', $date)
            ->count();

        return max(0, $totalQuota - $bookedAppointments);
    }
}
