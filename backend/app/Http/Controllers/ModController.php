<?php

namespace App\Http\Controllers;

use App\Models\Mod;
use App\Models\Usuario;
use App\Models\Etiqueta;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

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
     * Almacenar un nuevo mod en la base de datos
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        // Validar la solicitud
        $validator = Validator::make($request->all(), [
            'titulo' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'imagen' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'edad_recomendada' => 'required|integer|min:0|max:18',
            'juego_id' => 'required|exists:juegos,id',
            'version_juego_necesaria' => 'required|string|max:50',
            'version_actual' => 'required|string|max:50',
            'url' => 'nullable|url|max:255',
            'etiquetas' => 'array',
            'etiquetas.*' => 'exists:etiquetas,id',
            'estado' => 'required|in:borrador,publicado'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Datos inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        // Procesar y almacenar la imagen
        $imagenPath = null;
        if ($request->hasFile('imagen')) {
            $imagen = $request->file('imagen');
            $nombreArchivo = time() . '_' . $imagen->getClientOriginalName();
            $imagenPath = $imagen->storeAs('public/mods', $nombreArchivo);
            $imagenPath = str_replace('public/', '', $imagenPath);
        }

        // Obtenemos el usuario autenticado
        $usuario = $request->user();

        // Crear el mod
        $mod = Mod::create([
            'titulo' => $request->titulo,
            'descripcion' => $request->descripcion,
            'imagen' => $imagenPath,
            'edad_recomendada' => $request->edad_recomendada,
            'juego_id' => $request->juego_id,
            'version_juego_necesaria' => $request->version_juego_necesaria,
            'version_actual' => $request->version_actual,
            'url' => $request->url,
            'creador_id' => $usuario->id,
            'estado' => $request->estado,
            'total_descargas' => 0,
            'num_valoraciones' => 0,
            'val_media' => 0
        ]);

        // Asociar etiquetas si se proporcionaron
        if ($request->has('etiquetas') && is_array($request->etiquetas)) {
            $mod->etiquetas()->attach($request->etiquetas);
        }

        // Cargar relaciones para la respuesta
        $mod->load([
            'creador:id,nome,correo,foto_perfil',
            'juego:id,titulo,imagen_fondo',
            'etiquetas:id,nombre'
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Mod creado exitosamente',
            'data' => $mod
        ], 201);
    }

    /**
     * Mostrar un mod específico
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $mod = Mod::with([
            'creador:id,nome,correo,foto_perfil',
            'valoraciones',
            'juego:id,titulo,imagen_fondo',
            'etiquetas:id,nombre',
            'versiones'
        ])->find($id);

        if (!$mod) {
            return response()->json([
                'status' => 'error',
                'message' => 'Mod no encontrado'
            ], 404);
        }

        // Calcular estadísticas
        $valoracionMedia = $mod->valoraciones->avg('puntuacion') ?? 0;
        $totalValoraciones = $mod->valoraciones->count();
        $totalDescargas = $mod->total_descargas;

        // Eliminar la colección completa de valoraciones para reducir el tamaño de la respuesta
        unset($mod->valoraciones);

        // Agregar las estadísticas calculadas
        $mod->estadisticas = [
            'valoracion_media' => round($valoracionMedia, 1),
            'total_valoraciones' => $totalValoraciones,
            'total_descargas' => $totalDescargas
        ];

        return response()->json([
            'status' => 'success',
            'data' => $mod
        ]);
    }

    /**
     * Actualizar un mod específico
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        // Buscar el mod
        $mod = Mod::find($id);

        if (!$mod) {
            return response()->json([
                'status' => 'error',
                'message' => 'Mod no encontrado'
            ], 404);
        }

        // Obtenemos el usuario autenticado
        $usuario = $request->user();

        // Verificar que el usuario es el creador del mod o un administrador
        if ($usuario->id !== $mod->creador_id && !$usuario->es_admin) {
            return response()->json([
                'status' => 'error',
                'message' => 'No tiene permiso para actualizar este mod'
            ], 403);
        }

        // Validar la solicitud
        $validator = Validator::make($request->all(), [
            'titulo' => 'sometimes|string|max:255',
            'descripcion' => 'sometimes|string',
            'imagen' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'edad_recomendada' => 'sometimes|integer|min:0|max:18',
            'version_juego_necesaria' => 'sometimes|string|max:50',
            'version_actual' => 'sometimes|string|max:50',
            'url' => 'nullable|url|max:255',
            'etiquetas' => 'sometimes|array',
            'etiquetas.*' => 'exists:etiquetas,id',
            'estado' => 'sometimes|in:borrador,publicado'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Datos inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        // Procesar y almacenar la nueva imagen si se proporciona
        if ($request->hasFile('imagen')) {
            // Eliminar la imagen anterior si existe
            if ($mod->imagen && Storage::exists('public/' . $mod->imagen)) {
                Storage::delete('public/' . $mod->imagen);
            }

            $imagen = $request->file('imagen');
            $nombreArchivo = time() . '_' . $imagen->getClientOriginalName();
            $imagenPath = $imagen->storeAs('public/mods', $nombreArchivo);
            $mod->imagen = str_replace('public/', '', $imagenPath);
        }

        // Actualizar campos
        if ($request->filled('titulo')) $mod->titulo = $request->titulo;
        if ($request->filled('descripcion')) $mod->descripcion = $request->descripcion;
        if ($request->filled('edad_recomendada')) $mod->edad_recomendada = $request->edad_recomendada;
        if ($request->filled('version_juego_necesaria')) $mod->version_juego_necesaria = $request->version_juego_necesaria;
        if ($request->filled('version_actual')) $mod->version_actual = $request->version_actual;
        if ($request->filled('url')) $mod->url = $request->url;
        if ($request->filled('estado')) $mod->estado = $request->estado;

        // Guardar cambios
        $mod->save();

        // Actualizar etiquetas si se proporcionaron
        if ($request->has('etiquetas') && is_array($request->etiquetas)) {
            $mod->etiquetas()->sync($request->etiquetas);
        }

        // Cargar relaciones para la respuesta
        $mod->load([
            'creador:id,nome,correo,foto_perfil',
            'juego:id,titulo,imagen_fondo',
            'etiquetas:id,nombre'
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Mod actualizado exitosamente',
            'data' => $mod
        ]);
    }

    /**
     * Eliminar un mod específico
     *
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        // Buscar el mod
        $mod = Mod::find($id);

        if (!$mod) {
            return response()->json([
                'status' => 'error',
                'message' => 'Mod no encontrado'
            ], 404);
        }

        // Obtenemos el usuario autenticado
        $usuario = $request->user();

        // Verificar que el usuario es el creador del mod o un administrador
        if ($usuario->id !== $mod->creador_id && !$usuario->es_admin) {
            return response()->json([
                'status' => 'error',
                'message' => 'No tiene permiso para eliminar este mod'
            ], 403);
        }

        // Eliminar la imagen si existe
        if ($mod->imagen && Storage::exists('public/' . $mod->imagen)) {
            Storage::delete('public/' . $mod->imagen);
        }

        // Eliminar relaciones (dependiendo de las restricciones de clave foránea)
        $mod->etiquetas()->detach();
        $mod->usuariosGuardados()->detach();
        
        // Si se desea, también se pueden eliminar las valoraciones y comentarios
        // $mod->valoraciones()->delete();
        // $mod->comentarios()->delete();
        
        // Eliminar versiones del mod (esto también podría requerir eliminar archivos)
        foreach ($mod->versiones as $version) {
            if ($version->archivo && Storage::exists('public/' . $version->archivo)) {
                Storage::delete('public/' . $version->archivo);
            }
            $version->delete();
        }

        // Eliminar el mod
        $mod->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Mod eliminado exitosamente'
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
                'total_descargas' => $mod->total_descargas
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

    /**
     * Cambiar el estado de un mod (borrador/publicado)
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function cambiarEstado(Request $request, int $id): JsonResponse
    {
        // Validar la solicitud
        $validator = Validator::make($request->all(), [
            'estado' => 'required|in:borrador,publicado'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Estado inválido',
                'errors' => $validator->errors()
            ], 422);
        }

        // Buscar el mod
        $mod = Mod::find($id);

        if (!$mod) {
            return response()->json([
                'status' => 'error',
                'message' => 'Mod no encontrado'
            ], 404);
        }

        // Obtenemos el usuario autenticado
        $usuario = $request->user();

        // Verificar que el usuario es el creador del mod o un administrador
        if ($usuario->id !== $mod->creador_id && !$usuario->es_admin) {
            return response()->json([
                'status' => 'error',
                'message' => 'No tiene permiso para actualizar este mod'
            ], 403);
        }

        // Actualizar el estado
        $mod->estado = $request->estado;
        $mod->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Estado del mod actualizado a ' . $request->estado,
            'data' => $mod
        ]);
    }

    /**
     * Obtener los mods guardados del usuario autenticado
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getModsGuardados(Request $request): JsonResponse
    {
        $usuario = $request->user();
        
        $modsGuardados = $usuario->modsGuardados()
            ->with(['creador:id,nome,correo,foto_perfil', 'juego:id,titulo,imagen_fondo'])
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $modsGuardados
        ]);
    }

    /**
     * Guardar un mod para el usuario autenticado
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function guardarMod(Request $request, int $id): JsonResponse
    {
        $usuario = $request->user();
        $mod = Mod::find($id);

        if (!$mod) {
            return response()->json([
                'status' => 'error',
                'message' => 'Mod no encontrado'
            ], 404);
        }

        // Verificar si el mod ya está guardado
        if ($usuario->modsGuardados()->where('mod_id', $id)->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'El mod ya está guardado'
            ], 400);
        }

        // Guardar el mod
        $usuario->modsGuardados()->attach($id);

        return response()->json([
            'status' => 'success',
            'message' => 'Mod guardado exitosamente',
            'guardado' => true
        ]);
    }

    /**
     * Eliminar un mod de guardados del usuario autenticado
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function eliminarModGuardado(Request $request, int $id): JsonResponse
    {
        $usuario = $request->user();
        $mod = Mod::find($id);

        if (!$mod) {
            return response()->json([
                'status' => 'error',
                'message' => 'Mod no encontrado'
            ], 404);
        }

        // Verificar si el mod está guardado
        if (!$usuario->modsGuardados()->where('mod_id', $id)->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'El mod no está guardado'
            ], 400);
        }

        // Eliminar el mod de guardados
        $usuario->modsGuardados()->detach($id);

        return response()->json([
            'status' => 'success',
            'message' => 'Mod eliminado de guardados exitosamente',
            'guardado' => false
        ]);
    }

    /**
     * Verificar si un mod está guardado por el usuario autenticado
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function verificarModGuardado(Request $request, int $id): JsonResponse
    {
        $usuario = $request->user();
        $guardado = $usuario->modsGuardados()->where('mod_id', $id)->exists();

        return response()->json([
            'status' => 'success',
            'guardado' => $guardado
        ]);
    }
} 