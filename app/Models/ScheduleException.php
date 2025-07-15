<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScheduleException extends Model
{
    use HasFactory;

    protected $fillable = [
        'doctor_id',
        'exception_date_start',
        'exception_date_end',
        'is_full_day',
        'start_time',
        'end_time',
        'reason',
        'notes'
    ];

    protected $casts = [
        'exception_date_start' => 'date',
        'exception_date_end' => 'date',
        'is_full_day' => 'boolean',
    ];

    /**
     * Get the doctor that owns the schedule exception.
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    /**
     * Format date range for display
     */
    public function getFormattedDateRangeAttribute()
    {
        $start = $this->exception_date_start->format('d M Y');
        $end = $this->exception_date_end->format('d M Y');

        if ($start === $end) {
            return $start;
        }

        return "$start - $end";
    }

    /**
     * Format time range for display if not full day
     */
    public function getFormattedTimeRangeAttribute()
    {
        if ($this->is_full_day) {
            return 'Seharian';
        }

        return substr($this->start_time, 0, 5) . ' - ' . substr($this->end_time, 0, 5);
    }

    /**
     * Check if a specific date is within this exception period
     */
    public function coversDate($date)
    {
        return $this->exception_date_start <= $date && $this->exception_date_end >= $date;
    }

    /**
     * Check if a specific time period on a specific date is affected by this exception
     */
    public function affectsTimeSlot($date, $startTime, $endTime)
    {
        // If date is not within exception period, then it's not affected
        if (!$this->coversDate($date)) {
            return false;
        }

        // If exception is for the full day, then any time slot is affected
        if ($this->is_full_day) {
            return true;
        }

        // Check if time periods overlap
        return (
            ($startTime >= $this->start_time && $startTime < $this->end_time) ||
            ($endTime > $this->start_time && $endTime <= $this->end_time) ||
            ($startTime <= $this->start_time && $endTime >= $this->end_time)
        );
    }

    /**
     * Scope to filter exceptions for a specific doctor
     */
    public function scopeForDoctor($query, $doctorId)
    {
        return $query->where('doctor_id', $doctorId);
    }

    /**
     * Scope to filter exceptions that are active on a specific date
     */
    public function scopeActiveOnDate($query, $date)
    {
        return $query->where('exception_date_start', '<=', $date)
            ->where('exception_date_end', '>=', $date);
    }

    /**
     * Scope to filter future exceptions
     */
    public function scopeFuture($query)
    {
        return $query->where('exception_date_end', '>=', now()->format('Y-m-d'));
    }

    /**
     * Scope to filter past exceptions
     */
    public function scopePast($query)
    {
        return $query->where('exception_date_end', '<', now()->format('Y-m-d'));
    }

    /**
     * Scope to filter full-day exceptions
     */
    public function scopeFullDay($query)
    {
        return $query->where('is_full_day', true);
    }

    /**
     * Scope to filter partial-day exceptions
     */
    public function scopePartialDay($query)
    {
        return $query->where('is_full_day', false);
    }

    /**
     * Check if this exception is still editable (future dates only)
     */
    public function isEditable()
    {
        return $this->exception_date_end >= now()->format('Y-m-d');
    }

    /**
     * Check if this exception is currently active
     */
    public function isActive()
    {
        $today = now()->format('Y-m-d');
        return $this->exception_date_start <= $today && $this->exception_date_end >= $today;
    }

    /**
     * Get the duration of the exception in days
     */
    public function getDurationInDaysAttribute()
    {
        return $this->exception_date_start->diffInDays($this->exception_date_end) + 1;
    }

    /**
     * Get a human-readable description of the exception
     */
    public function getDescriptionAttribute()
    {
        $dateRange = $this->formatted_date_range;
        $timeRange = $this->formatted_time_range;

        return $this->reason . ' (' . $dateRange . ($this->is_full_day ? '' : ', ' . $timeRange) . ')';
    }

    /**
     * Static method to check if a doctor has any exceptions on a specific date
     */
    public static function doctorHasExceptionOnDate($doctorId, $date)
    {
        return self::forDoctor($doctorId)
            ->activeOnDate($date)
            ->exists();
    }

    /**
     * Static method to get all exceptions for a doctor within a date range
     */
    public static function getDoctorExceptionsInRange($doctorId, $startDate, $endDate)
    {
        return self::forDoctor($doctorId)
            ->where(function ($query) use ($startDate, $endDate) {
                $query->whereBetween('exception_date_start', [$startDate, $endDate])
                    ->orWhereBetween('exception_date_end', [$startDate, $endDate])
                    ->orWhere(function ($q) use ($startDate, $endDate) {
                        $q->where('exception_date_start', '<=', $startDate)
                            ->where('exception_date_end', '>=', $endDate);
                    });
            })
            ->orderBy('exception_date_start')
            ->get();
    }

    /**
     * Static method to check if a specific schedule is affected by exceptions on a date
     */
    public static function scheduleIsAffectedOnDate($scheduleId, $date)
    {
        $schedule = Schedule::find($scheduleId);
        if (!$schedule) {
            return true; // Assume affected if schedule not found
        }

        return self::forDoctor($schedule->doctor_id)
            ->activeOnDate($date)
            ->where(function ($query) use ($schedule) {
                $query->fullDay()
                    ->orWhere(function ($timeQuery) use ($schedule) {
                        $timeQuery->partialDay()
                            ->where(function ($overlapQuery) use ($schedule) {
                                $overlapQuery->whereBetween('start_time', [$schedule->start_time, $schedule->end_time])
                                    ->orWhereBetween('end_time', [$schedule->start_time, $schedule->end_time])
                                    ->orWhere(function ($containsQuery) use ($schedule) {
                                        $containsQuery->where('start_time', '<=', $schedule->start_time)
                                            ->where('end_time', '>=', $schedule->end_time);
                                    });
                            });
                    });
            })
            ->exists();
    }
}
