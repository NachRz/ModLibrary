<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use App\Models\Mod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

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
                    'rol' => $usuario->rol
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
                    'rol' => $usuario->rol
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
            $usuarios = Usuario::select('id', 'nome', 'correo', 'rol', 'nombre', 'apelidos', 'created_at')
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
                        'tiene_mods' => $usuario->mods_count > 0
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

            // Eliminar imagen de perfil si existe
            if ($usuario->foto_perfil && Storage::exists('public/' . $usuario->foto_perfil)) {
                Storage::delete('public/' . $usuario->foto_perfil);
            }

            // Eliminar el usuario PERMANENTEMENTE (los mods quedan huérfanos pero visibles)
            $usuario->forceDelete();

            return response()->json([
                'status' => 'success',
                'message' => 'Usuario eliminado correctamente (los mods se mantienen)'
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
                ->select('id', 'nome', 'correo', 'rol', 'nombre', 'apelidos', 'created_at', 'deleted_at')
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
                        'tiene_mods' => $usuario->mods_count > 0
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

            // Eliminar imagen de perfil si existe
            if ($usuario->foto_perfil && Storage::exists('public/' . $usuario->foto_perfil)) {
                Storage::delete('public/' . $usuario->foto_perfil);
            }

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

            // Eliminar todos los mods del usuario y sus relaciones
            $mods = $usuario->mods;
            
            foreach ($mods as $mod) {
                // Eliminar imagen banner del mod si existe
                if ($mod->imagen_banner && Storage::exists('public/' . $mod->imagen_banner)) {
                    Storage::delete('public/' . $mod->imagen_banner);
                }

                // Eliminar imágenes adicionales si existen
                if ($mod->imagenes_adicionales) {
                    $imagenesAdicionales = json_decode($mod->imagenes_adicionales, true);
                    if (is_array($imagenesAdicionales)) {
                        foreach ($imagenesAdicionales as $imagenPath) {
                            if (Storage::exists('public/' . $imagenPath)) {
                                Storage::delete('public/' . $imagenPath);
                            }
                        }
                    }
                }

                // Eliminar relaciones
                $mod->etiquetas()->detach();
                $mod->usuariosGuardados()->detach();
                
                // Eliminar valoraciones
                $mod->valoraciones()->delete();
                
                // Eliminar comentarios
                $mod->comentarios()->delete();
                
                // Eliminar versiones del mod y sus archivos
                foreach ($mod->versiones as $version) {
                    if ($version->archivo && Storage::exists('public/' . $version->archivo)) {
                        Storage::delete('public/' . $version->archivo);
                    }
                    $version->delete();
                }

                // Eliminar el mod
                $mod->delete();
            }

            // Eliminar relaciones del usuario
            $usuario->modsGuardados()->detach();
            $usuario->juegosFavoritos()->detach();
            $usuario->valoraciones()->delete();
            $usuario->comentarios()->delete();
            $usuario->redesSociales()->delete();

            // Eliminar imagen de perfil si existe
            if ($usuario->foto_perfil && Storage::exists('public/' . $usuario->foto_perfil)) {
                Storage::delete('public/' . $usuario->foto_perfil);
            }

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
                'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120' // 5MB máximo
            ]);

            $image = $request->file('image');
            
            // Generar nombre único para la imagen
            $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            
            // Crear directorio si no existe
            $uploadPath = public_path('uploads/profile-images');
            if (!file_exists($uploadPath)) {
                mkdir($uploadPath, 0755, true);
            }
            
            // Mover archivo
            $image->move($uploadPath, $imageName);
            
            // Generar URL completa
            $imageUrl = url('uploads/profile-images/' . $imageName);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Imagen subida correctamente',
                'data' => [
                    'url' => $imageUrl,
                    'filename' => $imageName
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error al subir imagen', [
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error al subir la imagen'
            ], 500);
        }
    }
} 