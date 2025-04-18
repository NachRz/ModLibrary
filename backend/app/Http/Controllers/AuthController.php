<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

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
        try {
            $request->user()->currentAccessToken()->delete();
            return response()->json([
                'message' => 'Sesión cerrada exitosamente'
            ]);
        } catch (\Exception $e) {
            Log::error('Error en logout', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
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
} 