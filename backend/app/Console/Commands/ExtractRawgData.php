<?php

namespace App\Console\Commands;

use App\Services\RawgApiService;
use Illuminate\Console\Command;
use App\Models\Game;
use App\Models\Genre;
use App\Models\Platform;
use App\Models\Developer;
use App\Models\Publisher;
use Illuminate\Support\Facades\Log;

class ExtractRawgData extends Command
{
    protected $signature = 'rawg:extract {--pages=1}';
    protected $description = 'Extrae datos de juegos de la API de RAWG';

    protected $rawgService;

    public function __construct(RawgApiService $rawgService)
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
            $games = $this->rawgService->getGames($page);

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
            $gameDetails = $this->rawgService->getGameDetails($gameData['id']);
            if (!$gameDetails) {
                $this->error("No se pudieron obtener detalles del juego {$gameData['id']}");
                return;
            }

            // Crear o actualizar el juego
            $game = Game::updateOrCreate(
                ['rawg_id' => $gameData['id']],
                [
                    'title' => $gameData['name'],
                    'description' => $gameDetails['description_raw'] ?? $gameData['description'],
                    'release_date' => $gameData['released'],
                    'rating' => $gameData['rating'],
                    'background_image' => $gameData['background_image'],
                    'website' => $gameDetails['website'] ?? null,
                    'metacritic' => $gameData['metacritic'] ?? null,
                ]
            );

            // Procesar géneros
            if (isset($gameData['genres'])) {
                foreach ($gameData['genres'] as $genreData) {
                    $genre = Genre::firstOrCreate(
                        ['rawg_id' => $genreData['id']],
                        ['name' => $genreData['name']]
                    );
                    $game->genres()->syncWithoutDetaching([$genre->id]);
                }
            }

            // Procesar plataformas
            if (isset($gameData['platforms'])) {
                foreach ($gameData['platforms'] as $platformData) {
                    $platform = Platform::firstOrCreate(
                        ['rawg_id' => $platformData['platform']['id']],
                        ['name' => $platformData['platform']['name']]
                    );
                    $game->platforms()->syncWithoutDetaching([$platform->id]);
                }
            }

            // Procesar desarrolladores
            if (isset($gameDetails['developers'])) {
                foreach ($gameDetails['developers'] as $developerData) {
                    $developer = Developer::firstOrCreate(
                        ['rawg_id' => $developerData['id']],
                        ['name' => $developerData['name']]
                    );
                    $game->developers()->syncWithoutDetaching([$developer->id]);
                }
            }

            // Procesar editores
            if (isset($gameDetails['publishers'])) {
                foreach ($gameDetails['publishers'] as $publisherData) {
                    $publisher = Publisher::firstOrCreate(
                        ['rawg_id' => $publisherData['id']],
                        ['name' => $publisherData['name']]
                    );
                    $game->publishers()->syncWithoutDetaching([$publisher->id]);
                }
            }

            $this->info("Juego procesado: {$game->title}");
        } catch (\Exception $e) {
            Log::error('Error al procesar juego', [
                'game_id' => $gameData['id'],
                'error' => $e->getMessage()
            ]);
            $this->error("Error al procesar juego {$gameData['id']}: {$e->getMessage()}");
        }
    }
} 