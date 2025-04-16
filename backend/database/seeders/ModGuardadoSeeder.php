<?php

namespace Database\Seeders;

use App\Models\Mod;
use App\Models\ModGuardado;
use App\Models\Usuario;
use Illuminate\Database\Seeder;

class ModGuardadoSeeder extends Seeder
{
    public function run()
    {
        $mods = Mod::all();
        $usuarios = Usuario::all();

        foreach ($usuarios as $usuario) {
            // Asegurarnos de no pedir más mods de los que existen
            $numModsGuardados = min(rand(1, 3), $mods->count());
            
            if ($numModsGuardados > 0) {
                $modsAleatorios = $mods->random($numModsGuardados);
                
                foreach ($modsAleatorios as $mod) {
                    ModGuardado::create([
                        'usuario_id' => $usuario->id,
                        'mod_id' => $mod->id,
                        'fecha_guardado' => now()->subDays(rand(0, 30))
                    ]);
                }
            }
        }
    }
} 