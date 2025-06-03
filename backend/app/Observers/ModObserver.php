<?php

namespace App\Observers;

use App\Models\Mod;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ModObserver
{
    /**
     * Handle the Mod "deleting" event.
     * 
     * Elimina automáticamente todos los archivos asociados al mod,
     * sus relaciones many-to-many, valoraciones, comentarios y versiones.
     */
    public function deleting(Mod $mod): void
    {
        try {
            Log::info("Iniciando eliminación de archivos para mod {$mod->id}");
            
            // 1. Eliminar imagen banner si existe
            if ($mod->imagen_banner && Storage::exists('public/' . $mod->imagen_banner)) {
                Storage::delete('public/' . $mod->imagen_banner);
                Log::info("Imagen banner eliminada: {$mod->imagen_banner}");
            }
            
            // 2. Eliminar imágenes adicionales si existen
            if ($mod->imagenes_adicionales) {
                $imagenesAdicionales = json_decode($mod->imagenes_adicionales, true);
                if (is_array($imagenesAdicionales)) {
                    foreach ($imagenesAdicionales as $imagenPath) {
                        if ($imagenPath && Storage::exists('public/' . $imagenPath)) {
                            Storage::delete('public/' . $imagenPath);
                            Log::info("Imagen adicional eliminada: {$imagenPath}");
                        }
                    }
                }
            }
            
            // 3. Eliminar relaciones many-to-many
            $mod->etiquetas()->detach();
            Log::info("Relaciones con etiquetas eliminadas para mod {$mod->id}");
            
            $mod->usuariosGuardados()->detach();
            Log::info("Relaciones usuariosGuardados eliminadas para mod {$mod->id}");
            
            // 4. Eliminar valoraciones relacionadas
            $valoracionesCount = $mod->valoraciones()->count();
            $mod->valoraciones()->delete();
            Log::info("{$valoracionesCount} valoraciones eliminadas para mod {$mod->id}");
            
            // 5. Eliminar comentarios relacionados
            $comentariosCount = $mod->comentarios()->count();
            $mod->comentarios()->delete();
            Log::info("{$comentariosCount} comentarios eliminados para mod {$mod->id}");
            
            // 6. Eliminar versiones del mod (esto activará VersionModObserver para cada versión)
            $versionesCount = $mod->versiones()->count();
            
            // Obtener las versiones antes de eliminarlas para poder eliminar sus archivos
            $versiones = $mod->versiones()->get();
            
            foreach ($versiones as $version) {
                // El VersionModObserver manejará la eliminación del archivo
                $version->delete();
            }
            
            Log::info("{$versionesCount} versiones eliminadas para mod {$mod->id}");
            
            Log::info("Eliminación de archivos completada para mod {$mod->id}");
            
        } catch (\Exception $e) {
            Log::error("Error al eliminar archivos del mod {$mod->id}: " . $e->getMessage(), [
                'mod_id' => $mod->id,
                'mod_titulo' => $mod->titulo,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
} 