<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\JuegoController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ModController;
use App\Http\Controllers\VersionModController;
use App\Http\Controllers\EtiquetaController;
use App\Http\Controllers\GeneroController;
use App\Http\Controllers\ComentarioController;
use App\Http\Controllers\AdminController;

// Ruta de prueba
Route::get('/test', function () {
    return response()->json(['message' => 'API funcionando correctamente']); //prueba de funcionamiento de la API
});

// Rutas de autenticación sin prefijo
Route::post('/login', [AuthController::class, 'login']); //login de usuario
Route::post('/register', [AuthController::class, 'register']); //registro de usuario
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum'); //logout de usuario
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('auth:sanctum'); //restablecer contraseña de usuario

// Rutas de perfil de usuario
Route::middleware('auth:sanctum')->prefix('user')->group(function () {
    Route::get('/profile', [AuthController::class, 'getCurrentProfile']); //obtener perfil de usuario
    Route::put('/profile', [AuthController::class, 'updateProfile']); //actualizar perfil de usuario
    Route::post('/profile/image', [AuthController::class, 'uploadProfileImage']); //subir imagen de perfil de usuario
    Route::get('/stats', [AuthController::class, 'getCurrentUserStats']); //obtener estadísticas de usuario
});

// Ruta para verificar si el usuario es admin
Route::middleware('auth:sanctum')->get('/user/is-admin', [AuthController::class, 'isAdmin']); //verificar si el usuario es admin

// Ruta para subir imágenes de perfil (disponible para usuarios autenticados) - DEPRECADA, usar /user/profile/image
Route::middleware('auth:sanctum')->post('/upload/profile-image', [AuthController::class, 'uploadProfileImage']); //subir imagen de perfil de usuario

// Ruta para subir imagen banner de mods (disponible para usuarios autenticados)
Route::middleware('auth:sanctum')->post('/upload/mod-banner', [AuthController::class, 'uploadModBanner']); //subir imagen banner de mod

// Rutas para subir y eliminar imágenes adicionales de mods (disponible para usuarios autenticados)
Route::middleware('auth:sanctum')->post('/upload/mod-additional-images', [AuthController::class, 'uploadModAdditionalImages']); //subir imágenes adicionales de mod
Route::middleware('auth:sanctum')->delete('/upload/mod-additional-image', [AuthController::class, 'deleteModAdditionalImage']); //eliminar imagen adicional de mod

// Rutas de administración (requieren middleware admin)
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // Gestión de usuarios
    Route::get('/users', [AuthController::class, 'getAllUsers']); //obtener todos los usuarios
    Route::post('/users', [AuthController::class, 'createUser']); //crear un nuevo usuario
    Route::get('/users/deleted', [AuthController::class, 'getDeletedUsers']); //obtener usuarios eliminados
    Route::get('/users/{id}', [AuthController::class, 'getUserDetails']); //obtener detalles de un usuario
    Route::get('/users/{id}/stats', [AuthController::class, 'getUserStats']); //obtener estadísticas de un usuario
    Route::put('/users/{id}/role', [AuthController::class, 'updateUserRole']); //actualizar rol de un usuario
    Route::put('/users/{id}/status', [AuthController::class, 'updateUserStatus']); //actualizar estado de un usuario
    Route::delete('/users/{id}', [AuthController::class, 'deleteUser']); //eliminar un usuario
    Route::delete('/users/{id}/soft', [AuthController::class, 'softDeleteUser']); //eliminar un usuario de forma suave
    Route::delete('/users/{id}/force', [AuthController::class, 'forceDeleteUser']); //eliminar un usuario de forma forzada
    Route::post('/users/{id}/restore', [AuthController::class, 'restoreUser']); //restaurar un usuario eliminado
    Route::delete('/users/{id}/permanent', [AuthController::class, 'permanentDeleteUser']); //eliminar un usuario de forma permanente
    Route::delete('/users/{id}/permanent-with-mods', [AuthController::class, 'permanentDeleteUserWithMods']); //eliminar un usuario de forma permanente con mods

    // Gestión de mods (solo administradores)
    Route::get('/mods/deleted', [ModController::class, 'getDeletedMods']); //obtener mods eliminados
    Route::delete('/mods/{id}/soft', [ModController::class, 'softDelete']); //eliminar un mod de forma suave
    Route::post('/mods/{id}/restore', [ModController::class, 'restore']); //restaurar un mod eliminado
    Route::delete('/mods/{id}/force', [ModController::class, 'forceDelete']); //eliminar un mod de forma forzada

    // Gestión de comentarios (solo administradores)
    Route::get('/comentarios', [AdminController::class, 'getComentarios']); //obtener todos los comentarios
    Route::get('/comentarios/stats', [AdminController::class, 'getComentariosStats']); //obtener estadísticas de comentarios
    Route::get('/comentarios/{id}', [AdminController::class, 'getComentario']); //obtener un comentario específico
    Route::put('/comentarios/{id}', [AdminController::class, 'updateComentario']); //actualizar un comentario
    Route::delete('/comentarios/{id}', [AdminController::class, 'deleteComentario']); //eliminar un comentario
});

