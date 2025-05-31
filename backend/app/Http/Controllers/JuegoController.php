<?php

namespace App\Http\Controllers;

use App\Models\Juego;
use App\Models\Genero;
use App\Models\Usuario;
use App\Models\JuegoFavorito;
use App\Services\RawgService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class JuegoController extends Controller
{
    protected $rawgService;

    public function __construct(RawgService $rawgService)
    {
        $this->rawgService = $rawgService;
    }

    /**
     * Extraer y asociar géneros de un juego desde RAWG
     */
    private function extraerYAsociarGeneros(Juego $juego, array $gameData): void
    {
        try {
            $generosIds = [];

            // Verificar si el juego tiene géneros en los datos de RAWG
            if (isset($gameData['genres']) && is_array($gameData['genres'])) {
                foreach ($gameData['genres'] as $generoData) {
                    // Crear o actualizar el género sin duplicar
                    $genero = Genero::updateOrCreate(
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

            // Sincronizar la relación (esto reemplaza los géneros existentes del juego)
            $juego->generos()->sync($generosIds);

        } catch (\Exception $e) {
            // Silenciar errores para mantener consistencia con la limpieza de logs
        }
    }

    public function index()
    {
        $juegos = Juego::with('generos')->select([
            'id', 'titulo', 'imagen_fondo', 'mods_totales',
            'rating', 'fecha_lanzamiento'
        ])->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $juegos->map(function ($juego) {
                return [
                    'id' => $juego->id,
                    'titulo' => $juego->titulo,
                    'imagen_fondo' => $juego->imagen_fondo,
                    'total_mods' => $juego->mods_totales,
                    'rating' => $juego->rating,
                    'fecha_lanzamiento' => $juego->fecha_lanzamiento,
                    'generos' => $juego->generos
                ];
            })
        ]);
    }

    public function search(Request $request)
    {
        $query = $request->input('query');
        $page = $request->input('page', 1);
        $pageSize = $request->input('page_size', 20);

        $results = $this->rawgService->searchGames($query, $page, $pageSize);

        if (!$results) {
            return response()->json(['error' => 'Error al buscar juegos'], 500);
        }

        return response()->json($results);
    }

    public function syncGame($id)
    {
        $gameData = $this->rawgService->getGame($id);

        if (!$gameData) {
            return response()->json(['error' => 'Juego no encontrado'], 404);
        }

        $juego = Juego::updateOrCreate(
            ['rawg_id' => $id],
            [
                'slug' => $gameData['slug'],
                'titulo' => $gameData['name'],
                'titulo_original' => $gameData['name_original'],
                'descripcion' => $gameData['description'],
                'metacritic' => $gameData['metacritic'],
                'fecha_lanzamiento' => $gameData['released'],
                'tba' => $gameData['tba'],
                'actualizado' => $gameData['updated'],
                'imagen_fondo' => $gameData['background_image'],
                'imagen_fondo_adicional' => $gameData['background_image_additional'],
                'sitio_web' => $gameData['website'],
                'rating' => $gameData['rating'],
                'rating_top' => $gameData['rating_top'],
                'mods_totales' => 0
            ]
        );

        // Recalcular mods totales después de sincronizar
        $juego->recalcularModsTotales();

        // Extraer y asociar géneros
        $this->extraerYAsociarGeneros($juego, $gameData);

        return response()->json($juego);
    }

    public function show($id)
    {
        $juego = Juego::with('generos')->select([
            'id', 'titulo', 'descripcion', 'imagen_fondo',
            'mods_totales', 'rating', 'fecha_lanzamiento'
        ])->find($id);

        if (!$juego) {
            return response()->json(['error' => 'Juego no encontrado'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $juego->id,
                'titulo' => $juego->titulo,
                'descripcion' => $juego->descripcion,
                'imagen_fondo' => $juego->imagen_fondo,
                'total_mods' => $juego->mods_totales,
                'rating' => $juego->rating,
                'fecha_lanzamiento' => $juego->fecha_lanzamiento,
                'generos' => $juego->generos
            ]
        ]);
    }

    public function verifyAndSync($rawgId)
    {
        try {
            // Primero buscamos si el juego ya existe
            $juego = Juego::where('rawg_id', $rawgId)->first();

            // Si el juego ya existe, lo devolvemos
            if ($juego) {
                return response()->json([
                    'status' => 'success',
                    'data' => $juego,
                    'message' => 'Juego encontrado'
                ]);
            }

            // Si no existe, obtenemos los datos de RAWG y lo creamos
            $gameData = $this->rawgService->getGame($rawgId);

            if (!$gameData) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No se pudo obtener información del juego desde RAWG'
                ], 404);
            }

            // Crear el nuevo juego
            $juego = Juego::create([
                'rawg_id' => $rawgId,
                'slug' => $gameData['slug'],
                'titulo' => $gameData['name'],
                'titulo_original' => $gameData['name_original'],
                'descripcion' => $gameData['description'],
                'metacritic' => $gameData['metacritic'],
                'fecha_lanzamiento' => $gameData['released'],
                'tba' => $gameData['tba'],
                'actualizado' => $gameData['updated'],
                'imagen_fondo' => $gameData['background_image'],
                'imagen_fondo_adicional' => $gameData['background_image_additional'],
                'sitio_web' => $gameData['website'],
                'rating' => $gameData['rating'],
                'rating_top' => $gameData['rating_top'],
                'mods_totales' => 0
            ]);

            // Extraer y asociar géneros
            $this->extraerYAsociarGeneros($juego, $gameData);

            return response()->json([
                'status' => 'success',
                'data' => $juego,
                'message' => 'Juego creado exitosamente'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al procesar el juego: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener juegos favoritos del usuario autenticado
     */
    public function obtenerFavoritos()
    {
        try {
            /** @var Usuario $usuario */
            $usuario = Auth::user();
            
            if (!$usuario) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            $juegosFavoritos = $usuario->juegosFavoritos()
                ->select([
                    'juegos.id', 'juegos.titulo', 'juegos.imagen_fondo', 
                    'juegos.mods_totales', 'juegos.rating', 'juegos.fecha_lanzamiento'
                ])
                ->withPivot('fecha_agregado')
                ->orderBy('juegos_favoritos.fecha_agregado', 'desc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $juegosFavoritos->map(function ($juego) {
                    return [
                        'id' => $juego->id,
                        'titulo' => $juego->titulo,
                        'imagen_fondo' => $juego->imagen_fondo,
                        'total_mods' => $juego->mods_totales,
                        'rating' => $juego->rating,
                        'fecha_lanzamiento' => $juego->fecha_lanzamiento,
                        'fecha_agregado' => $juego->pivot->fecha_agregado
                    ];
                })
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener juegos favoritos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Agregar juego a favoritos
     */
    public function agregarFavorito(Request $request, $juegoId)
    {
        try {
            $usuario = Auth::user();
            
            if (!$usuario) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            // Verificar que el juego existe
            $juego = Juego::find($juegoId);
            if (!$juego) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Juego no encontrado'
                ], 404);
            }

            // Verificar si ya está en favoritos
            $yaEsFavorito = JuegoFavorito::where('usuario_id', $usuario->id)
                ->where('juego_id', $juegoId)
                ->exists();

            if ($yaEsFavorito) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'El juego ya está en favoritos'
                ], 409);
            }

            // Agregar a favoritos
            JuegoFavorito::create([
                'usuario_id' => $usuario->id,
                'juego_id' => $juegoId,
                'fecha_agregado' => now()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Juego agregado a favoritos exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al agregar juego a favoritos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Quitar juego de favoritos
     */
    public function quitarFavorito($juegoId)
    {
        try {
            $usuario = Auth::user();
            
            if (!$usuario) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            // Buscar y eliminar el favorito
            $favorito = JuegoFavorito::where('usuario_id', $usuario->id)
                ->where('juego_id', $juegoId)
                ->first();

            if (!$favorito) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'El juego no está en favoritos'
                ], 404);
            }

            $favorito->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Juego eliminado de favoritos exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al eliminar juego de favoritos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verificar si un juego está en favoritos
     */
    public function esFavorito($juegoId)
    {
        try {
            $usuario = Auth::user();
            
            if (!$usuario) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            $esFavorito = JuegoFavorito::where('usuario_id', $usuario->id)
                ->where('juego_id', $juegoId)
                ->exists();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'es_favorito' => $esFavorito
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al verificar favorito: ' . $e->getMessage()
            ], 500);
        }
    }
} 