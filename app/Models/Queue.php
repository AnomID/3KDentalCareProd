<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Queue extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'schedule_id',
        'appointment_date',
        'queue_number',
        'status',
        'notes',
        'is_active'
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'is_active' => 'boolean',
    ];

    // Status constants
    const STATUS_WAITING = 'waiting';
    const STATUS_PROCESSING = 'processing';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELED = 'canceled';
    const STATUS_NO_SHOW = 'no_show';

    /**
     * Get the patient that owns the queue.
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * Get the doctor that owns the queue.
     */
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    /**
     * Get the schedule that owns the queue.
     */
    public function schedule(): BelongsTo
    {
        return $this->belongsTo(Schedule::class);
    }

    /**
     * Scope a query to only include today's queues.
     */
    public function scopeToday($query)
    {
        return $query->whereDate('appointment_date', Carbon::today());
    }

    /**
     * Scope a query to only include active queues.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include waiting queues.
     */
    public function scopeWaiting($query)
    {
        return $query->where('status', self::STATUS_WAITING);
    }

    /**
     * Scope a query to only include processing queues.
     */
    public function scopeProcessing($query)
    {
        return $query->where('status', self::STATUS_PROCESSING);
    }

    /**
     * Scope a query to only include completed queues.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    /**
     * Scope a query to only include canceled queues.
     */
    public function scopeCanceled($query)
    {
        return $query->where('status', self::STATUS_CANCELED);
    }

    /**
     * Scope a query to only include no-show queues.
     */
    public function scopeNoShow($query)
    {
        return $query->where('status', self::STATUS_NO_SHOW);
    }

    /**
     * Get the formatted status for display
     */
    public function getFormattedStatusAttribute()
    {
        $statusMap = [
            self::STATUS_WAITING => 'Menunggu',
            self::STATUS_PROCESSING => 'Sedang Diproses',
            self::STATUS_COMPLETED => 'Selesai',
            self::STATUS_CANCELED => 'Dibatalkan',
            self::STATUS_NO_SHOW => 'Tidak Hadir',
        ];

        return $statusMap[$this->status] ?? $this->status;
    }

    /**
     * Get the status color for display
     */
    public function getStatusColorAttribute()
    {
        $colorMap = [
            self::STATUS_WAITING => 'blue',
            self::STATUS_PROCESSING => 'yellow',
            self::STATUS_COMPLETED => 'green',
            self::STATUS_CANCELED => 'red',
            self::STATUS_NO_SHOW => 'gray',
        ];

        return $colorMap[$this->status] ?? 'blue';
    }

    /**
     * Get the formatted queue number for display
     */
    public function getFormattedQueueNumberAttribute()
    {
        return 'A' . str_pad($this->queue_number, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Generate a queue number for a specific date and schedule
     */
    public static function generateQueueNumber($date, $scheduleId)
    {
        $lastQueue = self::where('schedule_id', $scheduleId)
            ->whereDate('appointment_date', $date)
            ->orderBy('queue_number', 'desc')
            ->first();

        return $lastQueue ? $lastQueue->queue_number + 1 : 1;
    }

    /**
     * Check if the queue can be canceled (only waiting queues can be canceled)
     */
    public function canBeCanceled()
    {
        return $this->status === self::STATUS_WAITING;
    }

    /**
     * Process the queue (change status from waiting to processing)
     */
    public function process()
    {
        if ($this->status !== self::STATUS_WAITING) {
            return false;
        }

        $this->status = self::STATUS_PROCESSING;
        return $this->save();
    }

    /**
     * Complete the queue (change status from processing to completed)
     */
    public function complete()
    {
        if ($this->status !== self::STATUS_PROCESSING) {
            return false;
        }

        $this->status = self::STATUS_COMPLETED;
        return $this->save();
    }

    /**
     * Cancel the queue (change status to canceled)
     */
    public function cancel()
    {
        if (!$this->canBeCanceled()) {
            return false;
        }

        $this->status = self::STATUS_CANCELED;
        return $this->save();
    }

    /**
     * Mark the queue as no-show
     */
    public function markAsNoShow()
    {
        if ($this->status !== self::STATUS_WAITING) {
            return false;
        }

        $this->status = self::STATUS_NO_SHOW;
        return $this->save();
    }
}
