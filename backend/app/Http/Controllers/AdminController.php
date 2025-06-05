<?php

namespace App\Http\Controllers;

use App\Models\Comentario;
use App\Models\Usuario;
use App\Models\Mod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AdminController extends Controller
{


    // ============ GESTIÓN DE COMENTARIOS ============

    /**
     * Obtener todos los comentarios con filtros y paginación
     */
    public function getComentarios(Request $request)
    {
        try {
            // Debug: Log para verificar que se está ejecutando
            Log::info('AdminController::getComentarios llamado', [
                'user_id' => Auth::id(),
                'user_role' => Auth::user() ? Auth::user()->rol : 'no_auth',
                'request_params' => $request->all()
            ]);

            // Verificar que hay comentarios en la base de datos
            $totalComentarios = Comentario::count();
            Log::info('Total comentarios en BD:', ['count' => $totalComentarios]);

            // Parámetros de paginación
            $perPage = $request->input('per_page', 10);
            $page = $request->input('page', 1);
            $search = $request->input('search', '');
            $modFilter = $request->input('mod_filter', '');
            $userFilter = $request->input('user_filter', '');
            $sortBy = $request->input('sort_by', 'created_at');
            $sortOrder = $request->input('sort_order', 'desc');

            // Construir consulta básica sin relaciones primero
            $query = Comentario::query();

            // Aplicar filtros
            if (!empty($search)) {
                $query->where('contenido', 'like', "%{$search}%");
            }

            if (!empty($modFilter)) {
                $query->whereHas('mod', function ($q) use ($modFilter) {
                    $q->where('titulo', 'like', "%{$modFilter}%");
                });
            }

            if (!empty($userFilter)) {
                $query->whereHas('usuario', function ($q) use ($userFilter) {
                    $q->where('nome', 'like', "%{$userFilter}%");
                });
            }

            // Aplicar ordenamiento básico
            $query->orderBy('created_at', 'desc');

            // Obtener comentarios paginados
            $comentarios = $query->paginate($perPage, ['*'], 'page', $page);

            Log::info('Comentarios obtenidos:', ['count' => $comentarios->count()]);

            // Cargar relaciones manualmente para cada comentario
            $comentarios->getCollection()->transform(function ($comentario) {
                try {
                    // Cargar usuario
                    $usuario = null;
                    if ($comentario->usuario_id) {
                        $usuario = \App\Models\Usuario::find($comentario->usuario_id);
                    }

                    // Cargar mod
                    $mod = null;
                    if ($comentario->mod_id) {
                        $mod = \App\Models\Mod::find($comentario->mod_id);
                    }

                    return [
                        'id' => $comentario->id,
                        'contenido' => $comentario->contenido,
                        'usuario_id' => $comentario->usuario_id,
                        'mod_id' => $comentario->mod_id,
                        'created_at' => $comentario->created_at,
                        'updated_at' => $comentario->updated_at,
                        'usuario' => $usuario ? [
                            'id' => $usuario->id,
                            'nome' => $usuario->nome ?? 'Sin nombre',
                            'email' => $usuario->email ?? 'Sin email',
                            'foto_perfil' => $usuario->foto_perfil ? 
                                asset('storage/' . $usuario->foto_perfil) : null,
                        ] : null,
                        'mod' => $mod ? [
                            'id' => $mod->id,
                            'titulo' => $mod->titulo ?? 'Sin título',
                            'descripcion' => $mod->descripcion ?? 'Sin descripción',
                            'imagen' => $mod->imagen ? 
                                asset('storage/' . $mod->imagen) : null,
                        ] : null,
                    ];
                } catch (\Exception $e) {
                    Log::error('Error al transformar comentario:', [
                        'comentario_id' => $comentario->id,
                        'error' => $e->getMessage()
                    ]);
                    
                    return [
                        'id' => $comentario->id,
                        'contenido' => $comentario->contenido,
                        'usuario_id' => $comentario->usuario_id,
                        'mod_id' => $comentario->mod_id,
                        'created_at' => $comentario->created_at,
                        'updated_at' => $comentario->updated_at,
                        'usuario' => null,
                        'mod' => null,
                    ];
                }
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
            Log::error('Error al obtener comentarios para admin:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Error al cargar los comentarios: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener un comentario específico
     */
    public function getComentario($comentarioId)
    {
        try {
            $comentario = Comentario::with(['usuario:id,nome,email,foto_perfil', 'mod:id,titulo,imagen,descripcion'])
                ->findOrFail($comentarioId);

            $comentarioData = [
                'id' => $comentario->id,
                'contenido' => $comentario->contenido,
                'usuario_id' => $comentario->usuario_id,
                'mod_id' => $comentario->mod_id,
                'created_at' => $comentario->created_at,
                'updated_at' => $comentario->updated_at,
                'usuario' => $comentario->usuario ? [
                    'id' => $comentario->usuario->id,
                    'nome' => $comentario->usuario->nome,
                    'email' => $comentario->usuario->email,
                    'foto_perfil' => $comentario->usuario->foto_perfil ? 
                        asset('storage/' . $comentario->usuario->foto_perfil) : null,
                ] : null,
                'mod' => $comentario->mod ? [
                    'id' => $comentario->mod->id,
                    'titulo' => $comentario->mod->titulo,
                    'descripcion' => $comentario->mod->descripcion,
                    'imagen' => $comentario->mod->imagen ? 
                        asset('storage/' . $comentario->mod->imagen) : null,
                ] : null,
            ];

            return response()->json([
                'status' => 'success',
                'data' => $comentarioData
            ]);

        } catch (\Exception $e) {
            Log::error('Error al obtener comentario para admin:', [
                'comentario_id' => $comentarioId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Comentario no encontrado'
            ], 404);
        }
    }

    /**
     * Actualizar un comentario (admin)
     */
    public function updateComentario(Request $request, $comentarioId)
    {
        try {
            // Validar datos
            $validatedData = $request->validate([
                'contenido' => 'required|string|min:3|max:1000',
            ], [
                'contenido.required' => 'El contenido del comentario es obligatorio',
                'contenido.min' => 'El comentario debe tener al menos 3 caracteres',
                'contenido.max' => 'El comentario no puede exceder los 1000 caracteres',
            ]);

            // Buscar el comentario
            $comentario = Comentario::findOrFail($comentarioId);

            // Actualizar el comentario
            $comentario->update([
                'contenido' => trim($validatedData['contenido']),
            ]);

            // Recargar el modelo para obtener los datos actualizados
            $comentario->refresh();

            // Cargar las relaciones de forma más robusta
            try {
                $usuario = $comentario->usuario_id ? Usuario::find($comentario->usuario_id) : null;
                $mod = $comentario->mod_id ? Mod::find($comentario->mod_id) : null;
            } catch (\Exception $e) {
                // Si hay error cargando relaciones, usar datos básicos
                $usuario = null;
                $mod = null;
            }

            // Formatear respuesta de forma más simple
            $comentarioData = [
                'id' => $comentario->id,
                'contenido' => $comentario->contenido,
                'usuario_id' => $comentario->usuario_id,
                'mod_id' => $comentario->mod_id,
                'created_at' => $comentario->created_at->toISOString(),
                'updated_at' => $comentario->updated_at->toISOString(),
                'usuario' => $usuario ? [
                    'id' => $usuario->id,
                    'nome' => $usuario->nome ?? 'Sin nombre',
                    'email' => $usuario->email ?? '',
                    'foto_perfil' => $usuario->foto_perfil ? 
                        asset('storage/' . $usuario->foto_perfil) : null,
                ] : null,
                'mod' => $mod ? [
                    'id' => $mod->id,
                    'titulo' => $mod->titulo ?? 'Sin título',
                    'descripcion' => $mod->descripcion ?? '',
                    'imagen' => $mod->imagen ? 
                        asset('storage/' . $mod->imagen) : null,
                ] : null,
            ];

            Log::info('Comentario actualizado por admin:', [
                'comentario_id' => $comentario->id,
                'admin_id' => Auth::id(),
                'original_user_id' => $comentario->usuario_id
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Comentario actualizado exitosamente',
                'data' => $comentarioData
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Datos de comentario inválidos',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Error al actualizar comentario (admin):', [
                'comentario_id' => $comentarioId,
                'admin_id' => Auth::id(),
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Error al actualizar el comentario'
            ], 500);
        }
    }

    /**
     * Eliminar un comentario (admin)
     */
    public function deleteComentario($comentarioId)
    {
        try {
            // Buscar el comentario
            $comentario = Comentario::findOrFail($comentarioId);

            // Eliminar el comentario
            $comentario->delete();

            Log::info('Comentario eliminado por admin:', [
                'comentario_id' => $comentarioId,
                'admin_id' => Auth::id(),
                'original_user_id' => $comentario->usuario_id,
                'mod_id' => $comentario->mod_id
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Comentario eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            Log::error('Error al eliminar comentario (admin):', [
                'comentario_id' => $comentarioId,
                'admin_id' => Auth::id(),
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
     * Obtener estadísticas de comentarios
     */
    public function getComentariosStats()
    {
        try {
            $stats = [
                'total_comentarios' => Comentario::count(),
                'comentarios_hoy' => Comentario::whereDate('created_at', today())->count(),
                'comentarios_esta_semana' => Comentario::whereBetween('created_at', [
                    now()->startOfWeek(), 
                    now()->endOfWeek()
                ])->count(),
                'comentarios_este_mes' => Comentario::whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count(),
                'comentarios_editados' => Comentario::whereColumn('updated_at', '!=', 'created_at')->count(),
                'promedio_caracteres' => Comentario::selectRaw('AVG(LENGTH(contenido)) as promedio')->first()->promedio ?? 0,
                'usuario_mas_activo' => Comentario::select('usuario_id', DB::raw('count(*) as total'))
                    ->groupBy('usuario_id')
                    ->orderBy('total', 'desc')
                    ->with('usuario:id,nome')
                    ->first(),
                'mod_mas_comentado' => Comentario::select('mod_id', DB::raw('count(*) as total'))
                    ->groupBy('mod_id')
                    ->orderBy('total', 'desc')
                    ->with('mod:id,titulo')
                    ->first(),
            ];

            return response()->json([
                'status' => 'success',
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Error al obtener estadísticas de comentarios:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Error al cargar las estadísticas'
            ], 500);
        }
    }
} 