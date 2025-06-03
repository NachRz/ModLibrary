<?php

namespace App\Observers;

use App\Models\Usuario;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class UsuarioObserver
{
    /**
     * Handle the Usuario "created" event.
     * 
     * Crea automáticamente la carpeta del usuario y copia el avatar por defecto.
     */
    public function created(Usuario $usuario): void
    {
        try {
            // Crear la carpeta del usuario: storage/app/public/users/user_{id}/
            $userFolder = "users/user_{$usuario->id}";
            $userPath = storage_path("app/public/{$userFolder}");
            
            // Crear la carpeta si no existe
            if (!File::exists($userPath)) {
                File::makeDirectory($userPath, 0755, true);
                Log::info("Carpeta de usuario creada: {$userPath}");
            }
            
            // Ruta del avatar por defecto
            $defaultAvatarPath = storage_path('app/public/defaults/avatars/default_avatar.png');
            
            // Verificar que el avatar por defecto existe
            if (File::exists($defaultAvatarPath)) {
                // Nombre del archivo del avatar del usuario
                $avatarFileName = "user_{$usuario->id}_avatar.png";
                $avatarDestinationPath = "{$userPath}/{$avatarFileName}";
                
                // Copiar el avatar por defecto
                File::copy($defaultAvatarPath, $avatarDestinationPath);
                
                // Actualizar el campo foto_perfil en la base de datos
                $relativePath = "{$userFolder}/{$avatarFileName}";
                $usuario->update(['foto_perfil' => $relativePath]);
                
                Log::info("Avatar por defecto copiado para usuario {$usuario->id}: {$relativePath}");
            } else {
                Log::warning("Avatar por defecto no encontrado en: {$defaultAvatarPath}");
            }
            
        } catch (\Exception $e) {
            Log::error("Error al crear carpeta o avatar para usuario {$usuario->id}: " . $e->getMessage(), [
                'usuario_id' => $usuario->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Handle the Usuario "deleting" event.
     * 
     * Elimina toda la carpeta del usuario y su contenido.
     */
    public function deleting(Usuario $usuario): void
    {
        try {
            // Ruta de la carpeta del usuario
            $userFolder = "users/user_{$usuario->id}";
            $userPath = storage_path("app/public/{$userFolder}");
            
            // Eliminar toda la carpeta del usuario si existe
            if (File::exists($userPath)) {
                File::deleteDirectory($userPath);
                Log::info("Carpeta de usuario eliminada: {$userPath}");
            }
            
            // También eliminar usando Storage facade como respaldo
            if (Storage::exists("public/{$userFolder}")) {
                Storage::deleteDirectory("public/{$userFolder}");
                Log::info("Carpeta de usuario eliminada via Storage: {$userFolder}");
            }
            
        } catch (\Exception $e) {
            Log::error("Error al eliminar carpeta del usuario {$usuario->id}: " . $e->getMessage(), [
                'usuario_id' => $usuario->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
} 