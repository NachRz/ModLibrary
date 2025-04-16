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
} 