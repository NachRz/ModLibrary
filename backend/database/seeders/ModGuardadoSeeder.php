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
        // Mapeo de nombres de mods guardados por usuario según el JSON
        $usuariosData = [
            'usuario1' => ['Nuevas Fronteras'],
            'usuario2' => ['Nuevas Fronteras'],
            'usuario3' => ['Nuevas Fronteras']
        ];

        foreach ($usuariosData as $username => $modTitulos) {
            $usuario = Usuario::where('nome', $username)->first();
            
            if (!$usuario) {
                $this->command->error("Usuario '$username' no encontrado.");
                continue;
            }

            foreach ($modTitulos as $titulo) {
                $mod = Mod::where('titulo', $titulo)->first();
                
                if (!$mod) {
                    $this->command->error("Mod '$titulo' no encontrado.");
                    continue;
                }

                // Verificar si ya existe este guardado
                $existente = ModGuardado::where('usuario_id', $usuario->id)
                                        ->where('mod_id', $mod->id)
                                        ->exists();
                
                if (!$existente) {
                    ModGuardado::create([
                        'usuario_id' => $usuario->id,
                        'mod_id' => $mod->id,
                        'fecha_guardado' => now()->subDays(rand(0, 30))
                    ]);
                }
            }
        }

        $this->command->info('Mods guardados creados correctamente.');
    }
} 