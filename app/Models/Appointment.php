<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class Appointment extends Model
{
    use HasFactory;

    // Status constants - Updated with missing STATUS_IN_PROGRESS
    const STATUS_SCHEDULED = 'scheduled';
    const STATUS_CONFIRMED = 'confirmed';
    const STATUS_IN_PROGRESS = 'in_progress';  // Added missing constant
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELED = 'canceled';  // Keep existing naming
    const STATUS_NO_SHOW = 'no_show';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'patient_id',
        'doctor_id',
        'schedule_id',
        'queue_id',
        'created_by_user_id',
        'appointment_date',
        'appointment_time',
        'status',
        'chief_complaint',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'appointment_date' => 'date',
        'appointment_time' => 'datetime:H:i',
    ];

    /**
     * Get the patient that owns the appointment.
     */
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * Get the doctor that owns the appointment.
     */
    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }

    /**
     * Get the schedule that owns the appointment.
     */
    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }

    public function odontogram()
    {
        return $this->hasOne(Odontogram::class);
    }

    /**
     * Get the queue associated with the appointment.
     */
    public function queue()
    {
        return $this->belongsTo(Queue::class);
    }

    /**
     * Get the user who created the appointment.
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }


    /**
     * UPDATED: Check if doctor is available on a specific date and schedule
     * Enhanced to work with new flow: date → doctor → schedule
     */
    public static function isDoctorAvailable($doctorId, $scheduleId, $appointmentDate)
    {
        try {
            Log::info('Appointment::isDoctorAvailable - Checking availability', [
                'doctor_id' => $doctorId,
                'schedule_id' => $scheduleId,
                'appointment_date' => $appointmentDate
            ]);

            // Get the schedule
            $schedule = Schedule::find($scheduleId);
            if (!$schedule) {
                Log::warning('Appointment::isDoctorAvailable - Schedule not found', [
                    'schedule_id' => $scheduleId
                ]);
                return false;
            }

            // Verify doctor and schedule match
            if ($schedule->doctor_id != $doctorId) {
                Log::warning('Appointment::isDoctorAvailable - Doctor/schedule mismatch', [
                    'expected_doctor_id' => $doctorId,
                    'actual_doctor_id' => $schedule->doctor_id
                ]);
                return false;
            }

            // Check if the schedule is active
            if (!$schedule->is_active) {
                Log::warning('Appointment::isDoctorAvailable - Schedule is inactive');
                return false;
            }

            // Get the day of week for the selected date (0 = Sunday, 1 = Monday, etc.)
            $dayOfWeek = Carbon::parse($appointmentDate)->dayOfWeek;

            // Check if schedule matches the day of week
            if ($schedule->day_of_week != $dayOfWeek) {
                Log::warning('Appointment::isDoctorAvailable - Day of week mismatch', [
                    'expected_day' => $dayOfWeek,
                    'schedule_day' => $schedule->day_of_week
                ]);
                return false;
            }

            // Check for schedule exceptions
            $hasException = ScheduleException::where('schedule_id', $scheduleId)
                ->whereDate('exception_date', $appointmentDate)
                ->exists();

            if ($hasException) {
                Log::warning('Appointment::isDoctorAvailable - Schedule exception found');
                return false;
            }

            // Check quota availability
            // First check if there's a specific quota for this date
            $quota = ScheduleQuota::where('schedule_id', $scheduleId)
                ->whereDate('quota_date', $appointmentDate)
                ->first();

            $maxQuota = $quota ? $quota->max_patients : $schedule->max_patients;

            // Count existing appointments for this schedule and date
            $bookedAppointments = self::where('schedule_id', $scheduleId)
                ->whereDate('appointment_date', $appointmentDate)
                ->whereIn('status', [
                    self::STATUS_SCHEDULED,
                    self::STATUS_CONFIRMED,
                    self::STATUS_IN_PROGRESS
                ])
                ->count();

            $isAvailable = $bookedAppointments < $maxQuota;

            Log::info('Appointment::isDoctorAvailable - Quota check result', [
                'max_quota' => $maxQuota,
                'booked_appointments' => $bookedAppointments,
                'is_available' => $isAvailable
            ]);

            return $isAvailable;
        } catch (\Exception $e) {
            Log::error('Appointment::isDoctorAvailable - Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }

    /**
     * Check if appointment can be canceled
     */
    public function canBeCanceled()
    {
        // Can cancel if status is scheduled or confirmed and appointment date is in the future
        return in_array($this->status, [self::STATUS_SCHEDULED, self::STATUS_CONFIRMED]) &&
            Carbon::parse($this->appointment_date)->isAfter(Carbon::today());
    }

    /**
     * Check if appointment can be confirmed
     */
    public function canBeConfirmed()
    {
        return $this->status === self::STATUS_SCHEDULED;
    }

    /**
     * Check if appointment can be started (set to in_progress)
     */
    public function canBeStarted()
    {
        return in_array($this->status, [self::STATUS_CONFIRMED, self::STATUS_SCHEDULED]) &&
            Carbon::parse($this->appointment_date)->isToday();
    }

    /**
     * Check if appointment can be completed
     */
    public function canBeCompleted()
    {
        // Can be completed if status is in_progress
        return $this->status === self::STATUS_IN_PROGRESS;
    }

    /**
     * Check if appointment can be marked as no-show
     */
    public function canBeMarkedAsNoShow()
    {
        // Can be marked as no-show if status is confirmed/scheduled and date is today or in the past
        return in_array($this->status, [self::STATUS_CONFIRMED, self::STATUS_SCHEDULED]) &&
            Carbon::parse($this->appointment_date)->lte(Carbon::today());
    }


    /**
     * Check if appointment is active (not canceled or no-show)
     */
    public function isActive()
    {
        return in_array($this->status, [
            self::STATUS_SCHEDULED,
            self::STATUS_CONFIRMED,
            self::STATUS_IN_PROGRESS
        ]);
    }

    /**
     * Check if appointment is completed
     */
    public function isCompleted()
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    /**
     * Check if appointment is canceled
     */
    public function isCanceled()
    {
        return $this->status === self::STATUS_CANCELED;
    }

    /**
     * Start the appointment (set to in_progress)
     */
    public function start()
    {
        $this->update(['status' => self::STATUS_IN_PROGRESS]);

        // // Update queue status if exists
        // if ($this->queue) {
        //     $this->queue->update(['status' => Queue::STATUS_IN_PROGRESS]);
        // }
    }

    /**
     * Complete the appointment
     */
    public function complete()
    {
        $this->update(['status' => self::STATUS_COMPLETED]);

        // Update queue status if exists
        if ($this->queue) {
            $this->queue->update(['status' => Queue::STATUS_COMPLETED]);
        }
    }

    /**
     * Confirm the appointment
     */
    public function confirm()
    {
        $this->update(['status' => self::STATUS_CONFIRMED]);

        // Update queue status if exists
        // if ($this->queue) {
        //     $this->queue->update(['status' => Queue::STATUS_CONFIRMED]);
        // }
    }

    /**
     * Cancel the appointment
     */
    public function cancel($reason = null)
    {
        $this->update([
            'status' => self::STATUS_CANCELED,
            'notes' => $this->notes . ($reason ? "\n\nCancellation reason: " . $reason : '')
        ]);

        // Update queue status if exists
        if ($this->queue) {
            $this->queue->update(['status' => Queue::STATUS_CANCELED]);
        }
    }

    /**
     * Mark appointment as no-show
     */
    public function markNoShow()
    {
        $this->update(['status' => self::STATUS_NO_SHOW]);

        // Update queue status if exists
        if ($this->queue) {
            $this->queue->update(['status' => Queue::STATUS_NO_SHOW]);
        }
    }

    /**
     * Get all available statuses - Updated with STATUS_IN_PROGRESS
     */
    public static function getStatuses()
    {
        return [
            self::STATUS_SCHEDULED => 'Scheduled',
            self::STATUS_CONFIRMED => 'Confirmed',
            self::STATUS_IN_PROGRESS => 'In Progress',  // Added
            self::STATUS_COMPLETED => 'Completed',
            self::STATUS_CANCELED => 'Canceled',
            self::STATUS_NO_SHOW => 'No Show',
        ];
    }

    /**
     * Get status with Indonesian labels
     */
    public static function getStatusesIndonesian()
    {
        return [
            self::STATUS_SCHEDULED => 'Terjadwal',
            self::STATUS_CONFIRMED => 'Dikonfirmasi',
            self::STATUS_IN_PROGRESS => 'Sedang Berlangsung',
            self::STATUS_COMPLETED => 'Selesai',
            self::STATUS_CANCELED => 'Dibatalkan',
            self::STATUS_NO_SHOW => 'Tidak Hadir',
        ];
    }

    /**
     * Get status label in Indonesian
     */
    public function getStatusLabelAttribute()
    {
        $statuses = self::getStatusesIndonesian();
        return $statuses[$this->status] ?? 'Unknown';
    }

    /**
     * Get active statuses (for counting active appointments)
     */
    public static function getActiveStatuses()
    {
        return [
            self::STATUS_SCHEDULED,
            self::STATUS_CONFIRMED,
            self::STATUS_IN_PROGRESS,
        ];
    }
    public function getNextAppointment()
    {
        return self::where('patient_id', $this->patient_id)
            ->where('doctor_id', $this->doctor_id)
            ->where('id', '!=', $this->id)
            ->where(function ($query) {
                // Future appointments by date/time
                $query->where('appointment_date', '>', $this->appointment_date)
                    ->orWhere(function ($subQuery) {
                        // Same date but later time
                        $subQuery->where('appointment_date', $this->appointment_date)
                            ->where('appointment_time', '>', $this->appointment_time);
                    })
                    ->orWhere(function ($subQuery) {
                        // Same date and time, but created later (edge case)
                        $subQuery->where('appointment_date', $this->appointment_date)
                            ->where('appointment_time', $this->appointment_time)
                            ->where('created_at', '>', $this->created_at);
                    });
            })
            ->orderBy('appointment_date', 'asc')
            ->orderBy('appointment_time', 'asc')
            ->orderBy('created_at', 'asc')
            ->with(['patient', 'doctor', 'schedule', 'queue'])
            ->first();
    }

    /**
     * Find the latest appointment for the same patient-doctor combination
     * This is the most recent appointment based on creation time
     */
    public function getLatestAppointment()
    {
        return self::where('patient_id', $this->patient_id)
            ->where('doctor_id', $this->doctor_id)
            ->orderBy('appointment_date', 'desc')
            ->orderBy('appointment_time', 'desc')
            ->orderBy('created_at', 'desc')
            ->with(['patient', 'doctor', 'schedule', 'queue'])
            ->first();
    }


    /**
     * NEW: Get complete appointment history for same patient-doctor combination
     */
    public function getAppointmentHistory()
    {
        return self::where('patient_id', $this->patient_id)
            ->where('doctor_id', $this->doctor_id)
            ->with(['patient', 'doctor', 'schedule', 'queue', 'odontogram'])
            ->orderBy('appointment_date', 'desc')
            ->orderBy('appointment_time', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * NEW: Get appointment history with current appointment marker
     */
    public function getAppointmentHistoryWithCurrent()
    {
        $history = $this->getAppointmentHistory();

        return $history->map(function ($appointment) {
            $appointment->is_current = $appointment->id === $this->id;
            return $appointment;
        });
    }

    /**
     * NEW: Get the next appointment after current one (chronologically)
     */
    public function getNextAppointmentInSequence()
    {
        return self::where('patient_id', $this->patient_id)
            ->where('doctor_id', $this->doctor_id)
            ->where('id', '!=', $this->id)
            ->where(function ($query) {
                // Future appointments by date/time
                $query->where('appointment_date', '>', $this->appointment_date)
                    ->orWhere(function ($subQuery) {
                        // Same date but later time
                        $subQuery->where('appointment_date', $this->appointment_date)
                            ->where('appointment_time', '>', $this->appointment_time);
                    })
                    ->orWhere(function ($subQuery) {
                        // Same date and time, but created later (edge case)
                        $subQuery->where('appointment_date', $this->appointment_date)
                            ->where('appointment_time', $this->appointment_time)
                            ->where('created_at', '>', $this->created_at);
                    });
            })
            ->orderBy('appointment_date', 'asc')
            ->orderBy('appointment_time', 'asc')
            ->orderBy('created_at', 'asc')
            ->with(['patient', 'doctor', 'schedule', 'queue'])
            ->first();
    }

    /**
     * NEW: Get the latest appointment for the same patient-doctor combination
     */
    public function getLatestAppointmentInHistory()
    {
        return self::where('patient_id', $this->patient_id)
            ->where('doctor_id', $this->doctor_id)
            ->orderBy('appointment_date', 'desc')
            ->orderBy('appointment_time', 'desc')
            ->orderBy('created_at', 'desc')
            ->with(['patient', 'doctor', 'schedule', 'queue'])
            ->first();
    }

    /**
     * NEW: Check if this is the latest appointment in the history
     */
    public function isLatestInHistory()
    {
        $latest = $this->getLatestAppointmentInHistory();
        return $latest && $latest->id === $this->id;
    }

    /**
     * NEW: Get appointment viewing context for doctor examination
     * Enhanced version that considers appointment history
     */
    public function getAppointmentViewingContext()
    {
        $nextAppointment = $this->getNextAppointmentInSequence();
        $isLatest = $this->isLatestInHistory();

        // If this is the latest appointment, allow creating new appointment
        if ($isLatest) {
            return [
                'mode' => 'create_new',
                'appointment_to_show' => null,
                'can_edit' => true,
                'can_delete' => true,
                'message' => 'Ini adalah appointment terakhir. Anda dapat membuat appointment baru.',
                'show_history' => true
            ];
        }

        // If there's a next appointment, show it with appropriate permissions
        if ($nextAppointment) {
            $canEdit = $nextAppointment->canBeEdited();
            $canDelete = $nextAppointment->canBeDeleted();

            return [
                'mode' => 'show_next',
                'appointment_to_show' => $nextAppointment,
                'can_edit' => $canEdit,
                'can_delete' => $canDelete,
                'message' => $canEdit
                    ? 'Appointment selanjutnya dapat diedit karena masih berstatus "scheduled".'
                    : 'Appointment selanjutnya tidak dapat diedit karena sudah dikonfirmasi atau diselesaikan.',
                'show_history' => true
            ];
        }

        // Fallback (shouldn't happen, but just in case)
        return [
            'mode' => 'create_new',
            'appointment_to_show' => null,
            'can_edit' => true,
            'can_delete' => true,
            'message' => 'Tidak ada appointment selanjutnya. Anda dapat membuat appointment baru.',
            'show_history' => true
        ];
    }

    /**
     * NEW: Static method to get appointment viewing context for doctor
     */
    public static function getAppointmentContext($appointmentId, $doctorId)
    {
        $appointment = self::with(['patient', 'doctor', 'schedule', 'queue'])
            ->findOrFail($appointmentId);

        // Verify doctor ownership
        if ($appointment->doctor_id !== $doctorId) {
            throw new \Exception('Appointment ini bukan milik dokter yang sedang login.');
        }

        return $appointment->getAppointmentViewingContext();
    }

    /**
     * Check if this is the latest appointment for this patient-doctor combination
     */
    public function isLatestAppointment()
    {
        $latest = $this->getLatestAppointment();
        return $latest && $latest->id === $this->id;
    }

    /**
     * Check if appointment can be edited
     * Only appointments with 'scheduled' status can be edited
     */
    public function canBeEdited()
    {
        return $this->status === self::STATUS_SCHEDULED;
    }

    /**
     * Check if appointment can be deleted
     * Only appointments with 'scheduled' status can be deleted
     */
    public function canBeDeleted()
    {
        return $this->status === self::STATUS_SCHEDULED;
    }

    /**
     * Get appointment viewing permission for doctor examination
     * Returns array with permissions and appointment to show
     */
    public function getExaminationViewPermissions()
    {
        $nextAppointment = $this->getNextAppointment();

        // If no next appointment exists, allow creating new appointment
        if (!$nextAppointment) {
            return [
                'mode' => 'create_new',
                'appointment_to_show' => null,
                'can_edit' => true,
                'can_delete' => true,
                'message' => 'Tidak ada appointment selanjutnya. Anda dapat membuat appointment baru.'
            ];
        }

        // If next appointment exists, show it with appropriate permissions
        $canEdit = $nextAppointment->canBeEdited();
        $canDelete = $nextAppointment->canBeDeleted();

        return [
            'mode' => 'show_next',
            'appointment_to_show' => $nextAppointment,
            'can_edit' => $canEdit,
            'can_delete' => $canDelete,
            'message' => $canEdit
                ? 'Appointment selanjutnya dapat diedit karena masih berstatus "scheduled".'
                : 'Appointment selanjutnya tidak dapat diedit karena sudah dikonfirmasi atau diselesaikan.'
        ];
    }

    /**
     * Static method to get appointment examination context for doctor
     */
    public static function getExaminationContext($appointmentId, $doctorId)
    {
        $appointment = self::with(['patient', 'doctor', 'schedule', 'queue'])
            ->findOrFail($appointmentId);

        // Verify doctor ownership
        if ($appointment->doctor_id !== $doctorId) {
            throw new \Exception('Appointment ini bukan milik dokter yang sedang login.');
        }

        return $appointment->getExaminationViewPermissions();
    }
    /**
     * Get formatted datetime of the appointment
     */
    public function getFormattedDateTimeAttribute()
    {
        return Carbon::parse($this->appointment_date . ' ' . $this->appointment_time)
            ->format('l, d F Y - H:i');
    }

    /**
     * Get formatted date
     */
    public function getFormattedDateAttribute()
    {
        return Carbon::parse($this->appointment_date)->format('d/m/Y');
    }

    /**
     * Get formatted time
     */
    public function getFormattedTimeAttribute()
    {
        return Carbon::parse($this->appointment_time)->format('H:i');
    }

    /**
     * Scope a query to only include appointments for today
     */
    public function scopeToday($query)
    {
        return $query->whereDate('appointment_date', Carbon::today());
    }

    /**
     * Scope a query to only include upcoming appointments
     */
    public function scopeUpcoming($query)
    {
        return $query->whereDate('appointment_date', '>=', Carbon::today());
    }

    /**
     * Scope a query to only include past appointments
     */
    public function scopePast($query)
    {
        return $query->whereDate('appointment_date', '<', Carbon::today());
    }

    /**
     * Scope a query to filter by status
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for active appointments
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', self::getActiveStatuses());
    }

    /**
     * Scope for doctor
     */
    public function scopeForDoctor($query, $doctorId)
    {
        return $query->where('doctor_id', $doctorId);
    }

    /**
     * Scope for patient
     */
    public function scopeForPatient($query, $patientId)
    {
        return $query->where('patient_id', $patientId);
    }

    /**
     * Boot method
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($appointment) {
            // Set default status if not provided
            if (empty($appointment->status)) {
                $appointment->status = self::STATUS_SCHEDULED;
            }
        });
    }
}
