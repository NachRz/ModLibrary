<?php

namespace App\Http\Controllers;

use App\Models\Mod;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ModController extends Controller
{
    /**
     * Obtener todos los mods con información de sus creadores
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $mods = Mod::with('creador:id,nome,correo,foto_perfil')->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $mods
        ]);
    }

    /**
     * Obtener mods de un creador específico
     *
     * @param int $creadorId
     * @return JsonResponse
     */
    public function getModsByCreador(int $creadorId): JsonResponse
    {
        $mods = Mod::where('creador_id', $creadorId)
            ->with([
                'creador:id,nome,correo,foto_perfil',
                'valoraciones',
                'juego:id,titulo,imagen_fondo',
                'etiquetas:id,nombre',
                'versiones'
            ])
            ->get();
        
        if ($mods->isEmpty()) {
            return response()->json([
                'status' => 'error',
                'message' => 'No se encontraron mods para este creador'
            ], 404);
        }
        
        // Calcular la valoración media para cada mod
        $mods = $mods->map(function ($mod) {
            $valoracionMedia = $mod->valoraciones->avg('puntuacion') ?? 0;
            $totalValoraciones = $mod->valoraciones->count();
            
            // Eliminar la colección completa de valoraciones para reducir el tamaño de la respuesta
            unset($mod->valoraciones);
            
            // Agregar las estadísticas calculadas
            $mod->estadisticas = [
                'valoracion_media' => round($valoracionMedia, 1),
                'total_valoraciones' => $totalValoraciones,
                'total_descargas' => $mod->versiones->sum('descargas') ?? 0
            ];
            
            return $mod;
        });
        
        return response()->json([
            'status' => 'success',
            'data' => $mods
        ]);
    }

    /**
     * Obtener mods con estadísticas y detalles del creador
     *
     * @return JsonResponse
     */
    public function getModsWithCreatorDetails(): JsonResponse
    {
        $mods = Mod::with([
            'creador:id,nome,correo,foto_perfil',
            'valoraciones',
            'juego:id,titulo,imagen_fondo',
            'etiquetas:id,nombre'
        ])->get();
        
        // Calcular la valoración media para cada mod
        $mods = $mods->map(function ($mod) {
            $valoracionMedia = $mod->valoraciones->avg('puntuacion') ?? 0;
            $totalValoraciones = $mod->valoraciones->count();
            
            // Eliminar la colección completa de valoraciones para reducir el tamaño de la respuesta
            unset($mod->valoraciones);
            
            // Agregar las estadísticas calculadas
            $mod->estadisticas = [
                'valoracion_media' => round($valoracionMedia, 1),
                'total_valoraciones' => $totalValoraciones,
                'total_descargas' => $mod->versiones->sum('descargas') ?? 0
            ];
            
            return $mod;
        });
        
        return response()->json([
            'status' => 'success',
            'data' => $mods
        ]);
    }

    /**
     * Obtener mods por nombre de usuario creador
     *
     * @param string $username
     * @return JsonResponse
     */
    public function getModsByCreatorName(string $username): JsonResponse
    {
        $usuario = Usuario::where('nome', 'like', "%{$username}%")->first();
        
        if (!$usuario) {
            return response()->json([
                'status' => 'error',
                'message' => 'Usuario no encontrado'
            ], 404);
        }
        
        $mods = Mod::where('creador_id', $usuario->id)
            ->with([
                'creador:id,nome,correo,foto_perfil',
                'juego:id,titulo,imagen_fondo',
                'etiquetas:id,nombre'
            ])
            ->get();
        
        if ($mods->isEmpty()) {
            return response()->json([
                'status' => 'error',
                'message' => 'No se encontraron mods para este creador'
            ], 404);
        }
        
        return response()->json([
            'status' => 'success',
            'data' => $mods
        ]);
    }
} 