<?php

namespace App\Console\Commands;

use App\Models\Mod;
use Illuminate\Console\Command;

class ActualizarNumValoraciones extends Command
{
    /**
     * El nombre y la firma del comando.
     *
     * @var string
     */
    protected $signature = 'mods:actualizar-estadisticas';

    /**
     * La descripción del comando.
     *
     * @var string
     */
    protected $description = 'Actualiza los campos num_valoraciones y val_media para todos los mods';

    /**
     * Ejecuta el comando.
     */
    public function handle()
    {
        $this->info('Actualizando estadísticas para todos los mods...');

        $mods = Mod::all();
        $count = 0;

        foreach ($mods as $mod) {
            $mod->actualizarValMedia();
            $count++;
        }

        $this->info("¡Completado! Se han actualizado {$count} mods.");

        return Command::SUCCESS;
    }
}
