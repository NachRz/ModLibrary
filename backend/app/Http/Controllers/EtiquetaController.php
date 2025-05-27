<?php

namespace App\Http\Controllers;

use App\Models\Etiqueta;
use App\Services\RawgService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Response;

class EtiquetaController extends Controller
{
    protected $rawgService;

    public function __construct(RawgService $rawgService)
    {
        $this->rawgService = $rawgService;
    }

    public function index()
    {
        return Response::json(Etiqueta::all());
    }

    public function show($id)
    {
        $etiqueta = Etiqueta::findOrFail($id);
        return Response::json($etiqueta);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'rawg_id' => 'required|integer|unique:etiquetas'
        ]);

        $etiqueta = Etiqueta::create($request->all());
        return Response::json($etiqueta, 201);
    }

    public function update(Request $request, $id)
    {
        $etiqueta = Etiqueta::findOrFail($id);
        
        $request->validate([
            'nombre' => 'required|string|max:255',
            'rawg_id' => 'required|integer|unique:etiquetas,rawg_id,' . $id
        ]);

        $etiqueta->update($request->all());
        return Response::json($etiqueta);
    }

    public function destroy($id)
    {
        $etiqueta = Etiqueta::findOrFail($id);
        $etiqueta->delete();
        return Response::json(null, 204);
    }

    public function sincronizarConRawg($rawgId)
    {
        try {
            // Primero buscar si ya existe la etiqueta
            $etiqueta = Etiqueta::where('rawg_id', $rawgId)->first();

            if ($etiqueta) {
                return Response::json([
                    'status' => 'success',
                    'data' => $etiqueta
                ]);
            }

            // Si no existe, obtener datos de RAWG
            $rawgData = $this->rawgService->getTag($rawgId);

            if (!$rawgData) {
                return Response::json([
                    'error' => 'No se pudo obtener la información de la etiqueta desde RAWG'
                ], 404);
            }

            // Crear nueva etiqueta
            $etiqueta = Etiqueta::create([
                'nombre' => $rawgData['name'],
                'rawg_id' => $rawgData['id']
            ]);

            return Response::json([
                'status' => 'success',
                'data' => $etiqueta
            ]);

        } catch (\Exception $e) {
            Log::error('Error al sincronizar etiqueta con RAWG', [
                'rawg_id' => $rawgId,
                'error' => $e->getMessage()
            ]);

            return Response::json([
                'error' => 'Error al sincronizar la etiqueta'
            ], 500);
        }
    }

    public function buscarEnRawg(Request $request)
    {
        try {
            $query = $request->input('query', '');
            $page = $request->input('page', 1);
            $pageSize = $request->input('page_size', 20);

            $results = $this->rawgService->searchTags($query, $page, $pageSize);

            if (!$results) {
                return Response::json(['error' => 'Error al buscar etiquetas en RAWG'], 500);
            }

            // Transformar los resultados para incluir solo la información necesaria
            $etiquetas = collect($results['results'])->map(function ($tag) {
                return [
                    'id' => $tag['id'],
                    'name' => $tag['name'],
                    'juegos_count' => $tag['games_count']
                ];
            })->sortBy('name')->values();

            return Response::json([
                'etiquetas' => $etiquetas,
                'total' => $results['count'],
                'siguiente' => $results['next'],
                'anterior' => $results['previous']
            ]);

        } catch (\Exception $e) {
            Log::error('Error al buscar etiquetas en RAWG', [
                'error' => $e->getMessage()
            ]);

            return Response::json(['error' => 'Error al buscar etiquetas'], 500);
        }
    }
} 