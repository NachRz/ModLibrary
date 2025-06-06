<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RawgService
{
    protected $apiKey;
    protected $baseUrl = 'https://api.rawg.io/api';

    public function __construct()
    {
        $this->apiKey = config('services.rawg.api_key');
    }

    public function getGame($id)
    {
        try {
            $response = Http::get("{$this->baseUrl}/games/{$id}", [
                'key' => $this->apiKey
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Error al obtener juego de RAWG', [
                'status' => $response->status(),
                'response' => $response->json()
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Excepción al obtener juego de RAWG', [
                'error' => $e->getMessage()
            ]);

            return null;
        }
    }

    public function searchGames($query, $page = 1, $pageSize = 20)
    {
        try {
            $response = Http::get("{$this->baseUrl}/games", [
                'key' => $this->apiKey,
                'search' => $query,
                'page' => $page,
                'page_size' => $pageSize
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Error al buscar juegos en RAWG', [
                'status' => $response->status(),
                'response' => $response->json()
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Excepción al buscar juegos en RAWG', [
                'error' => $e->getMessage()
            ]);

            return null;
        }
    }

    public function getTag($id)
    {
        try {
            $response = Http::get("{$this->baseUrl}/tags/{$id}", [
                'key' => $this->apiKey
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Error al obtener etiqueta de RAWG', [
                'status' => $response->status(),
                'response' => $response->json()
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Excepción al obtener etiqueta de RAWG', [
                'error' => $e->getMessage()
            ]);

            return null;
        }
    }

    public function searchTags($query = '', $page = 1, $pageSize = 20)
    {
        try {
            $response = Http::get("{$this->baseUrl}/tags", [
                'key' => $this->apiKey,
                'search' => $query,
                'page' => $page,
                'page_size' => $pageSize
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Error al buscar etiquetas en RAWG', [
                'status' => $response->status(),
                'response' => $response->json()
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Excepción al buscar etiquetas en RAWG', [
                'error' => $e->getMessage()
            ]);

            return null;
        }
    }
}
