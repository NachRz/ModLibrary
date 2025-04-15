<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\JuegoController;

// ... existing code ...

Route::prefix('juegos')->group(function () {
    Route::get('/buscar', [JuegoController::class, 'search']);
    Route::get('/{id}', [JuegoController::class, 'show']);
    Route::post('/{id}/sincronizar', [JuegoController::class, 'syncGame']);
});

// ... existing code ... 