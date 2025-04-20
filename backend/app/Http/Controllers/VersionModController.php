<?php

namespace App\Http\Controllers;

use App\Models\Mod;
use App\Models\VersionMod;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class VersionModController extends Controller
{
    /**
     * Obtener todas las versiones de un mod
     *
     * @param int $modId
     * @return JsonResponse
     */
    public function index(int $modId): JsonResponse
    {
        $mod = Mod::find($modId);
        
        if (!$mod) {
            return response()->json([
                'status' => 'error',
                'message' => 'Mod no encontrado'
            ], 404);
        }
        
        $versiones = $mod->versiones()->orderBy('fecha_lanzamiento', 'desc')->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $versiones
        ]);
    }
    
    /**
     * Obtener una versión específica de un mod
     *
     * @param int $modId
     * @param int $versionId
     * @return JsonResponse
     */
    public function show(int $modId, int $versionId): JsonResponse
    {
        $version = VersionMod::where('mod_id', $modId)
            ->where('id', $versionId)
            ->first();
        
        if (!$version) {
            return response()->json([
                'status' => 'error',
                'message' => 'Versión no encontrada'
            ], 404);
        }
        
        return response()->json([
            'status' => 'success',
            'data' => $version
        ]);
    }
    
    /**
     * Almacenar una nueva versión para un mod
     *
     * @param Request $request
     * @param int $modId
     * @return JsonResponse
     */
    public function store(Request $request, int $modId): JsonResponse
    {
        // Verificar que el mod existe
        $mod = Mod::find($modId);
        
        if (!$mod) {
            return response()->json([
                'status' => 'error',
                'message' => 'Mod no encontrado'
            ], 404);
        }
        
        // Verificar que el usuario autenticado es el creador del mod
        $usuario = $request->user();
        
        if ($usuario->id !== $mod->creador_id && !$usuario->es_admin) {
            return response()->json([
                'status' => 'error',
                'message' => 'No tiene permiso para añadir versiones a este mod'
            ], 403);
        }
        
        // Validar la solicitud
        $validator = Validator::make($request->all(), [
            'version' => 'required|string|max:50',
            'notas' => 'nullable|string',
            'archivo' => 'required|file|max:102400', // 100MB max
            'fecha_lanzamiento' => 'nullable|date',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Datos inválidos',
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Procesar y almacenar el archivo
        $archivoPath = null;
        if ($request->hasFile('archivo')) {
            $archivo = $request->file('archivo');
            $nombreArchivo = time() . '_' . $archivo->getClientOriginalName();
            $archivoPath = $archivo->storeAs('public/mods/archivos', $nombreArchivo);
            $archivoPath = str_replace('public/', '', $archivoPath);
        }
        
        // Crear la versión
        $version = VersionMod::create([
            'mod_id' => $modId,
            'version' => $request->version,
            'notas' => $request->notas,
            'archivo' => $archivoPath,
            'fecha_lanzamiento' => $request->fecha_lanzamiento ?? now(),
            'descargas' => 0
        ]);
        
        // Actualizar la versión actual del mod
        $mod->version_actual = $request->version;
        $mod->save();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Versión creada exitosamente',
            'data' => $version
        ], 201);
    }
    
    /**
     * Actualizar una versión específica de un mod
     *
     * @param Request $request
     * @param int $modId
     * @param int $versionId
     * @return JsonResponse
     */
    public function update(Request $request, int $modId, int $versionId): JsonResponse
    {
        // Verificar que el mod existe
        $mod = Mod::find($modId);
        
        if (!$mod) {
            return response()->json([
                'status' => 'error',
                'message' => 'Mod no encontrado'
            ], 404);
        }
        
        // Verificar que la versión existe y pertenece al mod
        $version = VersionMod::where('mod_id', $modId)
            ->where('id', $versionId)
            ->first();
        
        if (!$version) {
            return response()->json([
                'status' => 'error',
                'message' => 'Versión no encontrada'
            ], 404);
        }
        
        // Verificar que el usuario autenticado es el creador del mod
        $usuario = $request->user();
        
        if ($usuario->id !== $mod->creador_id && !$usuario->es_admin) {
            return response()->json([
                'status' => 'error',
                'message' => 'No tiene permiso para actualizar versiones de este mod'
            ], 403);
        }
        
        // Validar la solicitud
        $validator = Validator::make($request->all(), [
            'version' => 'sometimes|string|max:50',
            'notas' => 'nullable|string',
            'archivo' => 'sometimes|file|max:102400', // 100MB max
            'fecha_lanzamiento' => 'nullable|date',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Datos inválidos',
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Procesar y almacenar el nuevo archivo si se proporciona
        if ($request->hasFile('archivo')) {
            // Eliminar el archivo anterior si existe
            if ($version->archivo && Storage::exists('public/' . $version->archivo)) {
                Storage::delete('public/' . $version->archivo);
            }
            
            $archivo = $request->file('archivo');
            $nombreArchivo = time() . '_' . $archivo->getClientOriginalName();
            $archivoPath = $archivo->storeAs('public/mods/archivos', $nombreArchivo);
            $version->archivo = str_replace('public/', '', $archivoPath);
        }
        
        // Actualizar campos
        if ($request->filled('version')) {
            $version->version = $request->version;
            
            // Si esta es la versión actual del mod, actualizar también el mod
            if ($mod->version_actual === $version->getOriginal('version')) {
                $mod->version_actual = $request->version;
                $mod->save();
            }
        }
        
        if ($request->filled('notas')) $version->notas = $request->notas;
        if ($request->filled('fecha_lanzamiento')) $version->fecha_lanzamiento = $request->fecha_lanzamiento;
        
        $version->save();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Versión actualizada exitosamente',
            'data' => $version
        ]);
    }
    
    /**
     * Eliminar una versión específica de un mod
     *
     * @param Request $request
     * @param int $modId
     * @param int $versionId
     * @return JsonResponse
     */
    public function destroy(Request $request, int $modId, int $versionId): JsonResponse
    {
        // Verificar que el mod existe
        $mod = Mod::find($modId);
        
        if (!$mod) {
            return response()->json([
                'status' => 'error',
                'message' => 'Mod no encontrado'
            ], 404);
        }
        
        // Verificar que la versión existe y pertenece al mod
        $version = VersionMod::where('mod_id', $modId)
            ->where('id', $versionId)
            ->first();
        
        if (!$version) {
            return response()->json([
                'status' => 'error',
                'message' => 'Versión no encontrada'
            ], 404);
        }
        
        // Verificar que el usuario autenticado es el creador del mod
        $usuario = $request->user();
        
        if ($usuario->id !== $mod->creador_id && !$usuario->es_admin) {
            return response()->json([
                'status' => 'error',
                'message' => 'No tiene permiso para eliminar versiones de este mod'
            ], 403);
        }
        
        // Comprobar si es la última versión
        $conteoVersiones = $mod->versiones()->count();
        
        if ($conteoVersiones <= 1) {
            return response()->json([
                'status' => 'error',
                'message' => 'No se puede eliminar la única versión del mod'
            ], 422);
        }
        
        // Comprobar si esta es la versión actual del mod
        $esVersionActual = $mod->version_actual === $version->version;
        
        // Eliminar el archivo si existe
        if ($version->archivo && Storage::exists('public/' . $version->archivo)) {
            Storage::delete('public/' . $version->archivo);
        }
        
        // Actualizar la versión actual del mod si es necesario
        if ($esVersionActual) {
            // Obtener la segunda versión más reciente
            $nuevaVersionActual = $mod->versiones()
                ->where('id', '!=', $versionId)
                ->orderBy('fecha_lanzamiento', 'desc')
                ->first();
            
            if ($nuevaVersionActual) {
                $mod->version_actual = $nuevaVersionActual->version;
                $mod->save();
            }
        }
        
        // Eliminar la versión
        $version->delete();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Versión eliminada exitosamente'
        ]);
    }
    
    /**
     * Incrementar el contador de descargas de una versión
     *
     * @param int $modId
     * @param int $versionId
     * @return JsonResponse
     */
    public function incrementarDescargas(int $modId, int $versionId): JsonResponse
    {
        // Verificar que la versión existe y pertenece al mod
        $version = VersionMod::where('mod_id', $modId)
            ->where('id', $versionId)
            ->first();
        
        if (!$version) {
            return response()->json([
                'status' => 'error',
                'message' => 'Versión no encontrada'
            ], 404);
        }
        
        // Incrementar contador de descargas
        $version->descargas = $version->descargas + 1;
        $version->save();
        
        // Actualizar total de descargas del mod
        $mod = $version->mod;
        $mod->total_descargas = $mod->total_descargas + 1;
        $mod->save();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Contador de descargas incrementado',
            'data' => [
                'descargas_version' => $version->descargas,
                'descargas_totales' => $mod->total_descargas
            ]
        ]);
    }
} 