<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\JuegoController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ModController;

// Ruta de prueba
Route::get('/test', function() {
    return response()->json(['message' => 'API funcionando correctamente']);
});

// Rutas de autenticación sin prefijo
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('auth:sanctum');

// Rutas de juegos
Route::prefix('juegos')->group(function () {
    Route::get('/buscar', [JuegoController::class, 'search']);
    Route::get('/{id}', [JuegoController::class, 'show']);
    Route::post('/{id}/sincronizar', [JuegoController::class, 'syncGame']);
});

// Rutas de mods
Route::prefix('mods')->group(function () {
    // Obtener todos los mods con información de creador
    Route::get('/', [ModController::class, 'index']);
    
    // Obtener mods con detalles completos del creador y estadísticas
    Route::get('/con-detalles', [ModController::class, 'getModsWithCreatorDetails']);
    
    // Obtener mods por creador (usando ID)
    Route::get('/creador/{creadorId}', [ModController::class, 'getModsByCreador']);
    
    // Obtener mods por nombre de usuario
    Route::get('/creador/nombre/{username}', [ModController::class, 'getModsByCreatorName']);
});

