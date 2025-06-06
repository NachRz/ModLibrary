<?php

namespace App\Http\Controllers;

use App\Models\Comentario;
use App\Models\Mod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class ComentarioController extends Controller
{
    /**
     * Obtener comentarios de un mod específico
     */
    public function index(Request $request, $modId)
    {
        try {
            // Verificar que el mod existe
            $mod = Mod::findOrFail($modId);

            // Verificar si el mod permite comentarios
            if (!$mod->permitir_comentarios) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Este mod no permite comentarios'
                ], 403);
            }

            // Obtener parámetros de paginación
            $perPage = $request->input('per_page', 10);
            $page = $request->input('page', 1);
            $sortBy = $request->input('sort_by', 'fecha'); // fecha, likes
            $sortOrder = $request->input('sort_order', 'desc'); // asc, desc

            // Construir la consulta
            $query = Comentario::with(['usuario:id,nome,foto_perfil'])
                ->where('mod_id', $modId);

            // Aplicar ordenamiento
            switch ($sortBy) {
                case 'fecha':
                    $query->orderBy('created_at', $sortOrder);
                    break;
                default:
                    $query->orderBy('created_at', 'desc');
            }

            // Obtener comentarios paginados
            $comentarios = $query->paginate($perPage, ['*'], 'page', $page);

            // Formatear los comentarios
            $comentarios->getCollection()->transform(function ($comentario) {
                return [
                    'id' => $comentario->id,
                    'contenido' => $comentario->contenido,
                    'fecha' => $comentario->created_at,
                    'fecha_formateada' => $comentario->created_at->diffForHumans(),
                    'usuario' => [
                        'id' => $comentario->usuario->id,
                        'nombre' => $comentario->usuario->nome,
                        'foto_perfil' => $comentario->usuario->foto_perfil ?
                            asset('storage/' . $comentario->usuario->foto_perfil) : null,
                    ],
                    'es_autor' => Auth::check() && Auth::id() === $comentario->usuario_id,
                    'editado' => $comentario->updated_at != $comentario->created_at,
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => [
                    'data' => $comentarios->items(),
                    'total' => $comentarios->total(),
                    'per_page' => $comentarios->perPage(),
                    'current_page' => $comentarios->currentPage(),
                    'last_page' => $comentarios->lastPage(),
                    'from' => $comentarios->firstItem(),
                    'to' => $comentarios->lastItem(),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener comentarios:', [
                'mod_id' => $modId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Error al cargar los comentarios'
            ], 500);
        }
    }

    /**
     * Crear un nuevo comentario
     */
    public function store(Request $request, $modId)
    {
        try {
            // Verificar que el usuario está autenticado
            if (!Auth::check()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Debes iniciar sesión para comentar'
                ], 401);
            }

            // Verificar que el mod existe
            $mod = Mod::findOrFail($modId);

            // Verificar si el mod permite comentarios
            if (!$mod->permitir_comentarios) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Este mod no permite comentarios'
                ], 403);
            }

            // Validar el contenido del comentario
            $validatedData = $request->validate([
                'contenido' => 'required|string|min:3|max:1000',
            ], [
                'contenido.required' => 'El contenido del comentario es obligatorio',
                'contenido.min' => 'El comentario debe tener al menos 3 caracteres',
                'contenido.max' => 'El comentario no puede exceder los 1000 caracteres',
            ]);

            // Crear el comentario
            $comentario = DB::transaction(function () use ($validatedData, $modId) {
                return Comentario::create([
                    'usuario_id' => Auth::id(),
                    'mod_id' => $modId,
                    'contenido' => trim($validatedData['contenido']),
                    'fecha' => now(),
                ]);
            });

            // Cargar las relaciones para la respuesta
            $comentario->load(['usuario:id,nome,foto_perfil']);

            // Formatear el comentario
            $comentarioFormateado = [
                'id' => $comentario->id,
                'contenido' => $comentario->contenido,
                'fecha' => $comentario->created_at,
                'fecha_formateada' => $comentario->created_at->diffForHumans(),
                'usuario' => [
                    'id' => $comentario->usuario->id,
                    'nombre' => $comentario->usuario->nome,
                    'foto_perfil' => $comentario->usuario->foto_perfil ?
                        asset('storage/' . $comentario->usuario->foto_perfil) : null,
                ],
                'es_autor' => true,
                'editado' => false,
            ];

            Log::info('Comentario creado exitosamente:', [
                'comentario_id' => $comentario->id,
                'mod_id' => $modId,
                'usuario_id' => Auth::id()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Comentario publicado exitosamente',
                'data' => $comentarioFormateado
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Datos de comentario inválidos',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error al crear comentario:', [
                'mod_id' => $modId,
                'usuario_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Error al publicar el comentario'
            ], 500);
        }
    }

    /**
     * Actualizar un comentario existente
     */
    public function update(Request $request, $modId, $comentarioId)
    {
        try {
            // Verificar que el usuario está autenticado
            if (!Auth::check()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Debes iniciar sesión para editar comentarios'
                ], 401);
            }

            // Verificar que el mod existe
            $mod = Mod::findOrFail($modId);

            // Verificar si el mod permite comentarios
            if (!$mod->permitir_comentarios) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Este mod no permite comentarios'
                ], 403);
            }

            // Buscar el comentario
            $comentario = Comentario::where('id', $comentarioId)
                ->where('mod_id', $modId)
                ->firstOrFail();

            // Verificar que el usuario es el autor del comentario
            if ($comentario->usuario_id !== Auth::id()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No tienes permisos para editar este comentario'
                ], 403);
            }

            // Validar el nuevo contenido
            $validatedData = $request->validate([
                'contenido' => 'required|string|min:3|max:1000',
            ], [
                'contenido.required' => 'El contenido del comentario es obligatorio',
                'contenido.min' => 'El comentario debe tener al menos 3 caracteres',
                'contenido.max' => 'El comentario no puede exceder los 1000 caracteres',
            ]);

            // Actualizar el comentario
            $comentario->update([
                'contenido' => trim($validatedData['contenido']),
            ]);

            // Cargar las relaciones
            $comentario->load(['usuario:id,nome,foto_perfil']);

            // Formatear el comentario actualizado
            $comentarioFormateado = [
                'id' => $comentario->id,
                'contenido' => $comentario->contenido,
                'fecha' => $comentario->created_at,
                'fecha_formateada' => $comentario->created_at->diffForHumans(),
                'usuario' => [
                    'id' => $comentario->usuario->id,
                    'nombre' => $comentario->usuario->nome,
                    'foto_perfil' => $comentario->usuario->foto_perfil ?
                        asset('storage/' . $comentario->usuario->foto_perfil) : null,
                ],
                'es_autor' => true,
                'editado' => true,
            ];

            Log::info('Comentario actualizado exitosamente:', [
                'comentario_id' => $comentario->id,
                'mod_id' => $modId,
                'usuario_id' => Auth::id()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Comentario actualizado exitosamente',
                'data' => $comentarioFormateado
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Datos de comentario inválidos',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error al actualizar comentario:', [
                'comentario_id' => $comentarioId,
                'mod_id' => $modId,
                'usuario_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Error al actualizar el comentario'
            ], 500);
        }
    }

    /**
     * Eliminar un comentario
     */
    public function destroy($modId, $comentarioId)
    {
        try {
            // Verificar que el usuario está autenticado
            if (!Auth::check()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Debes iniciar sesión para eliminar comentarios'
                ], 401);
            }

            // Verificar que el mod existe
            $mod = Mod::findOrFail($modId);

            // Buscar el comentario
            $comentario = Comentario::where('id', $comentarioId)
                ->where('mod_id', $modId)
                ->firstOrFail();

            // Verificar que el usuario es el autor del comentario
            if ($comentario->usuario_id !== Auth::id()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No tienes permisos para eliminar este comentario'
                ], 403);
            }

            // Eliminar el comentario
            $comentario->delete();

            Log::info('Comentario eliminado exitosamente:', [
                'comentario_id' => $comentarioId,
                'mod_id' => $modId,
                'usuario_id' => Auth::id()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Comentario eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            Log::error('Error al eliminar comentario:', [
                'comentario_id' => $comentarioId,
                'mod_id' => $modId,
                'usuario_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Error al eliminar el comentario'
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de comentarios de un mod
     */
    public function stats($modId)
    {
        try {
            // Verificar que el mod existe
            $mod = Mod::findOrFail($modId);

            $totalComentarios = $mod->comentarios()->count();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'total_comentarios' => $totalComentarios,
                    'permite_comentarios' => $mod->permitir_comentarios,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener estadísticas de comentarios:', [
                'mod_id' => $modId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener las estadísticas'
            ], 500);
        }
    }
}
