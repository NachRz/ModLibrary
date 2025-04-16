<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\JuegoController;
use App\Http\Controllers\AuthController;

// Ruta de prueba
Route::get('/test', function() {
    return response()->json(['message' => 'API funcionando correctamente']);
});

// Rutas de autenticación sin prefijo
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Rutas de juegos
Route::prefix('juegos')->group(function () {
    Route::get('/buscar', [JuegoController::class, 'search']);
    Route::get('/{id}', [JuegoController::class, 'show']);
    Route::post('/{id}/sincronizar', [JuegoController::class, 'syncGame']);
});

// ... existing code ... 