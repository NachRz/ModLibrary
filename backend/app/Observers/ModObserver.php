<?php

namespace App\Observers;

use App\Models\Mod;
use App\Models\Juego;
use App\Models\Etiqueta;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ModObserver
{
    /**
     * Variable estática para comunicar al controlador información sobre juegos eliminados
     */
    public static $juegoEliminadoInfo = null;

    /**
     * Variable estática para comunicar al controlador información sobre etiquetas eliminadas
     */
    public static $etiquetasEliminadasInfo = [];

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
            
            // Guardar referencia al juego antes de eliminar el mod
            $juego = $mod->juego;
            
            // Guardar referencias a las etiquetas antes de eliminar el mod
            $etiquetas = $mod->etiquetas()->get();
            
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
            // Guardar etiquetas en el modelo para verificarlas después
            $mod->etiquetas_a_verificar = $etiquetas;
            
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

    /**
     * Handle the Mod "deleted" event.
     * 
     * Verifica si el juego y etiquetas asociadas deben ser eliminados después de eliminar el mod.
     */
    public function deleted(Mod $mod): void
    {
        try {
            // Limpiar información previa
            self::$juegoEliminadoInfo = null;
            self::$etiquetasEliminadasInfo = [];
            
            // Verificar etiquetas huérfanas
            $etiquetasParaVerificar = collect();
            
            // Si tenemos etiquetas guardadas del evento deleting, las usamos
            if (isset($mod->etiquetas_a_verificar)) {
                $etiquetasParaVerificar = $mod->etiquetas_a_verificar;
            } else {
                // Fallback: intentar obtener etiquetas que podrían estar huérfanas
                // Nota: esto puede no funcionar si las relaciones ya se eliminaron
                Log::warning("No se pudieron obtener etiquetas del mod {$mod->id} en deleting event");
            }
            
            // Verificar cada etiqueta para eliminarla si no tiene mods
            foreach ($etiquetasParaVerificar as $etiqueta) {
                try {
                    // Buscar la etiqueta para verificar si debe ser eliminada
                    $etiquetaActual = Etiqueta::find($etiqueta->id);
                    
                    if ($etiquetaActual) {
                        $resultado = $etiquetaActual->verificarYEliminarSiSinMods();
                        
                        if ($resultado['etiqueta_eliminada']) {
                            self::$etiquetasEliminadasInfo[] = $resultado['etiqueta_info'];
                            
                            Log::info("Etiqueta '{$resultado['etiqueta_info']['nombre']}' (ID: {$resultado['etiqueta_info']['id']}) eliminada automáticamente por no tener mods asociados");
                        }
                    }
                } catch (\Exception $e) {
                    Log::error("Error al verificar etiqueta {$etiqueta->id}: " . $e->getMessage());
                }
            }
            
            // Verificar si el mod tenía un juego asociado
            if ($mod->juego_id) {
                // Buscar el juego para verificar si debe ser eliminado
                $juego = Juego::find($mod->juego_id);
                
                if ($juego) {
                    $tituloJuego = $juego->titulo;
                    $idJuego = $juego->id;
                    
                    $resultado = $juego->verificarYEliminarSiSinMods();
                    
                    if ($resultado['juego_eliminado']) {
                        self::$juegoEliminadoInfo = [
                            'titulo' => $tituloJuego,
                            'id' => $idJuego,
                            'generos_eliminados' => $resultado['generos_eliminados']
                        ];
                        
                        $mensaje = "Juego '{$tituloJuego}' (ID: {$idJuego}) eliminado automáticamente por no tener mods asociados";
                        
                        if (!empty($resultado['generos_eliminados'])) {
                            $nombresGeneros = array_column($resultado['generos_eliminados'], 'nombre');
                            $mensaje .= ". También se eliminaron los géneros: " . implode(', ', $nombresGeneros);
                        }
                        
                        Log::info($mensaje);
                    }
                }
            }
            
        } catch (\Exception $e) {
            Log::error("Error al verificar eliminación después de eliminar mod {$mod->id}: " . $e->getMessage(), [
                'mod_id' => $mod->id,
                'mod_titulo' => $mod->titulo,
                'juego_id' => $mod->juego_id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Obtiene información sobre el último juego eliminado automáticamente
     */
    public static function getJuegoEliminadoInfo(): ?array
    {
        return self::$juegoEliminadoInfo;
    }

    /**
     * Limpia la información del juego eliminado
     */
    public static function clearJuegoEliminadoInfo(): void
    {
        self::$juegoEliminadoInfo = null;
    }

    /**
     * Obtiene información sobre las etiquetas eliminadas automáticamente
     */
    public static function getEtiquetasEliminadasInfo(): array
    {
        return self::$etiquetasEliminadasInfo;
    }

    /**
     * Limpia la información de las etiquetas eliminadas
     */
    public static function clearEtiquetasEliminadasInfo(): void
    {
        self::$etiquetasEliminadasInfo = [];
    }

    /**
     * Limpia toda la información de eliminaciones automáticas
     */
    public static function clearAllEliminacionInfo(): void
    {
        self::$juegoEliminadoInfo = null;
        self::$etiquetasEliminadasInfo = [];
    }
} 