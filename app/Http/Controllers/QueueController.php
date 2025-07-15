<?php

namespace App\Http\Controllers;

use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Schedule;
use App\Models\ScheduleException;
use App\Models\Queue;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Carbon\Carbon;

class QueueController extends Controller
{
    /**
     * Display a listing of the queues.
     */
    public function index(Request $request)
    {
        $date = $request->input('date', now()->format('Y-m-d'));
        $doctorId = $request->input('doctor_id');
        $status = $request->input('status');

        $query = Queue::with(['patient', 'doctor', 'schedule'])
            ->whereDate('appointment_date', $date);

        if ($doctorId) {
            $query->where('doctor_id', $doctorId);
        }

        if ($status) {
            $query->where('status', $status);
        }

        $queues = $query->orderBy('queue_number')->paginate(15);
        $doctors = Doctor::orderBy('name')->get();

        $statusOptions = [
            Queue::STATUS_WAITING => 'Menunggu',
            Queue::STATUS_PROCESSING => 'Sedang Diproses',
            Queue::STATUS_COMPLETED => 'Selesai',
            Queue::STATUS_CANCELED => 'Dibatalkan',
            Queue::STATUS_NO_SHOW => 'Tidak Hadir',
        ];

        return Inertia::render('Admin/Queues/Index', [
            'queues' => $queues,
            'doctors' => $doctors,
            'statusOptions' => $statusOptions,
            'filters' => [
                'date' => $date,
                'doctor_id' => $doctorId,
                'status' => $status,
            ]
        ]);
    }

    /**
     * Show the form for creating a new queue.
     */
    public function create()
    {
        $patients = Patient::orderBy('name')->get();
        $doctors = Doctor::orderBy('name')->get();

        return Inertia::render('Admin/Queues/Create', [
            'patients' => $patients,
            'doctors' => $doctors,
        ]);
    }

    /**
     * Store a newly created queue in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:patients,id',
            'schedule_id' => 'required|exists:schedules,id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'notes' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $schedule = Schedule::with('doctor', 'scheduleQuota')->findOrFail($request->schedule_id);
        $appointmentDate = $request->appointment_date;

        // Check if the selected date matches the schedule's day of week
        $dayOfWeek = Carbon::parse($appointmentDate)->dayOfWeek;
        if ($dayOfWeek != $schedule->day_of_week) {
            return redirect()->back()
                ->withErrors(['date_mismatch' => 'Tanggal yang dipilih tidak sesuai dengan jadwal dokter.'])
                ->withInput();
        }

        // Check for schedule exceptions
        $hasException = ScheduleException::where('doctor_id', $schedule->doctor_id)
            ->where('exception_date_start', '<=', $appointmentDate)
            ->where('exception_date_end', '>=', $appointmentDate)
            ->exists();

        if ($hasException) {
            return redirect()->back()
                ->withErrors(['exception' => 'Dokter tidak tersedia pada tanggal tersebut karena ada pengecualian jadwal.'])
                ->withInput();
        }

        // Check available quota
        $bookedCount = Queue::where('schedule_id', $schedule->id)
            ->whereDate('appointment_date', $appointmentDate)
            ->whereNotIn('status', [Queue::STATUS_CANCELED])
            ->count();

        $quota = $schedule->scheduleQuota->quota;

        if ($bookedCount >= $quota) {
            return redirect()->back()
                ->withErrors(['quota' => 'Kuota untuk jadwal ini pada tanggal tersebut sudah penuh.'])
                ->withInput();
        }

        // Generate queue number
        $queueNumber = Queue::generateQueueNumber($appointmentDate, $schedule->id);

        // Create the queue
        $queue = Queue::create([
            'patient_id' => $request->patient_id,
            'doctor_id' => $schedule->doctor_id,
            'schedule_id' => $schedule->id,
            'appointment_date' => $appointmentDate,
            'queue_number' => $queueNumber,
            'status' => Queue::STATUS_WAITING,
            'notes' => $request->notes,
            'is_active' => true,
        ]);

        return redirect()->route('admin.queues.index', ['date' => $appointmentDate])
            ->with('success', 'Antrian berhasil dibuat dengan nomor: ' . $queue->formatted_queue_number);
    }

    /**
     * Display the specified queue.
     */
    public function show($id)
    {
        $queue = Queue::with(['patient', 'doctor', 'schedule'])->findOrFail($id);

        return Inertia::render('Admin/Queues/Show', [
            'queue' => $queue
        ]);
    }

