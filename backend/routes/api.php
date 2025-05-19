<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\JuegoController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ModController;
use App\Http\Controllers\VersionModController;

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
    
    // Rutas de mods guardados
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/guardados', [ModController::class, 'getModsGuardados']);
        Route::get('/{id}/guardado', [ModController::class, 'verificarModGuardado']);
        Route::post('/{id}/guardar', [ModController::class, 'guardarMod']);
        Route::delete('/{id}/guardar', [ModController::class, 'eliminarModGuardado']);
        
        // Rutas para valoraciones (requieren autenticación)
        Route::get('/{id}/valoracion', [ModController::class, 'getUserValoracion']);
        Route::post('/{id}/valoracion', [ModController::class, 'valorarMod']);
        Route::delete('/{id}/valoracion', [ModController::class, 'eliminarValoracion']);
    });

    // Estas rutas deben ir después de las anteriores
    Route::get('/creador/{creadorId}', [ModController::class, 'getModsByCreador']);
    Route::get('/creador/nombre/{username}', [ModController::class, 'getModsByCreatorName']);
    Route::get('/{id}', [ModController::class, 'show']);
    
    // Rutas para las versiones de mods
    Route::prefix('/{modId}/versiones')->group(function () {
        // Obtener todas las versiones de un mod
        Route::get('/', [VersionModController::class, 'index']);
        
        // Obtener una versión específica
        Route::get('/{versionId}', [VersionModController::class, 'show']);
        
        // Incrementar contador de descargas (no requiere autenticación)
        Route::post('/{versionId}/descargar', [VersionModController::class, 'incrementarDescargas']);
        
        // Rutas que requieren autenticación
        Route::middleware('auth:sanctum')->group(function () {
            // Crear una nueva versión
            Route::post('/', [VersionModController::class, 'store']);
            
            // Actualizar una versión
            Route::put('/{versionId}', [VersionModController::class, 'update']);
            
            // Eliminar una versión
            Route::delete('/{versionId}', [VersionModController::class, 'destroy']);
        });
    });
    
    // Rutas que requieren autenticación
    Route::middleware('auth:sanctum')->group(function () {
        // Crear un nuevo mod
        Route::post('/', [ModController::class, 'store']);
        
        // Actualizar un mod existente
        Route::put('/{id}', [ModController::class, 'update']);
        
        // Eliminar un mod
        Route::delete('/{id}', [ModController::class, 'destroy']);
        
        // Cambiar el estado de un mod (borrador/publicado)
        Route::patch('/{id}/estado', [ModController::class, 'cambiarEstado']);
    });
});

