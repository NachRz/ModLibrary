<?php

namespace Database\Seeders;

use App\Models\Mod;
use App\Models\ModGuardado;
use App\Models\JuegoFavorito;
use App\Models\Usuario;
use App\Models\Juego;
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

        // Crear juegos favoritos de ejemplo
        $juegosFavoritos = [
            'usuario1' => ['The Witcher 3: Wild Hunt', 'Cyberpunk 2077'],
            'usuario2' => ['Grand Theft Auto V', 'The Witcher 3: Wild Hunt'],
            'usuario3' => ['Minecraft', 'Stardew Valley']
        ];

        foreach ($juegosFavoritos as $username => $juegosTitulos) {
            $usuario = Usuario::where('nome', $username)->first();
            
            if (!$usuario) {
                $this->command->error("Usuario '$username' no encontrado para juegos favoritos.");
                continue;
            }

            foreach ($juegosTitulos as $titulo) {
                $juego = Juego::where('titulo', $titulo)->first();
                
                if (!$juego) {
                    $this->command->info("Juego '$titulo' no encontrado, omitiendo.");
                    continue;
                }

                // Verificar si ya existe este favorito
                $existente = JuegoFavorito::where('usuario_id', $usuario->id)
                                          ->where('juego_id', $juego->id)
                                          ->exists();
                
                if (!$existente) {
                    JuegoFavorito::create([
                        'usuario_id' => $usuario->id,
                        'juego_id' => $juego->id,
                        'fecha_agregado' => now()->subDays(rand(0, 60))
                    ]);
                }
            }
        }

        $this->command->info('Juegos favoritos creados correctamente.');
    }
} 