    /**
     * Show the form for editing the specified queue.
     */
    public function edit($id)
    {
        $queue = Queue::findOrFail($id);
        $patients = Patient::orderBy('name')->get();

        // Only allow editing queues with waiting status
        if ($queue->status !== Queue::STATUS_WAITING) {
            return redirect()->route('admin.queues.show', $queue->id)
                ->with('error', 'Hanya antrian dengan status menunggu yang dapat diubah.');
        }

        return Inertia::render('Admin/Queues/Edit', [
            'queue' => $queue,
            'patients' => $patients,
        ]);
    }

    /**
     * Update the specified queue in storage.
     */
    public function update(Request $request, $id)
    {
        $queue = Queue::findOrFail($id);

        // Only allow updating queues with waiting status
        if ($queue->status !== Queue::STATUS_WAITING) {
            return redirect()->route('admin.queues.show', $queue->id)
                ->with('error', 'Hanya antrian dengan status menunggu yang dapat diubah.');
        }

        $validator = Validator::make($request->all(), [
            'patient_id' => 'required|exists:patients,id',
            'notes' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        // Update the queue
        $queue->update([
            'patient_id' => $request->patient_id,
            'notes' => $request->notes,
        ]);

        return redirect()->route('admin.queues.show', $queue->id)
            ->with('success', 'Antrian berhasil diperbarui.');
    }

    /**
     * Remove the specified queue from storage.
     */
    public function destroy($id)
    {
        $queue = Queue::findOrFail($id);

        // Only allow deleting queues with waiting status
        if ($queue->status !== Queue::STATUS_WAITING) {
            return redirect()->route('admin.queues.show', $queue->id)
                ->with('error', 'Hanya antrian dengan status menunggu yang dapat dihapus.');
        }

        $queue->delete();

        return redirect()->route('admin.queues.index', ['date' => $queue->appointment_date->format('Y-m-d')])
            ->with('success', 'Antrian berhasil dihapus.');
    }

    /**
     * Update queue status.
     */
    public function updateStatus(Request $request, $id)
    {
        $queue = Queue::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:' . implode(',', [
                Queue::STATUS_WAITING,
                Queue::STATUS_PROCESSING,
                Queue::STATUS_COMPLETED,
                Queue::STATUS_CANCELED,
                Queue::STATUS_NO_SHOW,
            ]),
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        // Update the queue status
        $queue->status = $request->status;
        $queue->save();

        return redirect()->back()
            ->with('success', 'Status antrian berhasil diperbarui.');
    }

    /**
     * Process the next queue for a doctor on a specific date.
     */
    public function processNext(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'doctor_id' => 'required|exists:doctors,id',
            'date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        // Check if there's already a queue being processed
        $processingQueue = Queue::where('doctor_id', $request->doctor_id)
            ->whereDate('appointment_date', $request->date)
            ->where('status', Queue::STATUS_PROCESSING)
            ->first();

        if ($processingQueue) {
            return redirect()->back()
                ->with('error', 'Ada antrian yang sedang diproses. Selesaikan antrian tersebut terlebih dahulu.');
        }

        // Get the next waiting queue with the lowest queue number
        $nextQueue = Queue::where('doctor_id', $request->doctor_id)
            ->whereDate('appointment_date', $request->date)
            ->where('status', Queue::STATUS_WAITING)
            ->orderBy('queue_number')
            ->first();

        if (!$nextQueue) {
            return redirect()->back()
                ->with('error', 'Tidak ada antrian yang menunggu.');
        }

        // Process the next queue
        $nextQueue->status = Queue::STATUS_PROCESSING;
        $nextQueue->save();

        return redirect()->back()
            ->with('success', 'Antrian nomor ' . $nextQueue->formatted_queue_number . ' sedang diproses.');
    }

    /**
     * Complete the currently processing queue for a doctor on a specific date.
     */
    public function completeProcessing(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'doctor_id' => 'required|exists:doctors,id',
            'date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        // Find the queue that's currently being processed
        $processingQueue = Queue::where('doctor_id', $request->doctor_id)
            ->whereDate('appointment_date', $request->date)
            ->where('status', Queue::STATUS_PROCESSING)
            ->first();

        if (!$processingQueue) {
            return redirect()->back()
                ->with('error', 'Tidak ada antrian yang sedang diproses.');
        }

        // Complete the queue
        $processingQueue->status = Queue::STATUS_COMPLETED;
        $processingQueue->save();

        return redirect()->back()
            ->with('success', 'Antrian nomor ' . $processingQueue->formatted_queue_number . ' telah selesai.');
    }