// Rutas de usuarios
Route::prefix('usuarios')->group(function () {
    // Ruta pública para buscar usuarios
    Route::get('/buscar', [AuthController::class, 'searchUsers']); //buscar usuarios
});

// Rutas de juegos
Route::prefix('juegos')->group(function () {
    // Rutas de favoritos (requieren autenticación) - DEBEN IR ANTES de las rutas con parámetros
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/favoritos', [JuegoController::class, 'obtenerFavoritos']); //obtener favoritos de un usuario
    });

    // Rutas públicas
    Route::get('/', [JuegoController::class, 'index']); //obtener todos los juegos
    Route::get('/buscar', [JuegoController::class, 'search']); //buscar juegos

    // Rutas específicas de juegos con ID - DEBEN IR AL FINAL
    Route::get('/{id}', [JuegoController::class, 'show']); //obtener un juego específico
    Route::post('/{id}/sincronizar', [JuegoController::class, 'syncGame']); //sincronizar un juego
    Route::post('/{id}/verify-sync', [JuegoController::class, 'verifyAndSync']); //verificar y sincronizar un juego

    // Rutas de favoritos por juego específico (requieren autenticación)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/{id}/favorito', [JuegoController::class, 'esFavorito']); //verificar si un juego es favorito
        Route::post('/{id}/favorito', [JuegoController::class, 'agregarFavorito']); //agregar un juego a favoritos
        Route::delete('/{id}/favorito', [JuegoController::class, 'quitarFavorito']); //quitar un juego de favoritos
    });
});

