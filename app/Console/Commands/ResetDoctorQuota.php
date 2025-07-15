<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
class ResetDoctorQuota extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:reset-doctor-quota';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        DB::table('schedules')->update([
            'remaining_quota' => DB::raw('quota') // Reset kuota ke nilai awal
        ]);

        $this->info('Doctor quotas have been reset.');
    }
}
