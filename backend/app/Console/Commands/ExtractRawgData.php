<?php

namespace App\Console\Commands;

use App\Services\RawgService;
use Illuminate\Console\Command;
use App\Models\Juego;
use App\Models\Etiqueta;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;

class ExtractRawgData extends Command
{
    protected $signature = 'rawg:extract {--pages=1}';
    protected $description = 'Extrae datos de juegos y etiquetas de la API de RAWG';

    protected $rawgService;

    public function __construct(RawgService $rawgService)
    {
        parent::__construct();
        $this->rawgService = $rawgService;
    }

    public function handle()
    {
        $this->extractTags();
        $this->extractGames();
    }

    protected function extractTags()
    {
        $this->info("\nIniciando extracción de etiquetas desde RAWG API...");

        // Cargar el JSON de mods para obtener las etiquetas únicas
        $jsonPath = base_path('resources/assets/data/mods.json');
        $jsonData = json_decode(File::get($jsonPath), true);

        // Recopilar todas las etiquetas únicas
        $etiquetasUnicas = collect();
        foreach ($jsonData['mods'] as $mod) {
            if (isset($mod['Etiquetas']) && is_array($mod['Etiquetas'])) {
                foreach ($mod['Etiquetas'] as $etiqueta) {
                    // Si la etiqueta es un string, lo usamos directamente
                    $nombreEtiqueta = is_array($etiqueta) ? $etiqueta['nombre'] : $etiqueta;
                    $etiquetasUnicas->push($nombreEtiqueta);
                }
            }
        }
        $etiquetasUnicas = $etiquetasUnicas->unique()->values();

        $this->info("Se encontraron " . $etiquetasUnicas->count() . " etiquetas únicas.");
        $bar = $this->output->createProgressBar($etiquetasUnicas->count());
        $bar->start();

        foreach ($etiquetasUnicas as $nombreEtiqueta) {
            try {
                // Buscar la etiqueta en RAWG
                $results = $this->rawgService->searchTags($nombreEtiqueta);

                if ($results && isset($results['results']) && count($results['results']) > 0) {
                    // Intentar encontrar una coincidencia exacta primero
                    $tagMatch = collect($results['results'])->first(function ($tag) use ($nombreEtiqueta) {
                        return strtolower($tag['name']) === strtolower($nombreEtiqueta);
                    });

                    // Si no hay coincidencia exacta, usar el primer resultado
                    if (!$tagMatch) {
                        $tagMatch = $results['results'][0];
                    }

                    // Crear o actualizar la etiqueta en la base de datos
                    Etiqueta::updateOrCreate(
                        ['rawg_id' => $tagMatch['id']],
                        ['nombre' => $tagMatch['name']]
                    );

                    $this->info("\nEtiqueta sincronizada: {$nombreEtiqueta} -> {$tagMatch['name']} (ID: {$tagMatch['id']})");
                } else {
                    $this->warn("\nNo se encontró la etiqueta en RAWG: {$nombreEtiqueta}");
                }
            } catch (\Exception $e) {
                $this->error("\nError al procesar la etiqueta {$nombreEtiqueta}: " . $e->getMessage());
                Log::error("Error al procesar etiqueta", [
                    'etiqueta' => $nombreEtiqueta,
                    'error' => $e->getMessage()
                ]);
            }

            $bar->advance();
        }

        $bar->finish();
        $this->info("\nProceso de extracción de etiquetas completado.");
    }

    protected function extractGames()
    {
        $pages = $this->option('pages');
        $this->info("\nIniciando extracción de datos de juegos de RAWG API...");

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

        $this->info('Extracción de datos de juegos completada.');
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
