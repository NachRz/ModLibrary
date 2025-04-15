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
            $numModsGuardados = rand(1, 3);
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