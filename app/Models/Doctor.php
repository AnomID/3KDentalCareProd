<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Doctor extends Model
{
    use HasFactory;

    protected $fillable = [
        'code', // Unique
        'name',
        'specialization',
        'license_number', // Unique
        'license_start_date',
        'license_expiry_date',
        'address',
        'phone', // Unique
        'user_id'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'license_start_date' => 'date',
        'license_expiry_date' => 'date',
    ];

    /**
     * Get the user that owns the doctor.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the schedules for the doctor.
     */
    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    /**
     * Get the schedule exceptions for the doctor.
     */
    public function scheduleExceptions(): HasMany
    {
        return $this->hasMany(ScheduleException::class);
    }

    /**
     * Get the appointments for the doctor.
     */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * Get the active schedules for the doctor.
     */
    public function activeSchedules(): HasMany
    {
        return $this->schedules()->where('status', true);
    }

    /**
     * Get upcoming schedule exceptions for the doctor.
     */
    public function upcomingExceptions(): HasMany
    {
        return $this->scheduleExceptions()
            ->where('exception_date_end', '>=', now()->format('Y-m-d'))
            ->orderBy('exception_date_start');
    }

    /**
     * UPDATED: Enhanced check if doctor is available on a specific date
     */
    public function isAvailableOnDate($date)
    {
        // Check if license is valid
        if ($this->license_expiry_date && $this->license_expiry_date < $date) {
            return false;
        }

        // Convert date to day of week (0 = Sunday, 1 = Monday, etc.)
        $dayOfWeek = Carbon::parse($date)->dayOfWeek;

        // Check if doctor has any active schedules for this day
        $hasActiveSchedule = $this->activeSchedules()
            ->where('day_of_week', $dayOfWeek)
            ->exists();

        if (!$hasActiveSchedule) {
            return false;
        }

        // Check if doctor has any full-day exceptions on this date
        $hasFullDayException = $this->scheduleExceptions()
            ->where('exception_date_start', '<=', $date)
            ->where('exception_date_end', '>=', $date)
            ->where('is_full_day', true)
            ->exists();

        return !$hasFullDayException;
    }

    /**
     * Get available schedules for a specific date
     */
    public function getAvailableSchedulesForDate($date)
    {
        $dayOfWeek = Carbon::parse($date)->dayOfWeek;

        // Get all active schedules for this day
        $schedules = $this->activeSchedules()
            ->where('day_of_week', $dayOfWeek)
            ->with('scheduleQuota')
            ->get();

        // Filter out schedules that have exceptions
        return $schedules->filter(function ($schedule) use ($date) {
            $hasException = $this->scheduleExceptions()
                ->where('exception_date_start', '<=', $date)
                ->where('exception_date_end', '>=', $date)
                ->where(function ($query) use ($schedule) {
                    // Full day exception OR time-specific exception that overlaps with schedule
                    $query->where('is_full_day', true)
                        ->orWhere(function ($timeQuery) use ($schedule) {
                            $timeQuery->where('is_full_day', false)
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

            return !$hasException;
        });
    }

    /**
     * Check if doctor has any exceptions on a specific date
     */
    public function hasExceptionOnDate($date)
    {
        return $this->scheduleExceptions()
            ->where('exception_date_start', '<=', $date)
            ->where('exception_date_end', '>=', $date)
            ->exists();
    }

    /**
     * Count available schedules for a specific date
     */
    public function countAvailableSchedulesForDate($date)
    {
        return $this->getAvailableSchedulesForDate($date)->count();
    }

    /**
     * Get formatted name with title
     */
    public function getFormattedNameAttribute()
    {
        return 'dr. ' . $this->name;
    }

    /**
     * Get license status
     */
    public function getLicenseStatusAttribute()
    {
        if (!$this->license_expiry_date) {
            return 'active'; // No expiry date means permanent license
        }

        $today = now()->format('Y-m-d');
        $expiryDate = $this->license_expiry_date->format('Y-m-d');

        if ($expiryDate < $today) {
            return 'expired';
        } elseif ($expiryDate <= now()->addDays(30)->format('Y-m-d')) {
            return 'expiring_soon';
        }

        return 'active';
    }

    /**
     * Check if license is valid
     */
    public function hasValidLicense()
    {
        return $this->license_status === 'active' || $this->license_status === 'expiring_soon';
    }

    /**
     * Scope for doctors with valid licenses
     */
    public function scopeWithValidLicense($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('license_expiry_date')
                ->orWhere('license_expiry_date', '>=', now()->format('Y-m-d'));
        });
    }

    /**
     * Scope for doctors available on a specific date
     */
    public function scopeAvailableOnDate($query, $date)
    {
        $dayOfWeek = Carbon::parse($date)->dayOfWeek;

        return $query->withValidLicense()
            ->whereHas('schedules', function ($scheduleQuery) use ($dayOfWeek) {
                $scheduleQuery->where('day_of_week', $dayOfWeek)
                    ->where('status', true);
            })
            ->whereDoesntHave('scheduleExceptions', function ($exceptionQuery) use ($date) {
                $exceptionQuery->where('exception_date_start', '<=', $date)
                    ->where('exception_date_end', '>=', $date)
                    ->where('is_full_day', true);
            });
    }

    /**
     * Scope for doctors who have schedules on a specific day of week
     */
    public function scopeHasScheduleOnDay($query, $dayOfWeek)
    {
        return $query->whereHas('schedules', function ($scheduleQuery) use ($dayOfWeek) {
            $scheduleQuery->where('day_of_week', $dayOfWeek)
                ->where('status', true);
        });
    }

    /**
     * Get total appointments count
     */
    public function getTotalAppointmentsAttribute()
    {
        return $this->appointments()->count();
    }

    /**
     * Get completed appointments count
     */
    public function getCompletedAppointmentsAttribute()
    {
        return $this->appointments()
            ->where('status', Appointment::STATUS_COMPLETED)
            ->count();
    }

    /**
     * Get upcoming appointments count
     */
    public function getUpcomingAppointmentsAttribute()
    {
        return $this->appointments()
            ->whereIn('status', [
                Appointment::STATUS_SCHEDULED,
                Appointment::STATUS_CONFIRMED,
                Appointment::STATUS_IN_PROGRESS
            ])
            ->whereDate('appointment_date', '>=', now()->format('Y-m-d'))
            ->count();
    }

    /**
     * Get today's appointments
     */
    public function getTodayAppointmentsAttribute()
    {
        return $this->appointments()
            ->whereDate('appointment_date', now()->format('Y-m-d'))
            ->whereIn('status', [
                Appointment::STATUS_SCHEDULED,
                Appointment::STATUS_CONFIRMED,
                Appointment::STATUS_IN_PROGRESS
            ])
            ->count();
    }

    /**
     * Check if doctor code is unique
     */
    public static function isCodeUnique($code, $excludeId = null)
    {
        $query = self::where('code', $code);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return !$query->exists();
    }

    /**
     * Check if license number is unique
     */
    public static function isLicenseNumberUnique($licenseNumber, $excludeId = null)
    {
        $query = self::where('license_number', $licenseNumber);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return !$query->exists();
    }

    /**
     * Check if phone number is unique
     */
    public static function isPhoneUnique($phone, $excludeId = null)
    {
        $query = self::where('phone', $phone);

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return !$query->exists();
    }

    /**
     * Generate unique doctor code
     */
    public static function generateUniqueCode($prefix = 'DR')
    {
        do {
            $code = $prefix . str_pad(random_int(1, 9999), 4, '0', STR_PAD_LEFT);
        } while (!self::isCodeUnique($code));

        return $code;
    }

    /**
     * Get doctor's schedule summary for a date range
     */
    public function getScheduleSummary($startDate, $endDate)
    {
        $summary = [];
        $currentDate = Carbon::parse($startDate);
        $endDate = Carbon::parse($endDate);

        while ($currentDate <= $endDate) {
            $dayOfWeek = $currentDate->dayOfWeek;
            $dateStr = $currentDate->format('Y-m-d');

            $availableSchedules = $this->getAvailableSchedulesForDate($dateStr);

            $summary[$dateStr] = [
                'date' => $dateStr,
                'day_name' => $currentDate->format('l'),
                'day_name_id' => $this->getDayNameIndonesian($dayOfWeek),
                'has_schedule' => $availableSchedules->count() > 0,
                'schedules_count' => $availableSchedules->count(),
                'schedules' => $availableSchedules->map(function ($schedule) use ($dateStr) {
                    return [
                        'id' => $schedule->id,
                        'start_time' => $schedule->start_time,
                        'end_time' => $schedule->end_time,
                        'formatted_time' => $schedule->start_time . ' - ' . $schedule->end_time,
                        'quota' => $schedule->scheduleQuota->quota ?? 0,
                        'remaining_quota' => $schedule->getRemainingQuota($dateStr),
                    ];
                })->toArray(),
                'exceptions' => $this->scheduleExceptions()
                    ->where('exception_date_start', '<=', $dateStr)
                    ->where('exception_date_end', '>=', $dateStr)
                    ->get()
                    ->map(function ($exception) {
                        return [
                            'reason' => $exception->reason,
                            'is_full_day' => $exception->is_full_day,
                            'start_time' => $exception->start_time,
                            'end_time' => $exception->end_time,
                        ];
                    })->toArray(),
            ];

            $currentDate->addDay();
        }

        return $summary;
    }

    /**
     * Get Indonesian day name
     */
    private function getDayNameIndonesian($dayOfWeek)
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

        return $days[$dayOfWeek] ?? '';
    }
}
