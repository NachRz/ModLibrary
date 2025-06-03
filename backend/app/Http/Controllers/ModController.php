<?php

namespace App\Http\Controllers;

use App\Models\Mod;
use App\Models\Usuario;
use App\Models\Etiqueta;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class ModController extends Controller
{
    /**
     * Mostrar la lista de mods (solo activos, no eliminados)
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        // Solo obtener mods que no han sido eliminados (soft delete)
        $mods = Mod::with([
            'creador:id,nome,correo,foto_perfil',
            'juego:id,titulo,imagen_fondo',
            'etiquetas:id,nombre'
        ])
            ->whereNull('deleted_at')
            ->get();
        
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
            'imagen_banner' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'imagenes_adicionales' => 'nullable|array',
            'imagenes_adicionales.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'edad_recomendada' => 'required|integer|min:0|max:18',
            'juego_id' => 'required|exists:juegos,id',
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

        // Obtenemos el usuario autenticado
        $usuario = $request->user();

        // Crear el mod primero (sin rutas de imágenes definitivas)
        $mod = Mod::create([
            'titulo' => $request->titulo,
            'descripcion' => $request->descripcion,
            'imagen_banner' => 'temporal', // Se actualizará después
            'imagenes_adicionales' => null, // Se actualizará después
            'edad_recomendada' => $request->edad_recomendada,
            'juego_id' => $request->juego_id,
            'version_actual' => $request->version_actual,
            'url' => $request->url ?: null,
            'creador_id' => $usuario->id,
            'estado' => $request->estado,
            'total_descargas' => 0,
            'num_valoraciones' => 0,
            'val_media' => 0
        ]);

        // Crear la carpeta del mod y procesar las imágenes
        $resultadoProcesamiento = $this->crearCarpetaYProcesarImagenes(
            $mod->titulo, 
            $mod->id, 
            $request->file('imagen_banner'),
            $request->file('imagenes_adicionales')
        );

        // Actualizar el mod con las rutas correctas de las imágenes
        $mod->update([
            'imagen_banner' => $resultadoProcesamiento['ruta_banner'],
            'imagenes_adicionales' => !empty($resultadoProcesamiento['rutas_adicionales']) 
                ? json_encode($resultadoProcesamiento['rutas_adicionales']) 
                : null
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
     * Crear la estructura de carpetas para un mod y procesar las imágenes
     *
     * @param string $modTitulo
     * @param int $modId
     * @param \Illuminate\Http\UploadedFile|null $imagenBanner
     * @param array|null $imagenesAdicionales
     * @return array
     */
    private function crearCarpetaYProcesarImagenes($modTitulo, $modId, $imagenBanner = null, $imagenesAdicionales = null)
    {
        // Convertir el título del mod en un nombre de carpeta válido
        $modSlug = strtolower(str_replace([' ', '/', '\\', ':', '*', '?', '"', '<', '>', '|'], '_', $modTitulo));
        $basePath = storage_path('app/public/mods/' . $modSlug);
        
        // Crear carpeta principal del mod si no existe
        if (!File::exists($basePath)) {
            File::makeDirectory($basePath, 0755, true);
        }

        // Crear subcarpetas estándar
        $subcarpetas = ['banners', 'imagenes_adicionales', 'versions'];
        foreach ($subcarpetas as $subcarpeta) {
            $subcarpetaPath = $basePath . '/' . $subcarpeta;
            if (!File::exists($subcarpetaPath)) {
                File::makeDirectory($subcarpetaPath, 0755, true);
            }
        }

        $resultado = [
            'ruta_banner' => null,
            'rutas_adicionales' => []
        ];

        // Procesar imagen banner
        if ($imagenBanner) {
            $nombreBanner = 'banner_' . $modId . '_' . time() . '.' . $imagenBanner->getClientOriginalExtension();
            $rutaBanner = $basePath . '/banners/' . $nombreBanner;
            
            // Mover el archivo a la carpeta específica del mod
            $imagenBanner->move($basePath . '/banners', $nombreBanner);
            
            // Guardar la ruta relativa para la base de datos
            $resultado['ruta_banner'] = 'mods/' . $modSlug . '/banners/' . $nombreBanner;
        }

        // Procesar imágenes adicionales
        if ($imagenesAdicionales && is_array($imagenesAdicionales)) {
            foreach ($imagenesAdicionales as $index => $imagen) {
                $nombreImagen = 'img_adicional_' . $modId . '_' . ($index + 1) . '_' . time() . '.' . $imagen->getClientOriginalExtension();
                $rutaImagen = $basePath . '/imagenes_adicionales/' . $nombreImagen;
                
                // Mover el archivo a la carpeta específica del mod
                $imagen->move($basePath . '/imagenes_adicionales', $nombreImagen);
                
                // Guardar la ruta relativa para la base de datos
                $resultado['rutas_adicionales'][] = 'mods/' . $modSlug . '/imagenes_adicionales/' . $nombreImagen;
            }
        }

        return $resultado;
    }

    /**
     * Mostrar un mod específico (solo si no está eliminado)
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        // Solo buscar mods que no han sido eliminados, a menos que sea el creador o admin
        $usuario = request()->user();
        
        $query = Mod::with([
            'creador:id,nome,correo,foto_perfil',
            'valoraciones',
            'juego:id,titulo,imagen_fondo',
            'etiquetas:id,nombre',
            'versiones'
        ]);

        // Si no hay usuario autenticado o no es el creador/admin, excluir eliminados
        if (!$usuario) {
            $query = $query->whereNull('deleted_at');
        } else {
            // Buscar el mod primero para verificar permisos
            $tempMod = Mod::withTrashed()->find($id);
            if (!$tempMod) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Mod no encontrado'
                ], 404);
            }
            
            // Si está eliminado y no es el creador ni admin, no mostrar
            if ($tempMod->deleted_at && $usuario->id !== $tempMod->creador_id && $usuario->rol !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Mod no encontrado'
                ], 404);
            }
            
            // Si es el creador o admin, permitir ver mods eliminados
            if ($usuario->id === $tempMod->creador_id || $usuario->rol === 'admin') {
                $query = $query->withTrashed();
            } else {
                $query = $query->whereNull('deleted_at');
            }
        }

        $mod = $query->find($id);

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

        // Añadir información de si está eliminado
        $mod->is_deleted = $mod->deleted_at !== null;

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
        if ($usuario->id !== $mod->creador_id && $usuario->rol !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'No tiene permiso para actualizar este mod'
            ], 403);
        }

        // Validar la solicitud
        $validator = Validator::make($request->all(), [
            'titulo' => 'sometimes|string|max:255',
            'descripcion' => 'sometimes|string',
            'imagen_banner' => 'sometimes|string|max:500',
            'imagenes_adicionales' => 'sometimes|array',
            'imagenes_adicionales.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'edad_recomendada' => 'sometimes|integer|min:0|max:18',
            'version_actual' => 'sometimes|string|max:50',
            'url' => 'nullable|url|max:255',
            'etiquetas' => 'sometimes|array',
            'etiquetas.*' => 'exists:etiquetas,id',
            'estado' => 'sometimes|in:borrador,publicado,revision,suspendido',
            'es_destacado' => 'sometimes|boolean',
            'permitir_comentarios' => 'sometimes|boolean',
            'visible_en_busqueda' => 'sometimes|boolean',
            'juego_id' => 'sometimes|integer|exists:juegos,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Datos inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        // Procesar imagen banner - ahora puede ser una URL de string (ya subida) o un archivo
        if ($request->has('imagen_banner')) {
            if ($request->hasFile('imagen_banner')) {
                // Es un archivo - procesarlo como antes
                // Eliminar la imagen anterior si existe
                if ($mod->imagen_banner && Storage::exists('public/' . $mod->imagen_banner)) {
                    Storage::delete('public/' . $mod->imagen_banner);
                }

                $imagenBanner = $request->file('imagen_banner');
                $nombreArchivo = time() . '_' . $imagenBanner->getClientOriginalName();
                $imagenBannerPath = $imagenBanner->storeAs('public/mods', $nombreArchivo);
                $mod->imagen_banner = str_replace('public/', '', $imagenBannerPath);
            } else {
                // Es una URL de string (ya subida por separado)
                $mod->imagen_banner = $request->imagen_banner;
            }
        }

        // Procesar imágenes adicionales
        $imagenesAdicionales = [];
        if ($request->hasFile('imagenes_adicionales')) {
            foreach ($request->file('imagenes_adicionales') as $imagen) {
                $nombreArchivo = time() . '_' . uniqid() . '_' . $imagen->getClientOriginalName();
                $imagenPath = $imagen->storeAs('public/mods/adicionales', $nombreArchivo);
                $imagenesAdicionales[] = str_replace('public/', '', $imagenPath);
            }
            $mod->imagenes_adicionales = json_encode($imagenesAdicionales);
        }

        // Actualizar campos
        if ($request->filled('titulo')) $mod->titulo = $request->titulo;
        if ($request->filled('descripcion')) $mod->descripcion = $request->descripcion;
        if ($request->filled('edad_recomendada')) $mod->edad_recomendada = $request->edad_recomendada;
        if ($request->filled('version_actual')) $mod->version_actual = $request->version_actual;
        if ($request->filled('url')) $mod->url = $request->url;
        if ($request->filled('estado')) $mod->estado = $request->estado;
        if ($request->filled('juego_id')) $mod->juego_id = $request->juego_id;
        
        // Actualizar campos booleanos
        if ($request->has('es_destacado')) $mod->es_destacado = $request->boolean('es_destacado');
        if ($request->has('permitir_comentarios')) $mod->permitir_comentarios = $request->boolean('permitir_comentarios');
        if ($request->has('visible_en_busqueda')) $mod->visible_en_busqueda = $request->boolean('visible_en_busqueda');

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
     * Eliminar un mod específico (soft delete)
     *
     * @param Request $request
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
        if ($usuario->id !== $mod->creador_id && $usuario->rol !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'No tiene permiso para eliminar este mod'
            ], 403);
        }

        // Hacer soft delete del mod
        $mod->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Mod eliminado correctamente (puede ser restaurado)'
        ]);
    }

    /**
     * Eliminar un mod con soft delete
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function softDelete(Request $request, int $id): JsonResponse
    {
        try {
            $mod = Mod::findOrFail($id);
            
            // Obtenemos el usuario autenticado
            $usuario = $request->user();

            // Verificar que el usuario es el creador del mod o un administrador
            if ($usuario->id !== $mod->creador_id && $usuario->rol !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No tiene permiso para eliminar este mod'
                ], 403);
            }

            // Hacer soft delete del mod
            $mod->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Mod desactivado correctamente (puede ser restaurado)'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al desactivar el mod'
            ], 500);
        }
    }

    /**
     * Obtener mods eliminados (soft deleted)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getDeletedMods(Request $request): JsonResponse
    {
        try {
            $mods = Mod::onlyTrashed()
                ->with([
                    'creador:id,nome,correo,foto_perfil',
                    'juego:id,titulo',
                    'etiquetas:id,nombre'
                ])
                ->orderBy('deleted_at', 'desc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $mods->map(function ($mod) {
                    return [
                        'id' => $mod->id,
                        'titulo' => $mod->titulo,
                        'imagen_banner' => $mod->imagen_banner,
                        'creador' => $mod->creador,
                        'juego' => $mod->juego,
                        'etiquetas' => $mod->etiquetas,
                        'estado' => $mod->estado,
                        'total_descargas' => $mod->total_descargas,
                        'val_media' => $mod->val_media,
                        'fecha_creacion' => $mod->created_at->format('Y-m-d'),
                        'fecha_eliminacion' => $mod->deleted_at->format('Y-m-d H:i:s')
                    ];
                })
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener mods eliminados'
            ], 500);
        }
    }

    /**
     * Restaurar mod eliminado
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function restore(Request $request, int $id): JsonResponse
    {
        try {
            $mod = Mod::onlyTrashed()->findOrFail($id);
            
            // Obtenemos el usuario autenticado
            $usuario = $request->user();

            // Verificar que el usuario es el creador del mod o un administrador
            if ($usuario->id !== $mod->creador_id && $usuario->rol !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No tiene permiso para restaurar este mod'
                ], 403);
            }

            $mod->restore();

            return response()->json([
                'status' => 'success',
                'message' => 'Mod restaurado correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al restaurar el mod'
            ], 500);
        }
    }

    /**
     * Eliminar definitivamente un mod (solo admins)
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function forceDelete(Request $request, int $id): JsonResponse
    {
        try {
            $mod = Mod::onlyTrashed()->findOrFail($id);
            
            // Obtenemos el usuario autenticado
            $usuario = $request->user();

            // Solo los administradores pueden eliminar definitivamente
            if ($usuario->rol !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Solo los administradores pueden eliminar mods definitivamente'
                ], 403);
            }

            // ModObserver se encargará automáticamente de:
            // - Eliminar imagen banner y imágenes adicionales
            // - Eliminar relaciones many-to-many (etiquetas, usuariosGuardados)
            // - Eliminar valoraciones y comentarios relacionados
            // - Eliminar versiones del mod (VersionModObserver elimina archivos)

            // Eliminar el mod definitivamente
            $mod->forceDelete();

            return response()->json([
                'status' => 'success',
                'message' => 'Mod eliminado definitivamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al eliminar el mod definitivamente'
            ], 500);
        }
    }

    /**
     * Obtener mods de un creador específico
     *
     * @param int $creadorId
     * @return JsonResponse
     */
    public function getModsByCreador(int $creadorId): JsonResponse
    {
        // Obtener el usuario autenticado
        $usuario = request()->user();
        
        // Si es el propio creador, incluir mods eliminados, sino solo activos
        $query = Mod::where('creador_id', $creadorId);
        
        if (!$usuario || $usuario->id !== $creadorId) {
            // Si no es el creador, solo mostrar mods activos
            $query = $query->whereNull('deleted_at');
        } else {
            // Si es el creador, incluir mods eliminados usando withTrashed
            $query = Mod::withTrashed()->where('creador_id', $creadorId);
        }
        
        $mods = $query->with([
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
            
            // Añadir información de soft delete si aplica
            $mod->is_deleted = $mod->deleted_at !== null;
            
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
     * Obtener mods de un juego específico
     *
     * @param int $juegoId
     * @return JsonResponse
     */
    public function getModsByGame(int $juegoId): JsonResponse
    {
        $mods = Mod::where('juego_id', $juegoId)
            ->where('estado', 'publicado') // Solo mods publicados
            ->with([
                'creador:id,nome,correo,foto_perfil',
                'valoraciones',
                'juego:id,titulo,imagen_fondo',
                'etiquetas:id,nombre',
                'versiones'
            ])
            ->get();
        
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
        if ($usuario->id !== $mod->creador_id && $usuario->rol !== 'admin') {
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
            ->with([
                'creador:id,nome,correo,foto_perfil',
                'juego:id,titulo,imagen_fondo',
                'valoraciones',
                'etiquetas:id,nombre'
            ])
            ->get()
            ->map(function ($mod) {
                // Calcular la valoración media
                $valoracionMedia = $mod->valoraciones->avg('puntuacion') ?? 0;
                $numValoraciones = $mod->valoraciones->count();
                
                // Eliminar la colección completa de valoraciones para reducir el tamaño de la respuesta
                unset($mod->valoraciones);
                
                // Agregar los campos calculados
                $mod->valoracion = round($valoracionMedia, 1);
                $mod->numValoraciones = $numValoraciones;
                
                return $mod;
            });

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

        // Verificar si el usuario es el creador del mod
        if ($mod->creador_id === $usuario->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'No puedes guardar tu propio mod'
            ], 400);
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

    /**
     * Obtener la valoración del usuario para un mod específico
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function getUserValoracion(Request $request, int $id): JsonResponse
    {
        $usuario = $request->user();
        
        $mod = Mod::find($id);
        if (!$mod) {
            return response()->json([
                'status' => 'error',
                'message' => 'Mod no encontrado'
            ], 404);
        }
        
        $valoracion = \App\Models\Valoracion::where('usuario_id', $usuario->id)
            ->where('mod_id', $id)
            ->first();
            
        if (!$valoracion) {
            return response()->json([
                'status' => 'success',
                'hasRated' => false,
                'data' => null
            ]);
        }
        
        return response()->json([
            'status' => 'success',
            'hasRated' => true,
            'data' => [
                'puntuacion' => $valoracion->puntuacion,
                'fecha' => $valoracion->fecha
            ]
        ]);
    }
    
    /**
     * Valorar un mod
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function valorarMod(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'puntuacion' => 'required|numeric|min:1|max:5'
        ]);
        
        $usuario = $request->user();
        
        $mod = Mod::find($id);
        if (!$mod) {
            return response()->json([
                'status' => 'error',
                'message' => 'Mod no encontrado'
            ], 404);
        }
        
        // Verificar si el usuario ya ha valorado este mod
        $valoracionExistente = \App\Models\Valoracion::where('usuario_id', $usuario->id)
            ->where('mod_id', $id)
            ->first();
            
        if ($valoracionExistente) {
            // Actualizar la valoración existente
            $valoracionExistente->puntuacion = $request->puntuacion;
            $valoracionExistente->fecha = now();
            $valoracionExistente->save();
            
            // La media y total se actualizan automáticamente mediante events en el modelo
            
            return response()->json([
                'status' => 'success',
                'message' => 'Valoración actualizada correctamente',
                'data' => [
                    'puntuacion' => $valoracionExistente->puntuacion,
                    'fecha' => $valoracionExistente->fecha
                ]
            ]);
        }
        
        // Crear nueva valoración
        $valoracion = new \App\Models\Valoracion([
            'usuario_id' => $usuario->id,
            'mod_id' => $id,
            'puntuacion' => $request->puntuacion,
            'fecha' => now()
        ]);
        
        $valoracion->save();
        
        // La media y total se actualizan automáticamente mediante events en el modelo
        
        return response()->json([
            'status' => 'success',
            'message' => 'Valoración registrada correctamente',
            'data' => [
                'puntuacion' => $valoracion->puntuacion,
                'fecha' => $valoracion->fecha
            ]
        ], 201);
    }
    
    /**
     * Eliminar la valoración de un mod
     *
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function eliminarValoracion(Request $request, int $id): JsonResponse
    {
        $usuario = $request->user();
        
        $mod = Mod::find($id);
        if (!$mod) {
            return response()->json([
                'status' => 'error',
                'message' => 'Mod no encontrado'
            ], 404);
        }
        
        $valoracion = \App\Models\Valoracion::where('usuario_id', $usuario->id)
            ->where('mod_id', $id)
            ->first();
            
        if (!$valoracion) {
            return response()->json([
                'status' => 'error',
                'message' => 'No tienes una valoración para este mod'
            ], 404);
        }
        
        $valoracion->delete();
        
        // La media y total se actualizan automáticamente mediante events en el modelo
        
        return response()->json([
            'status' => 'success',
            'message' => 'Valoración eliminada correctamente'
        ]);
    }

    /**
     * Obtener mods eliminados del usuario autenticado
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getMyDeletedMods(Request $request): JsonResponse
    {
        try {
            $usuario = $request->user();
            
            $mods = Mod::onlyTrashed()
                ->where('creador_id', $usuario->id)
                ->with([
                    'creador:id,nome,correo,foto_perfil',
                    'juego:id,titulo',
                    'etiquetas:id,nombre'
                ])
                ->orderBy('deleted_at', 'desc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $mods->map(function ($mod) {
                    return [
                        'id' => $mod->id,
                        'titulo' => $mod->titulo,
                        'imagen_banner' => $mod->imagen_banner,
                        'creador' => $mod->creador,
                        'juego' => $mod->juego,
                        'etiquetas' => $mod->etiquetas,
                        'estado' => $mod->estado,
                        'total_descargas' => $mod->total_descargas,
                        'val_media' => $mod->val_media,
                        'fecha_creacion' => $mod->created_at->format('Y-m-d'),
                        'fecha_eliminacion' => $mod->deleted_at->format('Y-m-d H:i:s'),
                        'is_deleted' => true
                    ];
                })
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener mods eliminados'
            ], 500);
        }
    }
} 