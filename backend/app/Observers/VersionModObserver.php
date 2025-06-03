<?php

namespace App\Observers;

use App\Models\VersionMod;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class VersionModObserver
{
    /**
     * Handle the VersionMod "deleting" event.
     * 
     * Elimina automáticamente el archivo asociado a la versión del mod.
     */
    public function deleting(VersionMod $versionMod): void
    {
        try {
            Log::info("Iniciando eliminación de archivo para versión {$versionMod->id}");
            
            // Eliminar el archivo asociado si existe
            if ($versionMod->archivo && Storage::exists('public/' . $versionMod->archivo)) {
                Storage::delete('public/' . $versionMod->archivo);
                Log::info("Archivo de versión eliminado: {$versionMod->archivo}");
            } elseif ($versionMod->archivo) {
                Log::warning("Archivo de versión no encontrado: {$versionMod->archivo}");
            }
            
            Log::info("Eliminación completada para versión {$versionMod->id} del mod {$versionMod->mod_id}");
            
        } catch (\Exception $e) {
            Log::error("Error al eliminar archivo de versión {$versionMod->id}: " . $e->getMessage(), [
                'version_id' => $versionMod->id,
                'mod_id' => $versionMod->mod_id,
                'archivo' => $versionMod->archivo,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
} 