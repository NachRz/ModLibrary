<?php

namespace App\Http\Controllers;

use App\Models\Juego;
use App\Services\RawgService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class JuegoController extends Controller
{
    protected $rawgService;

    public function __construct(RawgService $rawgService)
    {
        $this->rawgService = $rawgService;
    }

    public function index()
    {
        $juegos = Juego::all();
        
        return response()->json([
            'status' => 'success',
            'data' => $juegos
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
                'rating_top' => $gameData['rating_top']
            ]
        );

        return response()->json($juego);
    }

    public function show($id)
    {
        $juego = Juego::where('rawg_id', $id)->first();

        if (!$juego) {
            return response()->json(['error' => 'Juego no encontrado'], 404);
        }

        return response()->json($juego);
    }
} 