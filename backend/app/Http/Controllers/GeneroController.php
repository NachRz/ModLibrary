<?php

namespace App\Http\Controllers;

use App\Models\Genero;
use App\Models\Juego;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class GeneroController extends Controller
{
    private const RAWG_API_KEY = 'YOUR_RAWG_API_KEY_HERE'; // Cambiar por tu API key de RAWG
    private const RAWG_BASE_URL = 'https://api.rawg.io/api';

    /**
     * Obtener todos los géneros
     */
    public function index(): JsonResponse
    {
        $generos = Genero::orderBy('nombre')->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $generos
        ]);
    }

    /**
     * Sincronizar géneros desde RAWG
     */
    public function sincronizarDesdeRawg(): JsonResponse
    {
        try {
            $response = Http::get(self::RAWG_BASE_URL . '/genres', [
                'key' => self::RAWG_API_KEY,
                'page_size' => 40
            ]);

            if (!$response->successful()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Error al conectar con RAWG API'
                ], 500);
            }

            $data = $response->json();
            $generosCreados = 0;
            $generosActualizados = 0;

            foreach ($data['results'] as $generoData) {
                $genero = Genero::updateOrCreate(
                    ['rawg_id' => $generoData['id']],
                    [
                        'nombre' => $generoData['name'],
                        'slug' => $generoData['slug'],
                        'descripcion' => $generoData['description'] ?? null,
                        'imagen' => $generoData['image_background'] ?? null,
                        'games_count' => $generoData['games_count'] ?? 0
                    ]
                );

                if ($genero->wasRecentlyCreated) {
                    $generosCreados++;
                } else {
                    $generosActualizados++;
                }
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Géneros sincronizados correctamente',
                'data' => [
                    'creados' => $generosCreados,
                    'actualizados' => $generosActualizados,
                    'total' => $generosCreados + $generosActualizados
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al sincronizar géneros: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener juegos filtrados por género
     */
    public function getJuegosPorGenero(Request $request, int $generoId): JsonResponse
    {
        $genero = Genero::find($generoId);
        
        if (!$genero) {
            return response()->json([
                'status' => 'error',
                'message' => 'Género no encontrado'
            ], 404);
        }

        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 20);

        $juegos = $genero->juegos()
            ->with(['mods' => function($query) {
                $query->where('estado', 'publicado')->whereNull('deleted_at');
            }])
            ->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'status' => 'success',
            'data' => $juegos
        ]);
    }

    /**
     * Obtener juegos con filtros múltiples de géneros
     */
    public function getJuegosConFiltrosGeneros(Request $request): JsonResponse
    {
        $generosIds = $request->get('generos', []);
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 20);
        $ordenarPor = $request->get('ordenar_por', 'titulo'); // titulo, rating, mods_totales, fecha_lanzamiento
        $direccion = $request->get('direccion', 'asc'); // asc, desc

        $query = Juego::query();

        // Filtrar por géneros si se proporcionan
        if (!empty($generosIds)) {
            $query->whereHas('generos', function($q) use ($generosIds) {
                $q->whereIn('generos.id', $generosIds);
            });
        }

        // Incluir relaciones
        $query->with(['generos', 'mods' => function($q) {
            $q->where('estado', 'publicado')->whereNull('deleted_at');
        }]);

        // Ordenar
        switch ($ordenarPor) {
            case 'rating':
                $query->orderBy('rating', $direccion);
                break;
            case 'mods_totales':
                $query->orderBy('mods_totales', $direccion);
                break;
            case 'fecha_lanzamiento':
                $query->orderBy('fecha_lanzamiento', $direccion);
                break;
            default:
                $query->orderBy('titulo', $direccion);
        }

        $juegos = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'status' => 'success',
            'data' => $juegos
        ]);
    }

    /**
     * Sincronizar géneros de un juego específico desde RAWG
     */
    public function sincronizarGenerosJuego(int $juegoId): JsonResponse
    {
        try {
            $juego = Juego::find($juegoId);
            
            if (!$juego) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Juego no encontrado'
                ], 404);
            }

            $response = Http::get(self::RAWG_BASE_URL . '/games/' . $juego->rawg_id, [
                'key' => self::RAWG_API_KEY
            ]);

            if (!$response->successful()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Error al obtener datos del juego desde RAWG'
                ], 500);
            }

            $gameData = $response->json();
            $generosIds = [];

            if (isset($gameData['genres']) && is_array($gameData['genres'])) {
                foreach ($gameData['genres'] as $generoData) {
                    // Buscar o crear el género
                    $genero = Genero::firstOrCreate(
                        ['rawg_id' => $generoData['id']],
                        [
                            'nombre' => $generoData['name'],
                            'slug' => $generoData['slug'],
                            'games_count' => $generoData['games_count'] ?? 0
                        ]
                    );
                    
                    $generosIds[] = $genero->id;
                }
            }

            // Sincronizar la relación
            $juego->generos()->sync($generosIds);

            return response()->json([
                'status' => 'success',
                'message' => 'Géneros del juego sincronizados correctamente',
                'data' => [
                    'juego' => $juego->titulo,
                    'generos_sincronizados' => count($generosIds)
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al sincronizar géneros del juego: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de géneros
     */
    public function getEstadisticas(): JsonResponse
    {
        $estadisticas = Cache::remember('generos_estadisticas', 3600, function () {
            return [
                'total_generos' => Genero::count(),
                'generos_con_juegos' => Genero::whereHas('juegos')->count(),
                'genero_mas_popular' => Genero::withCount('juegos')
                    ->orderBy('juegos_count', 'desc')
                    ->first(),
                'generos_mas_populares' => Genero::withCount('juegos')
                    ->orderBy('juegos_count', 'desc')
                    ->limit(5)
                    ->get()
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $estadisticas
        ]);
    }
}