    /**
     * Get available dates for a specific doctor for appointment.
     */
    public function getAvailableDates(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'doctor_id' => 'required|exists:doctors,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
            ], 422);
        }

        $doctorId = $request->doctor_id;
        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);

        $doctor = Doctor::findOrFail($doctorId);
        $schedules = $doctor->schedules()->where('status', true)->get();

        if ($schedules->isEmpty()) {
            return response()->json([
                'available_dates' => [],
                'message' => 'Dokter tidak memiliki jadwal aktif.',
            ]);
        }

        $availableDates = [];
        $current = $startDate->copy();

        while ($current <= $endDate) {
            $currentDayOfWeek = $current->dayOfWeek;

            // Check if doctor has schedule on this day of week
            $hasScheduleOnDay = $schedules->contains('day_of_week', $currentDayOfWeek);

            if ($hasScheduleOnDay) {
                // Check for exceptions
                $hasException = ScheduleException::where('doctor_id', $doctorId)
                    ->where('exception_date_start', '<=', $current->format('Y-m-d'))
                    ->where('exception_date_end', '>=', $current->format('Y-m-d'))
                    ->exists();

                if (!$hasException) {
                    // Get all schedules for this day of week
                    $daySchedules = $schedules->where('day_of_week', $currentDayOfWeek);

                    // Check quota availability for each schedule
                    foreach ($daySchedules as $schedule) {
                        $quota = $schedule->scheduleQuota->quota;
                        $bookedCount = Queue::where('schedule_id', $schedule->id)
                            ->whereDate('appointment_date', $current->format('Y-m-d'))
                            ->whereNotIn('status', [Queue::STATUS_CANCELED])
                            ->count();

                        if ($bookedCount < $quota) {
                            $availableDates[] = [
                                'date' => $current->format('Y-m-d'),
                                'day_name' => $this->getDayName($currentDayOfWeek),
                                'has_available_quota' => true,
                            ];
                            break; // Add date once if any schedule has available quota
                        }
                    }
                }
            }

            $current->addDay();
        }

        return response()->json([
            'available_dates' => $availableDates,
        ]);
    }

    /**
     * API Endpoint: Get today's active queues for a doctor.
     */
    public function getTodayQueues(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'doctor_id' => 'required|exists:doctors,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
            ], 422);
        }

        $doctorId = $request->doctor_id;
        $today = now()->format('Y-m-d');

        $queues = Queue::with('patient')
            ->where('doctor_id', $doctorId)
            ->whereDate('appointment_date', $today)
            ->orderBy('queue_number')
            ->get();

        $waiting = $queues->where('status', Queue::STATUS_WAITING)->values();
        $processing = $queues->where('status', Queue::STATUS_PROCESSING)->values();
        $completed = $queues->where('status', Queue::STATUS_COMPLETED)->values();
        $canceled = $queues->where('status', Queue::STATUS_CANCELED)->values();
        $noShow = $queues->where('status', Queue::STATUS_NO_SHOW)->values();

        $doctor = Doctor::findOrFail($doctorId);
        $schedules = $doctor->schedules()
            ->where('day_of_week', now()->dayOfWeek)
            ->where('status', true)
            ->get();

        return response()->json([
            'doctor' => $doctor->only(['id', 'name', 'specialization']),
            'date' => $today,
            'day_name' => $this->getDayName(now()->dayOfWeek),
            'schedules' => $schedules,
            'queues' => [
                'waiting' => $waiting,
                'processing' => $processing,
                'completed' => $completed,
                'canceled' => $canceled,
                'no_show' => $noShow,
            ],
            'stats' => [
                'total' => $queues->count(),
                'waiting_count' => $waiting->count(),
                'processing_count' => $processing->count(),
                'completed_count' => $completed->count(),
                'canceled_count' => $canceled->count(),
                'no_show_count' => $noShow->count(),
            ]
        ]);
    }

    /**
     * Helper method to get Indonesian day name
     */
    private function getDayName($dayOfWeek)
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
