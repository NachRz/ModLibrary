<?php

namespace App\Console\Commands;

use App\Models\Juego;
use Illuminate\Console\Command;

class RecalcularModsTotales extends Command
{
    protected $signature = 'mods:recalcular-totales';
    protected $description = 'Recalcula el total de mods para todos los juegos';

    public function handle()
    {
        $this->info('Iniciando recálculo de mods totales...');
        
        $juegos = Juego::all();
        $bar = $this->output->createProgressBar(count($juegos));
        $bar->start();

        foreach ($juegos as $juego) {
            $totalAnterior = $juego->mods_totales;
            $juego->recalcularModsTotales();
            
            if ($totalAnterior !== $juego->mods_totales) {
                $this->line(
                    "\n<fg=yellow>Juego '{$juego->titulo}': " .
                    "actualizado de {$totalAnterior} a {$juego->mods_totales} mods</>"
                );
            }
            
            $bar->advance();
        }

        $bar->finish();
        $this->info("\n¡Recálculo completado!");
    }
} 