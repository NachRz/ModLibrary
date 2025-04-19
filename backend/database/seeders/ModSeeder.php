<?php

namespace Database\Seeders;

use App\Models\Mod;
use App\Models\Juego;
use App\Models\Usuario;
use App\Models\Etiqueta;
use App\Models\VersionMod;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class ModSeeder extends Seeder
{
    public function run()
    {
        // Cargar datos del JSON
        $jsonPath = base_path('resources/assets/data/mods.json');
        $jsonData = json_decode(File::get($jsonPath), true);
        $mods = $jsonData['mods'];

        // Obtener usuarios
        $usuario1 = Usuario::where('nome', 'usuario1')->first();
        $usuario2 = Usuario::where('nome', 'usuario2')->first();
        $usuario3 = Usuario::where('nome', 'usuario3')->first();

        if (!$usuario1 || !$usuario2 || !$usuario3) {
            $this->command->error('Los usuarios necesarios no existen. Ejecute el seeder de usuarios primero.');
            return;
        }

        // Procesar cada mod
        foreach ($mods as $modData) {
            // Verificar si el juego existe, si no, crearlo
            $juego = Juego::firstOrCreate(
                ['titulo' => $modData['Juego']],
                [
                    'slug' => strtolower(str_replace(' ', '-', $modData['Juego'])),
                    'rawg_id' => 10000 + rand(1, 9999), // ID provisional
                    'titulo_original' => $modData['Juego'],
                    'descripcion' => 'Descripción generada automáticamente para ' . $modData['Juego'],
                    'metacritic' => rand(60, 95),
                    'fecha_lanzamiento' => now()->subYears(rand(1, 5)),
                    'tba' => false,
                    'actualizado' => now(),
                    'imagen_fondo' => 'default_background.jpg',
                    'sitio_web' => 'https://www.ejemplo.com/' . strtolower(str_replace(' ', '-', $modData['Juego'])),
                    'rating' => rand(30, 50) / 10,
                    'rating_top' => 5
                ]
            );

            // Determinar el creador basado en el campo 'Creador'
            $creador = null;
            switch($modData['Creador']) {
                case 'usuario1':
                    $creador = $usuario1;
                    break;
                case 'usuario2':
                    $creador = $usuario2;
                    break;
                case 'usuario3':
                    $creador = $usuario3;
                    break;
                default:
                    $creador = $usuario1; // Default a usuario1 si no coincide
            }

            // Crear o actualizar el mod
            $mod = Mod::firstOrCreate(
                ['titulo' => $modData['Titulo']],
                [
                    'imagen' => $modData['Imagen'],
                    'edad_recomendada' => $modData['EdadRecomendada'],
                    'juego_id' => $juego->id,
                    'version_juego_necesaria' => $modData['VersionJuegoNecesaria'],
                    'version_actual' => $modData['VersionActual'],
                    'url' => $modData['Url'],
                    'creador_id' => $creador->id,
                    'descripcion' => $modData['Descripcion']
                ]
            );

            // Crear versiones
            // Versión actual
            VersionMod::firstOrCreate(
                [
                    'mod_id' => $mod->id,
                    'version' => $modData['VersionActual']
                ],
                [
                    'fecha_lanzamiento' => now()->subDays(rand(1, 30))
                ]
            );

            // Versiones anteriores
            if (isset($modData['VersionesAnteriores']) && is_array($modData['VersionesAnteriores'])) {
                foreach ($modData['VersionesAnteriores'] as $version) {
                    VersionMod::firstOrCreate(
                        [
                            'mod_id' => $mod->id,
                            'version' => $version
                        ],
                        [
                            'fecha_lanzamiento' => now()->subDays(rand(31, 365))
                        ]
                    );
                }
            }

            // Procesar etiquetas
            if (isset($modData['Etiquetas']) && is_array($modData['Etiquetas'])) {
                foreach ($modData['Etiquetas'] as $etiquetaNombre) {
                    // Crear o encontrar la etiqueta
                    $etiqueta = Etiqueta::firstOrCreate(['nombre' => $etiquetaNombre]);
                    
                    // Asociar al mod (usando sync para no duplicar)
                    $mod->etiquetas()->syncWithoutDetaching([$etiqueta->id]);
                }
            }
        }
    }
} 