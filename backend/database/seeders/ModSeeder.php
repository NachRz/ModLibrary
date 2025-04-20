<?php

namespace Database\Seeders;

use App\Models\Mod;
use App\Models\Juego;
use App\Models\Usuario;
use App\Models\Etiqueta;
use App\Models\VersionMod;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use App\Services\RawgService;

class ModSeeder extends Seeder
{
    protected $rawgService;

    public function __construct(RawgService $rawgService)
    {
        $this->rawgService = $rawgService;
    }

    public function run()
    {
        // Cargar datos del JSON
        $jsonPath = base_path('resources/assets/data/mods.json');
        $jsonData = json_decode(File::get($jsonPath), true);
        $mods = $jsonData['mods'];

        // Obtener usuarios
        $usuarios = Usuario::whereIn('nome', ['usuario1', 'usuario2', 'usuario3'])->get()->keyBy('nome');

        if ($usuarios->count() < 3) {
            $this->command->error('Los usuarios necesarios no existen. Ejecute el seeder de usuarios primero.');
            return;
        }

        // Primero, recopilar información sobre juegos de los mods
        $juegosInfo = [];
        foreach ($mods as $modData) {
            $juegoNombre = $modData['Juego'];
            if (!isset($juegosInfo[$juegoNombre])) {
                $juegosInfo[$juegoNombre] = [
                    'nombre' => $juegoNombre,
                    'edad_recomendada' => $modData['EdadRecomendada'] ?? 16
                ];
            }
        }

        // Crear juegos si no existen
        $juegosMap = [];
        $this->command->info('Obteniendo información de juegos desde RAWG API...');
        
        $progressBar = $this->command->getOutput()->createProgressBar(count($juegosInfo));
        $progressBar->start();

        foreach ($juegosInfo as $juegoNombre => $juegoInfo) {
            // Buscar el juego en RAWG API para obtener su ID real
            $rawgId = null;
            $rawgData = null;
            
            $searchResults = $this->rawgService->searchGames($juegoNombre);
            if ($searchResults && isset($searchResults['results']) && count($searchResults['results']) > 0) {
                // Tomar el primer resultado que coincide mejor con el nombre
                $rawgData = $searchResults['results'][0];
                $rawgId = $rawgData['id'];
            }
            
            $juego = Juego::firstOrCreate(
                ['titulo' => $juegoNombre],
                [
                    'slug' => $rawgData['slug'] ?? strtolower(str_replace(' ', '-', $juegoNombre)),
                    'rawg_id' => $rawgId ?? 10000 + rand(1, 9999), // Usar ID real o uno provisional si no se encuentra
                    'titulo_original' => $rawgData['name'] ?? $juegoNombre,
                    'descripcion' => $rawgData['description'] ?? 'Descripción generada automáticamente para ' . $juegoNombre,
                    'metacritic' => $rawgData['metacritic'] ?? rand(60, 95),
                    'fecha_lanzamiento' => isset($rawgData['released']) ? \Carbon\Carbon::parse($rawgData['released']) : now()->subYears(rand(1, 5)),
                    'tba' => $rawgData['tba'] ?? false,
                    'actualizado' => now(),
                    'imagen_fondo' => $rawgData['background_image'] ?? 'default_background.jpg',
                    'sitio_web' => $rawgData['website'] ?? 'https://www.ejemplo.com/' . strtolower(str_replace(' ', '-', $juegoNombre)),
                    'rating' => $rawgData['rating'] ?? (rand(30, 50) / 10),
                    'rating_top' => $rawgData['rating_top'] ?? 5
                ]
            );
            
            $juegosMap[$juegoNombre] = $juego;
            $progressBar->advance();
        }
        
        $progressBar->finish();
        $this->command->newLine(2);
        $this->command->info('Creando mods...');

        // Ahora, procesar los mods usando los juegos ya creados
        foreach ($mods as $modData) {
            // Determinar el creador basado en el campo 'Creador'
            $creadorNombre = $modData['Creador'] ?? 'usuario1';
            $creador = $usuarios->has($creadorNombre) ? $usuarios[$creadorNombre] : $usuarios['usuario1'];

            // Obtener el juego ya creado
            $juego = $juegosMap[$modData['Juego']];

            // Crear el mod
            $mod = Mod::create([
                'titulo' => $modData['Titulo'],
                'imagen' => $modData['Imagen'],
                'edad_recomendada' => $modData['EdadRecomendada'],
                'juego_id' => $juego->id,
                'version_juego_necesaria' => $modData['VersionJuegoNecesaria'],
                'version_actual' => $modData['VersionActual'],
                'url' => $modData['Url'],
                'creador_id' => $creador->id,
                'descripcion' => $modData['Descripcion'],
                'estado' => $modData['Estado'],
                'total_descargas' => $modData['NumDescargas']
            ]);

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
        
        $this->command->info('Seeder de mods completado con éxito.');
    }
} 