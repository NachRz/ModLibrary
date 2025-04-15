<?php

namespace App\Console\Commands;

use App\Services\RawgService;
use Illuminate\Console\Command;
use App\Models\Juego;
use Illuminate\Support\Facades\Log;

class ExtractRawgData extends Command
{
    protected $signature = 'rawg:extract {--pages=1}';
    protected $description = 'Extrae datos de juegos de la API de RAWG';

    protected $rawgService;

    public function __construct(RawgService $rawgService)
    {
        parent::__construct();
        $this->rawgService = $rawgService;
    }

    public function handle()
    {
        $pages = $this->option('pages');
        $this->info("Iniciando extracción de datos de RAWG API...");

        for ($page = 1; $page <= $pages; $page++) {
            $this->info("Procesando página {$page} de {$pages}...");
            $games = $this->rawgService->searchGames('', $page);

            if (!$games || !isset($games['results'])) {
                $this->error("No se pudieron obtener juegos de la página {$page}");
                continue;
            }

            foreach ($games['results'] as $gameData) {
                $this->processGame($gameData);
            }
        }

        $this->info('Extracción de datos completada.');
    }

    protected function processGame($gameData)
    {
        try {
            // Obtener detalles completos del juego
            $gameDetails = $this->rawgService->getGame($gameData['id']);
            if (!$gameDetails) {
                $this->error("No se pudieron obtener detalles del juego {$gameData['id']}");
                return;
            }

            // Crear o actualizar el juego
            $juego = Juego::updateOrCreate(
                ['rawg_id' => $gameData['id']],
                [
                    'slug' => $gameData['slug'] ?? null,
                    'titulo' => $gameData['name'] ?? 'Sin título',
                    'titulo_original' => $gameData['name_original'] ?? $gameData['name'] ?? 'Sin título original',
                    'descripcion' => $gameDetails['description'] ?? 'Sin descripción',
                    'metacritic' => $gameData['metacritic'] ?? null,
                    'fecha_lanzamiento' => $gameData['released'] ?? null,
                    'tba' => $gameData['tba'] ?? false,
                    'actualizado' => $gameData['updated'] ?? now(),
                    'imagen_fondo' => $gameData['background_image'] ?? null,
                    'imagen_fondo_adicional' => $gameData['background_image_additional'] ?? null,
                    'sitio_web' => $gameData['website'] ?? null,
                    'rating' => $gameData['rating'] ?? 0,
                    'rating_top' => $gameData['rating_top'] ?? 0
                ]
            );

            $this->info("Juego procesado: {$juego->titulo}");
        } catch (\Exception $e) {
            Log::error('Error al procesar juego', [
                'game_id' => $gameData['id'],
                'error' => $e->getMessage()
            ]);
            $this->error("Error al procesar juego {$gameData['id']}: {$e->getMessage()}");
        }
    }
} 