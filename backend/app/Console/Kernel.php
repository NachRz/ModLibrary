<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected $commands = [
        Commands\ExtractRawgData::class,
        Commands\ActualizarNumValoraciones::class,
        Commands\RecalcularModsTotales::class,
    ];

    protected function schedule(Schedule $schedule)
    {
        // Recalcular mods totales cada día a las 3 AM
        $schedule->command('mods:recalcular-totales')->dailyAt('03:00');
    }

    protected function commands()
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
