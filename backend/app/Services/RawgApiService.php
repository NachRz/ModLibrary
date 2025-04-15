<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RawgApiService
{
    protected $baseUrl = 'https://api.rawg.io/api';
    protected $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.rawg.api_key');
    }

    public function getGames($page = 1, $pageSize = 20)
    {
        try {
            $response = Http::get("{$this->baseUrl}/games", [
                'key' => $this->apiKey,
                'page' => $page,
                'page_size' => $pageSize,
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Error al obtener juegos de RAWG API', [
                'status' => $response->status(),
                'response' => $response->json()
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Excepción al obtener juegos de RAWG API', [
                'message' => $e->getMessage()
            ]);
            return null;
        }
    }

    public function getGameDetails($gameId)
    {
        try {
            $response = Http::get("{$this->baseUrl}/games/{$gameId}", [
                'key' => $this->apiKey
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Error al obtener detalles del juego de RAWG API', [
                'game_id' => $gameId,
                'status' => $response->status(),
                'response' => $response->json()
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Excepción al obtener detalles del juego de RAWG API', [
                'game_id' => $gameId,
                'message' => $e->getMessage()
            ]);
            return null;
        }
    }
} 