// Rutas de mods
Route::prefix('mods')->group(function () {
    // Obtener todos los mods con información de creador
    Route::get('/', [ModController::class, 'index']); //obtener todos los mods

    // Buscar mods por nombre
    Route::get('/buscar', [ModController::class, 'search']); //buscar mods

    // Obtener mods con detalles completos del creador y estadísticas
    Route::get('/con-detalles', [ModController::class, 'getModsWithCreatorDetails']); //obtener mods con detalles completos del creador y estadísticas

    // Rutas de mods guardados
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/guardados', [ModController::class, 'getModsGuardados']); //obtener mods guardados      
        Route::get('/{id}/guardado', [ModController::class, 'verificarModGuardado']); //verificar si un mod está guardado
        Route::post('/{id}/guardar', [ModController::class, 'guardarMod']); //guardar un mod
        Route::delete('/{id}/guardar', [ModController::class, 'eliminarModGuardado']); //eliminar un mod guardado

        // Rutas para valoraciones (requieren autenticación)
        Route::get('/{id}/valoracion', [ModController::class, 'getUserValoracion']); //obtener valoración de un mod
        Route::post('/{id}/valoracion', [ModController::class, 'valorarMod']); //valorar un mod
        Route::delete('/{id}/valoracion', [ModController::class, 'eliminarValoracion']); //eliminar valoración de un mod

        // Rutas para información de descargas del usuario (requieren autenticación)
        Route::get('/{id}/descarga-usuario', [ModController::class, 'getDescargaUsuario']); //obtener descarga de un mod

        // Incrementar contador de descargas (requiere autenticación para guardar en base de datos)
        Route::post('/{id}/incrementar-descarga', [ModController::class, 'incrementarDescarga']); //incrementar contador de descargas
    });

    // Estas rutas deben ir después de las anteriores
    Route::get('/creador/{creadorId}', [ModController::class, 'getModsByCreador']); //obtener mods por creador
    Route::get('/creador/nombre/{username}', [ModController::class, 'getModsByCreatorName']); //obtener mods por nombre de creador
    Route::get('/juego/{juegoId}', [ModController::class, 'getModsByGame']); //obtener mods por juego
    Route::get('/{id}', [ModController::class, 'show']); //obtener un mod específico

    // Rutas para las versiones de mods
    Route::prefix('/{modId}/versiones')->group(function () {
        // Obtener todas las versiones de un mod
        Route::get('/', [VersionModController::class, 'index']); //obtener todas las versiones de un mod

        // Obtener una versión específica
        Route::get('/{versionId}', [VersionModController::class, 'show']); //obtener una versión específica

        // Incrementar contador de descargas (no requiere autenticación)
        Route::post('/{versionId}/descargar', [VersionModController::class, 'incrementarDescargas']);  //incrementar contador de descargas

        // Rutas que requieren autenticación
        Route::middleware('auth:sanctum')->group(function () {
            // Crear una nueva versión
            Route::post('/', [VersionModController::class, 'store']); //crear una nueva versión

            // Actualizar una versión
            Route::put('/{versionId}', [VersionModController::class, 'update']); //actualizar una versión

            // Eliminar una versión
            Route::delete('/{versionId}', [VersionModController::class, 'destroy']); //eliminar una versión
        });
    });

    // Rutas para comentarios de mods
    Route::prefix('/{modId}/comentarios')->group(function () {
        // Obtener comentarios de un mod (público)
        Route::get('/', [ComentarioController::class, 'index']); //obtener comentarios de un mod

        // Obtener estadísticas de comentarios (público)
        Route::get('/stats', [ComentarioController::class, 'stats']); //obtener estadísticas de comentarios

        // Rutas que requieren autenticación
        Route::middleware('auth:sanctum')->group(function () {
            // Crear un comentario
            Route::post('/', [ComentarioController::class, 'store']); //crear un comentario

            // Actualizar un comentario
            Route::put('/{comentarioId}', [ComentarioController::class, 'update']); //actualizar un comentario

            // Eliminar un comentario
            Route::delete('/{comentarioId}', [ComentarioController::class, 'destroy']); //eliminar un comentario
        });
    });

    // Rutas que requieren autenticación
    Route::middleware('auth:sanctum')->group(function () {
        // Crear un nuevo mod
        Route::post('/', [ModController::class, 'store']); //crear un nuevo mod

        // Actualizar un mod existente
        Route::put('/{id}', [ModController::class, 'update']); //actualizar un mod existente

        // Eliminar un mod
        Route::delete('/{id}', [ModController::class, 'destroy']); //eliminar un mod

        // Cambiar el estado de un mod (borrador/publicado)
        Route::patch('/{id}/estado', [ModController::class, 'cambiarEstado']); //cambiar el estado de un mod

        // Obtener mods eliminados del usuario autenticado
        Route::get('/mis-mods/eliminados', [ModController::class, 'getMyDeletedMods']); //obtener mods eliminados del usuario autenticado

        // Rutas de soft delete y restore para usuarios normales (sus propios mods)
        Route::delete('/{id}/soft', [ModController::class, 'softDelete']); //eliminar un mod de forma suave
        Route::post('/{id}/restore', [ModController::class, 'restore']); //restaurar un mod eliminado
    });
});

// Rutas de etiquetas
Route::prefix('etiquetas')->group(function () {
    Route::get('/buscar-rawg', [EtiquetaController::class, 'buscarEnRawg']); //buscar etiquetas en RAWG
    Route::post('/{id}/sincronizar', [EtiquetaController::class, 'sincronizarConRawg']); //sincronizar etiquetas con RAWG
});

// Rutas de géneros
Route::prefix('generos')->group(function () {
    // Rutas públicas
    Route::get('/', [GeneroController::class, 'index']); //obtener todos los géneros
    Route::get('/estadisticas', [GeneroController::class, 'getEstadisticas']); //obtener estadísticas de géneros
    Route::get('/{generoId}/juegos', [GeneroController::class, 'getJuegosPorGenero']); //obtener juegos por género

    // Rutas de filtros
    Route::get('/filtros/juegos', [GeneroController::class, 'getJuegosConFiltrosGeneros']);

    // Rutas que requieren autenticación de administrador
    Route::middleware(['auth:sanctum', 'admin'])->group(function () {
        Route::post('/sincronizar-rawg', [GeneroController::class, 'sincronizarDesdeRawg']); //sincronizar géneros desde RAWG
        Route::post('/juego/{juegoId}/sincronizar', [GeneroController::class, 'sincronizarGenerosJuego']); //sincronizar géneros de un juego
    });
});
