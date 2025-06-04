<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\Mod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        Log::info('Intento de login', ['request' => $request->all()]);

        try {
            $request->validate([
                'correo' => 'required|email',
                'contrasina' => 'required'
            ]);

            $usuario = Usuario::where('correo', $request->correo)->first();

            if (!$usuario) {
                Log::warning('Usuario no encontrado', ['correo' => $request->correo]);
                return response()->json([
                    'message' => 'Credenciales inválidas'
                ], 401);
            }

            if (!Hash::check($request->contrasina, $usuario->contrasina)) {
                Log::warning('Contraseña incorrecta', ['usuario_id' => $usuario->id]);
                return response()->json([
                    'message' => 'Credenciales inválidas'
                ], 401);
            }

            $token = $usuario->createToken('auth_token')->plainTextToken;

            Log::info('Login exitoso', ['usuario_id' => $usuario->id]);

            return response()->json([
                'token' => $token,
                'user' => [
                    'id' => $usuario->id,
                    'nome' => $usuario->nome,
                    'correo' => $usuario->correo,
                    'rol' => $usuario->rol,
                    'foto_perfil' => $usuario->foto_perfil
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error en login', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error en el servidor'
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'message' => 'Logout exitoso'
        ]);
    }

    public function register(Request $request)
    {
        Log::info('Intento de registro', ['request' => $request->all()]);

        try {
            $request->validate([
                'nome' => 'required|string|max:255',
                'correo' => 'required|string|email|max:255|unique:usuarios',
                'contrasina' => 'required|string|min:6',
                'nombre' => 'required|string|max:255',
                'apelidos' => 'required|string|max:255'
            ]);

            $usuario = Usuario::create([
                'nome' => $request->nome,
                'correo' => $request->correo,
                'contrasina' => Hash::make($request->contrasina),
                'nombre' => $request->nombre,
                'apelidos' => $request->apelidos,
                'foto_perfil' => null,
                'rol' => 'usuario' // Por defecto, todos los nuevos registros son usuarios normales
            ]);

            $token = $usuario->createToken('auth_token')->plainTextToken;

            Log::info('Registro exitoso', ['usuario_id' => $usuario->id]);

            return response()->json([
                'message' => 'Usuario registrado exitosamente',
                'token' => $token,
                'user' => [
                    'id' => $usuario->id,
                    'nome' => $usuario->nome,
                    'correo' => $usuario->correo,
                    'rol' => $usuario->rol,
                    'foto_perfil' => $usuario->foto_perfil
                ]
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error en registro', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Si es un error de validación, devolver los errores específicos
            if ($e instanceof \Illuminate\Validation\ValidationException) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $e->errors()
                ], 422);
            }
            
            return response()->json([
                'message' => 'Error en el servidor'
            ], 500);
        }
    }

    public function resetPassword(Request $request)
    {
        try {
            $request->validate([
                'correo' => 'required|email',
                'contrasena_actual' => 'required',
                'nueva_contrasena' => 'required|min:8'
            ]);

            $usuario = Usuario::where('correo', $request->correo)->first();

            if (!$usuario) {
                return response()->json([
                    'message' => 'Usuario no encontrado'
                ], 404);
            }

            if (!Hash::check($request->contrasena_actual, $usuario->contrasina)) {
                return response()->json([
                    'message' => 'La contraseña actual es incorrecta'
                ], 401);
            }

            $usuario->contrasina = Hash::make($request->nueva_contrasena);
            $usuario->save();

            // Invalidar todos los tokens del usuario
            $usuario->tokens()->delete();

            return response()->json([
                'message' => 'Contraseña cambiada exitosamente'
            ]);
        } catch (\Exception $e) {
            Log::error('Error al cambiar contraseña', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Error al cambiar la contraseña'
            ], 500);
        }
    }

    public function isAdmin(Request $request)
    {
        $usuario = $request->user();
        
        return response()->json([
            'is_admin' => $usuario->rol === 'admin',
            'rol' => $usuario->rol
        ]);
    }

    // Métodos de administración de usuarios
    public function getAllUsers(Request $request)
    {
        try {
            $usuarios = Usuario::select('id', 'nome', 'correo', 'rol', 'nombre', 'apelidos', 'sobre_mi', 'foto_perfil', 'created_at')
                ->withCount('mods')
                ->orderBy('nome', 'asc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $usuarios->map(function ($usuario) {
                    return [
                        'id' => $usuario->id,
                        'nome' => $usuario->nome,
                        'correo' => $usuario->correo,
                        'rol' => $usuario->rol,
                        'nombre_completo' => $usuario->nombre . ' ' . $usuario->apelidos,
                        'estado' => 'activo', // Por defecto, puedes añadir este campo a la BD si lo necesitas
                        'fecha_registro' => $usuario->created_at->format('Y-m-d'),
                        'tiene_mods' => $usuario->mods_count > 0,
                        'foto_perfil' => $usuario->foto_perfil
                    ];
                })
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener usuarios', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener usuarios'
            ], 500);
        }
    }

    public function getUserDetails(Request $request, $id)
    {
        try {
            $usuario = Usuario::findOrFail($id);
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'id' => $usuario->id,
                    'nome' => $usuario->nome,
                    'correo' => $usuario->correo,
                    'rol' => $usuario->rol,
                    'nombre' => $usuario->nombre,
                    'apelidos' => $usuario->apelidos,
                    'sobre_mi' => $usuario->sobre_mi,
                    'fecha_registro' => $usuario->created_at->format('Y-m-d H:i:s'),
                    'foto_perfil' => $usuario->foto_perfil
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Usuario no encontrado'
            ], 404);
        }
    }

    public function updateUserRole(Request $request, $id)
    {
        try {
            $request->validate([
                'rol' => 'required|in:usuario,admin',
                'nome' => 'sometimes|string|max:255|unique:usuarios,nome,' . $id,
                'nombre' => 'sometimes|string|max:255',
                'apelidos' => 'sometimes|string|max:255',
                'sobre_mi' => 'sometimes|nullable|string|max:1000',
                'foto_perfil' => 'sometimes|nullable|string'
            ]);

            $usuario = Usuario::findOrFail($id);
            
            // Evitar que el usuario se elimine a sí mismo el rol de admin
            if ($usuario->id === $request->user()->id && $request->rol !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No puedes cambiar tu propio rol de administrador'
                ], 403);
            }

            // Solo los administradores pueden cambiar nombres de usuario
            if ($request->has('nome') && $request->user()->rol !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Solo los administradores pueden cambiar nombres de usuario'
                ], 403);
            }

            $usuario->rol = $request->rol;
            
            // Actualizar otros campos si se proporcionan
            if ($request->has('nome') && $request->user()->rol === 'admin') {
                $usuario->nome = $request->nome;
            }
            if ($request->has('nombre')) {
                $usuario->nombre = $request->nombre;
            }
            if ($request->has('apelidos')) {
                $usuario->apelidos = $request->apelidos;
            }
            if ($request->has('sobre_mi')) {
                $usuario->sobre_mi = $request->sobre_mi;
            }
            if ($request->has('foto_perfil')) {
                $usuario->foto_perfil = $request->foto_perfil;
            }
            
            $usuario->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Usuario actualizado correctamente',
                'data' => $usuario
            ]);
        } catch (\Exception $e) {
            Log::error('Error al actualizar usuario', [
                'error' => $e->getMessage(),
                'user_id' => $id
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error al actualizar el usuario'
            ], 500);
        }
    }

    public function updateUserStatus(Request $request, $id)
    {
        try {
            $request->validate([
                'estado' => 'required|in:activo,suspendido,inactivo'
            ]);

            // Por ahora solo retornamos éxito ya que no tenemos campo estado en la BD
            // Puedes añadir el campo 'estado' a la tabla usuarios si lo necesitas
            return response()->json([
                'status' => 'success',
                'message' => 'Estado actualizado correctamente (simulado)'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al actualizar el estado'
            ], 500);
        }
    }

    public function deleteUser(Request $request, $id)
    {
        try {
            $usuario = Usuario::findOrFail($id);
            
            // Evitar que el usuario se elimine a sí mismo
            if ($usuario->id === $request->user()->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No puedes eliminar tu propia cuenta'
                ], 403);
            }

            // Verificar si el usuario tiene mods asociados
            if ($usuario->mods()->count() > 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No se puede eliminar un usuario que tiene mods publicados'
                ], 422);
            }

            $usuario->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Usuario eliminado correctamente'
            ]);
        } catch (\Exception $e) {
            Log::error('Error al eliminar usuario', [
                'error' => $e->getMessage(),
                'user_id' => $id
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error al eliminar el usuario'
            ], 500);
        }
    }

    public function forceDeleteUser(Request $request, $id)
    {
        try {
            $usuario = Usuario::findOrFail($id);
            
            // Evitar que el usuario se elimine a sí mismo
            if ($usuario->id === $request->user()->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No puedes eliminar tu propia cuenta'
                ], 403);
            }

            // Eliminar solo las relaciones directas del usuario, NO los mods
            $usuario->modsGuardados()->detach();
            $usuario->juegosFavoritos()->detach();
            $usuario->valoraciones()->delete();
            $usuario->comentarios()->delete();
            $usuario->redesSociales()->delete();

            // La eliminación de archivos la maneja automáticamente UsuarioObserver
            // Eliminar definitivamente
            $usuario->forceDelete();

            return response()->json([
                'status' => 'success',
                'message' => 'Usuario eliminado definitivamente'
            ]);
        } catch (\Exception $e) {
            Log::error('Error al eliminar usuario', [
                'error' => $e->getMessage(),
                'user_id' => $id
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error al eliminar el usuario'
            ], 500);
        }
    }

    public function softDeleteUser(Request $request, $id)
    {
        try {
            $usuario = Usuario::findOrFail($id);
            
            // Evitar que el usuario se elimine a sí mismo
            if ($usuario->id === $request->user()->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No puedes eliminar tu propia cuenta'
                ], 403);
            }

            // Hacer soft delete del usuario (mantiene los mods)
            $usuario->delete(); // Con SoftDeletes, esto hace soft delete

            return response()->json([
                'status' => 'success',
                'message' => 'Usuario desactivado correctamente (los mods se mantienen)'
            ]);
        } catch (\Exception $e) {
            Log::error('Error al desactivar usuario', [
                'error' => $e->getMessage(),
                'user_id' => $id
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error al desactivar el usuario'
            ], 500);
        }
    }

    // Obtener usuarios eliminados (soft deleted)
    public function getDeletedUsers(Request $request)
    {
        try {
            $usuarios = Usuario::onlyTrashed()
                ->select('id', 'nome', 'correo', 'rol', 'nombre', 'apelidos', 'sobre_mi', 'foto_perfil', 'created_at', 'deleted_at')
                ->withCount('mods')
                ->orderBy('deleted_at', 'desc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data' => $usuarios->map(function ($usuario) {
                    return [
                        'id' => $usuario->id,
                        'nome' => $usuario->nome,
                        'correo' => $usuario->correo,
                        'rol' => $usuario->rol,
                        'nombre_completo' => $usuario->nombre . ' ' . $usuario->apelidos,
                        'fecha_registro' => $usuario->created_at->format('Y-m-d'),
                        'fecha_eliminacion' => $usuario->deleted_at->format('Y-m-d H:i:s'),
                        'tiene_mods' => $usuario->mods_count > 0,
                        'foto_perfil' => $usuario->foto_perfil
                    ];
                })
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener usuarios eliminados', [
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener usuarios eliminados'
            ], 500);
        }
    }

    // Restaurar usuario eliminado
    public function restoreUser(Request $request, $id)
    {
        try {
            $usuario = Usuario::onlyTrashed()->findOrFail($id);
            $usuario->restore();

            return response()->json([
                'status' => 'success',
                'message' => 'Usuario restaurado correctamente'
            ]);
        } catch (\Exception $e) {
            Log::error('Error al restaurar usuario', [
                'error' => $e->getMessage(),
                'user_id' => $id
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error al restaurar el usuario'
            ], 500);
        }
    }

    // Eliminar usuario definitivamente (force delete)
    public function permanentDeleteUser(Request $request, $id)
    {
        try {
            $usuario = Usuario::onlyTrashed()->findOrFail($id);

            // Eliminar relaciones del usuario
            $usuario->modsGuardados()->detach();
            $usuario->juegosFavoritos()->detach();
            $usuario->valoraciones()->delete();
            $usuario->comentarios()->delete();
            $usuario->redesSociales()->delete();

            // La eliminación de archivos la maneja automáticamente UsuarioObserver
            // Eliminar definitivamente
            $usuario->forceDelete();

            return response()->json([
                'status' => 'success',
                'message' => 'Usuario eliminado definitivamente'
            ]);
        } catch (\Exception $e) {
            Log::error('Error al eliminar usuario definitivamente', [
                'error' => $e->getMessage(),
                'user_id' => $id
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error al eliminar el usuario definitivamente'
            ], 500);
        }
    }

    // Eliminar usuario definitivamente con todos sus mods
    public function permanentDeleteUserWithMods(Request $request, $id)
    {
        try {
            $usuario = Usuario::onlyTrashed()->findOrFail($id);

            // Eliminar todos los mods del usuario (ModObserver manejará archivos automáticamente)
            $mods = $usuario->mods;
            
            foreach ($mods as $mod) {
                // ModObserver se encargará automáticamente de:
                // - Eliminar imagen banner y imágenes adicionales
                // - Eliminar relaciones many-to-many
                // - Eliminar valoraciones y comentarios
                // - Eliminar versiones (VersionModObserver elimina archivos)
                $mod->delete();
            }

            // Eliminar relaciones del usuario
            $usuario->modsGuardados()->detach();
            $usuario->juegosFavoritos()->detach();
            $usuario->valoraciones()->delete();
            $usuario->comentarios()->delete();
            $usuario->redesSociales()->delete();

            // UsuarioObserver se encargará automáticamente de eliminar foto_perfil y carpeta
            // Eliminar definitivamente
            $usuario->forceDelete();

            return response()->json([
                'status' => 'success',
                'message' => 'Usuario y todos sus mods eliminados definitivamente'
            ]);
        } catch (\Exception $e) {
            Log::error('Error al eliminar usuario con mods definitivamente', [
                'error' => $e->getMessage(),
                'user_id' => $id
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error al eliminar el usuario con mods definitivamente'
            ], 500);
        }
    }

    public function uploadProfileImage(Request $request)
    {
        try {
            $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB máximo
                'user_id' => 'nullable|integer|exists:usuarios,id' // Permitir especificar el usuario (para admins)
            ]);

            $image = $request->file('image');
            
            // Determinar el ID del usuario
            $userId = $request->input('user_id');
            if (!$userId) {
                // Si no se especifica user_id, usar el usuario autenticado
                $userId = $request->user()->id;
            } else {
                // Verificar que el usuario sea admin para subir imagen de otro usuario
                if ($request->user()->rol !== 'admin') {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'No tienes permisos para subir imagen de otro usuario'
                    ], 403);
                }
            }
            
            // Crear estructura de carpetas: users/user_X/
            $userFolder = "users/user_{$userId}";
            $uploadPath = storage_path("app/public/{$userFolder}");
            
            if (!file_exists($uploadPath)) {
                mkdir($uploadPath, 0755, true);
            }
            
            // Eliminar imagen anterior si existe
            $usuario = Usuario::find($userId);
            if ($usuario && $usuario->foto_perfil) {
                $oldImagePath = storage_path("app/public/{$usuario->foto_perfil}");
                if (file_exists($oldImagePath)) {
                    unlink($oldImagePath);
                }
            }
            
            // Generar nombre de archivo: user_X_avatar.extension
            $extension = $image->getClientOriginalExtension();
            $imageName = "user_{$userId}_avatar.{$extension}";
            
            // Mover archivo
            $image->move($uploadPath, $imageName);
            
            // Ruta relativa para guardar en la base de datos
            $relativeImagePath = "{$userFolder}/{$imageName}";
            
            // Actualizar la foto de perfil del usuario en la base de datos
            $usuario->update(['foto_perfil' => $relativeImagePath]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Imagen subida correctamente',
                'data' => [
                    'url' => $relativeImagePath,
                    'filename' => $imageName
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error al subir imagen', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error al subir la imagen: ' . $e->getMessage()
            ], 500);
        }
    }

    // Obtener estadísticas de un usuario específico
    public function getUserStats(Request $request, $id)
    {
        try {
            $usuario = Usuario::with(['mods.valoraciones', 'mods.versiones'])->findOrFail($id);
            
            // Calcular estadísticas de mods
            $totalMods = $usuario->mods->count();
            $modsPublicados = $usuario->mods->where('estado', 'publicado')->count();
            $modsBorradores = $usuario->mods->where('estado', 'borrador')->count();
            
            // Calcular descargas totales
            $totalDescargas = 0;
            foreach ($usuario->mods as $mod) {
                foreach ($mod->versiones as $version) {
                    $totalDescargas += $version->descargas;
                }
            }
            
            // Calcular valoración promedio
            $totalValoraciones = 0;
            $sumaValoraciones = 0;
            foreach ($usuario->mods as $mod) {
                foreach ($mod->valoraciones as $valoracion) {
                    $totalValoraciones++;
                    $sumaValoraciones += $valoracion->puntuacion;
                }
            }
            $valoracionPromedio = $totalValoraciones > 0 ? round($sumaValoraciones / $totalValoraciones, 2) : 0;
            
            // Calcular mods guardados por otros usuarios
            $totalGuardados = 0;
            foreach ($usuario->mods as $mod) {
                $totalGuardados += $mod->usuariosGuardados()->count();
            }
            
            // Fecha del primer mod
            $primerMod = $usuario->mods->sortBy('created_at')->first();
            $fechaPrimerMod = $primerMod ? $primerMod->created_at->format('Y-m-d') : null;
            
            // Fecha del último mod
            $ultimoMod = $usuario->mods->sortByDesc('created_at')->first();
            $fechaUltimoMod = $ultimoMod ? $ultimoMod->created_at->format('Y-m-d') : null;

            return response()->json([
                'status' => 'success',
                'data' => [
                    'total_mods' => $totalMods,
                    'mods_publicados' => $modsPublicados,
                    'mods_borradores' => $modsBorradores,
                    'total_descargas' => $totalDescargas,
                    'total_valoraciones' => $totalValoraciones,
                    'valoracion_promedio' => $valoracionPromedio,
                    'total_guardados' => $totalGuardados,
                    'fecha_primer_mod' => $fechaPrimerMod,
                    'fecha_ultimo_mod' => $fechaUltimoMod,
                    'fecha_registro' => $usuario->created_at->format('Y-m-d'),
                    'dias_activo' => $usuario->created_at->diffInDays(now())
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener estadísticas del usuario', [
                'error' => $e->getMessage(),
                'user_id' => $id
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener estadísticas del usuario'
            ], 500);
        }
    }

    // Subir imagen banner para mod (copiado del uploadProfileImage)
    public function uploadModBanner(Request $request)
    {
        try {
            $request->validate([
                'imagen_banner' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB máximo
                'mod_id' => 'required|integer|exists:mods,id'
            ]);

            $image = $request->file('imagen_banner');
            $modId = $request->input('mod_id');
            
            // Verificar que el usuario tenga permisos para subir imagen del mod
            $mod = \App\Models\Mod::findOrFail($modId);
            $currentUser = $request->user();
            
            // Solo el creador del mod o un admin pueden subir la imagen banner
            if ($mod->creador_id !== $currentUser->id && $currentUser->rol !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No tienes permisos para subir imagen de este mod'
                ], 403);
            }
            
            // Sanitizar el nombre del mod para usarlo como nombre de carpeta
            $nombreModSanitizado = preg_replace('/[^a-zA-Z0-9_\-\s]/', '', $mod->titulo);
            $nombreModSanitizado = preg_replace('/\s+/', '_', trim($nombreModSanitizado));
            $nombreModSanitizado = strtolower($nombreModSanitizado);
            
            // Crear estructura de carpetas: mods/{nombre_mod}/banners/
            $modFolder = "mods/{$nombreModSanitizado}/banners";
            $uploadPath = storage_path("app/public/{$modFolder}");
            
            if (!file_exists($uploadPath)) {
                mkdir($uploadPath, 0755, true);
            }
            
            // Eliminar imagen banner anterior si existe
            if ($mod->imagen_banner && Storage::exists('public/' . $mod->imagen_banner)) {
                Storage::delete('public/' . $mod->imagen_banner);
            }
            
            // Generar nombre de archivo: banner_timestamp.extension
            $extension = $image->getClientOriginalExtension();
            $nombreArchivo = 'banner_' . time() . '.' . $extension;
            
            // Mover archivo a la carpeta correcta
            $image->move($uploadPath, $nombreArchivo);
            
            // Ruta relativa para guardar en la base de datos
            $relativeImagePath = "{$modFolder}/{$nombreArchivo}";
            
            // Actualizar la imagen banner del mod en la base de datos
            $mod->update(['imagen_banner' => $relativeImagePath]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Imagen banner subida correctamente',
                'data' => [
                    'url' => $relativeImagePath,
                    'filename' => $nombreArchivo,
                    'imagen_banner' => $relativeImagePath
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error al subir imagen banner del mod', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'mod_id' => $request->input('mod_id')
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error al subir la imagen banner: ' . $e->getMessage()
            ], 500);
        }
    }

    // Subir imágenes adicionales para mod
    public function uploadModAdditionalImages(Request $request)
    {
        try {
            $request->validate([
                'imagenes_adicionales' => 'required|array|min:1|max:10', // Máximo 10 imágenes
                'imagenes_adicionales.*' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB máximo cada una
                'mod_id' => 'required|integer|exists:mods,id'
            ]);

            $images = $request->file('imagenes_adicionales');
            $modId = $request->input('mod_id');
            
            // Verificar que el usuario tenga permisos para subir imágenes del mod
            $mod = \App\Models\Mod::findOrFail($modId);
            $currentUser = $request->user();
            
            // Solo el creador del mod o un admin pueden subir imágenes adicionales
            if ($mod->creador_id !== $currentUser->id && $currentUser->rol !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No tienes permisos para subir imágenes de este mod'
                ], 403);
            }
            
            // Sanitizar el nombre del mod para usarlo como nombre de carpeta
            $nombreModSanitizado = preg_replace('/[^a-zA-Z0-9_\-\s]/', '', $mod->titulo);
            $nombreModSanitizado = preg_replace('/\s+/', '_', trim($nombreModSanitizado));
            $nombreModSanitizado = strtolower($nombreModSanitizado);
            
            // Crear estructura de carpetas: mods/{nombre_mod}/imagenes_adicionales/
            $modFolder = "mods/{$nombreModSanitizado}/imagenes_adicionales";
            $uploadPath = storage_path("app/public/{$modFolder}");
            
            if (!file_exists($uploadPath)) {
                mkdir($uploadPath, 0755, true);
            }
            
            // Procesar cada imagen
            $uploadedImages = [];
            $timestamp = time();
            
            foreach ($images as $index => $image) {
                // Generar nombre de archivo único: adicional_{timestamp}_{index}.extension
                $extension = $image->getClientOriginalExtension();
                $nombreArchivo = "adicional_{$timestamp}_{$index}.{$extension}";
                
                // Mover archivo a la carpeta correcta
                $image->move($uploadPath, $nombreArchivo);
                
                // Ruta relativa para guardar en la base de datos
                $relativeImagePath = "{$modFolder}/{$nombreArchivo}";
                $uploadedImages[] = $relativeImagePath;
            }
            
            // Obtener imágenes adicionales existentes
            $imagenesExistentes = [];
            if ($mod->imagenes_adicionales) {
                if (is_string($mod->imagenes_adicionales)) {
                    $imagenesExistentes = json_decode($mod->imagenes_adicionales, true) ?: [];
                } elseif (is_array($mod->imagenes_adicionales)) {
                    $imagenesExistentes = $mod->imagenes_adicionales;
                }
            }
            
            // Combinar imágenes existentes con las nuevas
            $todasLasImagenes = array_merge($imagenesExistentes, $uploadedImages);
            
            // Actualizar las imágenes adicionales del mod en la base de datos
            $mod->update(['imagenes_adicionales' => json_encode($todasLasImagenes)]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Imágenes adicionales subidas correctamente',
                'data' => [
                    'imagenes_subidas' => $uploadedImages,
                    'total_imagenes_subidas' => count($uploadedImages),
                    'todas_las_imagenes' => $todasLasImagenes,
                    'total_imagenes' => count($todasLasImagenes)
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error al subir imágenes adicionales del mod', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'mod_id' => $request->input('mod_id')
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error al subir las imágenes adicionales: ' . $e->getMessage()
            ], 500);
        }
    }

    // Eliminar imagen adicional específica del mod
    public function deleteModAdditionalImage(Request $request)
    {
        try {
            $request->validate([
                'mod_id' => 'required|integer|exists:mods,id',
                'imagen_ruta' => 'required|string'
            ]);

            $modId = $request->input('mod_id');
            $imagenRuta = $request->input('imagen_ruta');
            
            // Verificar que el usuario tenga permisos
            $mod = \App\Models\Mod::findOrFail($modId);
            $currentUser = $request->user();
            
            if ($mod->creador_id !== $currentUser->id && $currentUser->rol !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No tienes permisos para eliminar imágenes de este mod'
                ], 403);
            }
            
            // Obtener imágenes adicionales existentes
            $imagenesExistentes = [];
            if ($mod->imagenes_adicionales) {
                if (is_string($mod->imagenes_adicionales)) {
                    $imagenesExistentes = json_decode($mod->imagenes_adicionales, true) ?: [];
                } elseif (is_array($mod->imagenes_adicionales)) {
                    $imagenesExistentes = $mod->imagenes_adicionales;
                }
            }
            
            // Buscar y eliminar la imagen de la lista
            $nuevasImagenes = array_filter($imagenesExistentes, function($imagen) use ($imagenRuta) {
                return $imagen !== $imagenRuta;
            });
            
            // Verificar que la imagen existía en la lista
            if (count($nuevasImagenes) === count($imagenesExistentes)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'La imagen especificada no existe en este mod'
                ], 404);
            }
            
            // Eliminar archivo físico del almacenamiento
            if (Storage::exists('public/' . $imagenRuta)) {
                Storage::delete('public/' . $imagenRuta);
            }
            
            // Actualizar la base de datos
            $mod->update(['imagenes_adicionales' => json_encode(array_values($nuevasImagenes))]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Imagen eliminada correctamente',
                'data' => [
                    'imagenes_restantes' => array_values($nuevasImagenes),
                    'total_imagenes' => count($nuevasImagenes)
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error al eliminar imagen adicional del mod', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'mod_id' => $request->input('mod_id'),
                'imagen_ruta' => $request->input('imagen_ruta')
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error al eliminar la imagen: ' . $e->getMessage()
            ], 500);
        }
    }

    // Crear usuario desde panel de administración
    public function createUser(Request $request)
    {
        try {
            $request->validate([
                'nome' => 'required|string|max:255|unique:usuarios',
                'correo' => 'required|string|email|max:255|unique:usuarios',
                'contrasina' => 'required|string|min:6',
                'nombre' => 'required|string|max:255',
                'apelidos' => 'required|string|max:255',
                'rol' => 'required|in:usuario,admin'
            ]);

            $usuario = Usuario::create([
                'nome' => $request->nome,
                'correo' => $request->correo,
                'contrasina' => Hash::make($request->contrasina),
                'nombre' => $request->nombre,
                'apelidos' => $request->apelidos,
                'foto_perfil' => null,
                'rol' => $request->rol
            ]);

            Log::info('Usuario creado por administrador', [
                'usuario_creado_id' => $usuario->id,
                'admin_id' => $request->user()->id
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Usuario creado exitosamente',
                'data' => [
                    'id' => $usuario->id,
                    'nome' => $usuario->nome,
                    'correo' => $usuario->correo,
                    'rol' => $usuario->rol,
                    'foto_perfil' => $usuario->foto_perfil,
                    'nombre_completo' => $usuario->nombre . ' ' . $usuario->apelidos,
                    'estado' => 'activo',
                    'fecha_registro' => $usuario->created_at->format('Y-m-d'),
                    'tiene_mods' => false
                ]
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error al crear usuario', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Si es un error de validación, devolver los errores específicos
            if ($e instanceof \Illuminate\Validation\ValidationException) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Error de validación',
                    'errors' => $e->errors()
                ], 422);
            }
            
            return response()->json([
                'status' => 'error',
                'message' => 'Error al crear el usuario'
            ], 500);
        }
    }

    // Obtener perfil del usuario actual
    public function getCurrentProfile(Request $request)
    {
        try {
            $user = $request->user();
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'id' => $user->id,
                    'nome' => $user->nome,
                    'correo' => $user->correo,
                    'nombre' => $user->nombre,
                    'apelidos' => $user->apelidos,
                    'sobre_mi' => $user->sobre_mi,
                    'rol' => $user->rol,
                    'foto_perfil' => $user->foto_perfil,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener perfil del usuario', [
                'error' => $e->getMessage(),
                'user_id' => $request->user()->id
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener el perfil'
            ], 500);
        }
    }

    // Actualizar perfil del usuario actual
    public function updateProfile(Request $request)
    {
        try {
            $user = $request->user();
            
            $request->validate([
                'nombre' => 'nullable|string|max:255',
                'apelidos' => 'nullable|string|max:255',
                'sobre_mi' => 'nullable|string|max:1000'
            ]);

            $user->update([
                'nombre' => $request->nombre,
                'apelidos' => $request->apelidos,
                'sobre_mi' => $request->sobre_mi
            ]);

            Log::info('Perfil actualizado', [
                'user_id' => $user->id
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Perfil actualizado correctamente',
                'data' => [
                    'id' => $user->id,
                    'nome' => $user->nome,
                    'correo' => $user->correo,
                    'nombre' => $user->nombre,
                    'apelidos' => $user->apelidos,
                    'sobre_mi' => $user->sobre_mi,
                    'rol' => $user->rol,
                    'foto_perfil' => $user->foto_perfil,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error al actualizar perfil del usuario', [
                'error' => $e->getMessage(),
                'user_id' => $request->user()->id
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error al actualizar el perfil'
            ], 500);
        }
    }

    // Obtener estadísticas del usuario actual
    public function getCurrentUserStats(Request $request)
    {
        try {
            $user = $request->user();
            
            // Reutilizar la lógica existente del método getUserStats
            $usuario = Usuario::with(['mods.valoraciones', 'mods.versiones'])->findOrFail($user->id);
            
            // Calcular estadísticas de mods
            $totalMods = $usuario->mods->count();
            $modsPublicados = $usuario->mods->where('estado', 'publicado')->count();
            $modsBorradores = $usuario->mods->where('estado', 'borrador')->count();
            
            // Calcular descargas totales
            $totalDescargas = 0;
            foreach ($usuario->mods as $mod) {
                foreach ($mod->versiones as $version) {
                    $totalDescargas += $version->descargas;
                }
            }
            
            // Calcular valoración promedio
            $totalValoraciones = 0;
            $sumaValoraciones = 0;
            foreach ($usuario->mods as $mod) {
                foreach ($mod->valoraciones as $valoracion) {
                    $totalValoraciones++;
                    $sumaValoraciones += $valoracion->puntuacion;
                }
            }
            $valoracionPromedio = $totalValoraciones > 0 ? round($sumaValoraciones / $totalValoraciones, 2) : 0;
            
            // Calcular mods guardados por otros usuarios
            $totalGuardados = 0;
            foreach ($usuario->mods as $mod) {
                $totalGuardados += $mod->usuariosGuardados()->count();
            }

            return response()->json([
                'status' => 'success',
                'data' => [
                    'modsCreated' => $totalMods,
                    'modsInstalled' => 0, // Placeholder - implementar si es necesario
                    'favorites' => $totalGuardados,
                    'rating' => $valoracionPromedio,
                    'total_descargas' => $totalDescargas,
                    'mods_publicados' => $modsPublicados,
                    'mods_borradores' => $modsBorradores,
                    'total_valoraciones' => $totalValoraciones
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener estadísticas del usuario actual', [
                'error' => $e->getMessage(),
                'user_id' => $request->user()->id
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener estadísticas'
            ], 500);
        }
    }
} 