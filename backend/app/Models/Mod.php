<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Mod extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'mods';

    /**
     * Variable estática para comunicar información sobre juegos eliminados al actualizar
     */
    public static $juegoEliminadoEnActualizacion = null;

    protected $fillable = [
        'titulo',
        'imagen',
        'imagen_banner',
        'imagenes_adicionales',
        'edad_recomendada',
        'juego_id',
        'version_actual',
        'url',
        'creador_id',
        'descripcion',
        'total_descargas',
        'num_valoraciones',
        'val_media',
        'estado',
        'es_destacado',
        'permitir_comentarios',
        'visible_en_busqueda'
    ];

    protected static function boot()
    {
        parent::boot();

        // Al crear un nuevo mod
        static::created(function ($mod) {
            if ($mod->juego && $mod->estado === 'publicado') {
                $mod->juego->incrementarModsTotales();
            }
        });

        // Al eliminar un mod (soft delete)
        static::deleted(function ($mod) {
            if ($mod->juego && $mod->estado === 'publicado') {
                $mod->juego->decrementarModsTotales();
            }
        });

        // Al restaurar un mod desde soft delete
        static::restored(function ($mod) {
            if ($mod->juego && $mod->estado === 'publicado') {
                $mod->juego->incrementarModsTotales();
            }
        });

        // Al actualizar un mod
        static::updated(function ($mod) {
            $juegoAnteriorId = null;

            // Limpiar información previa
            self::$juegoEliminadoEnActualizacion = null;

            // Si cambió el juego
            if ($mod->isDirty('juego_id')) {
                $juegoAnteriorId = $mod->getOriginal('juego_id');

                // Decrementar el contador del juego anterior si el mod estaba publicado
                if ($juegoAnteriorId && $mod->getOriginal('estado') === 'publicado') {
                    $juegoAnterior = Juego::find($juegoAnteriorId);
                    if ($juegoAnterior) {
                        $juegoAnterior->decrementarModsTotales();
                    }
                }
                // Incrementar el contador del nuevo juego si el mod está publicado
                if ($mod->juego_id && $mod->estado === 'publicado') {
                    Juego::find($mod->juego_id)?->incrementarModsTotales();
                }
            }

            // Si cambió el estado
            if ($mod->isDirty('estado')) {
                $estadoAnterior = $mod->getOriginal('estado');
                $estadoActual = $mod->estado;

                // Si pasó de publicado a borrador
                if ($estadoAnterior === 'publicado' && $estadoActual === 'borrador') {
                    if ($mod->juego) {
                        $mod->juego->decrementarModsTotales();
                    }
                }
                // Si pasó de borrador a publicado
                elseif ($estadoAnterior === 'borrador' && $estadoActual === 'publicado') {
                    if ($mod->juego) {
                        $mod->juego->incrementarModsTotales();
                    }
                }
            }

            // Verificar si el juego anterior se quedó sin mods y debe ser eliminado
            if ($juegoAnteriorId && $juegoAnteriorId !== $mod->juego_id) {
                try {
                    $juegoAnterior = Juego::find($juegoAnteriorId);
                    if ($juegoAnterior) {
                        $tituloJuegoAnterior = $juegoAnterior->titulo;
                        $idJuegoAnterior = $juegoAnterior->id;

                        $resultado = $juegoAnterior->verificarYEliminarSiSinMods();
                        if ($resultado['juego_eliminado']) {
                            self::$juegoEliminadoEnActualizacion = [
                                'titulo' => $tituloJuegoAnterior,
                                'id' => $idJuegoAnterior,
                                'generos_eliminados' => $resultado['generos_eliminados']
                            ];

                            $mensaje = "Juego '{$tituloJuegoAnterior}' (ID: {$idJuegoAnterior}) eliminado automáticamente después de cambiar juego del mod {$mod->id}";

                            if (!empty($resultado['generos_eliminados'])) {
                                $nombresGeneros = array_column($resultado['generos_eliminados'], 'nombre');
                                $mensaje .= ". También se eliminaron los géneros: " . implode(', ', $nombresGeneros);
                            }

                            \Illuminate\Support\Facades\Log::info($mensaje);
                        }
                    }
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error("Error al verificar eliminación de juego anterior después de actualizar mod {$mod->id}: " . $e->getMessage(), [
                        'mod_id' => $mod->id,
                        'juego_anterior_id' => $juegoAnteriorId,
                        'error' => $e->getMessage()
                    ]);
                }
            }
        });
    }

    /**
     * Obtiene información sobre el último juego eliminado automáticamente en una actualización
     */
    public static function getJuegoEliminadoEnActualizacion(): ?array
    {
        return self::$juegoEliminadoEnActualizacion;
    }

    /**
     * Limpia la información del juego eliminado en actualización
     */
    public static function clearJuegoEliminadoEnActualizacion(): void
    {
        self::$juegoEliminadoEnActualizacion = null;
    }

    /**
     * Calcula y actualiza el número de valoraciones para este mod
     */
    public function actualizarNumValoraciones()
    {
        $this->num_valoraciones = $this->valoraciones()->count();
        $this->save();
    }

    /**
     * Calcula y actualiza la valoración media para este mod
     */
    public function actualizarValMedia()
    {
        $numValoraciones = $this->valoraciones()->count();

        if ($numValoraciones > 0) {
            $this->val_media = $this->valoraciones()->avg('puntuacion'); //Calcula el promedio de valoraciones usando la función avg
        } else {
            $this->val_media = 0;
        }

        $this->num_valoraciones = $numValoraciones;
        $this->save();
    }

    public function juego(): BelongsTo
    {
        return $this->belongsTo(Juego::class, 'juego_id');
    }

    public function creador(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'creador_id');
    }

    public function versiones(): HasMany
    {
        return $this->hasMany(VersionMod::class, 'mod_id');
    }

    public function etiquetas(): BelongsToMany
    {
        return $this->belongsToMany(Etiqueta::class, 'mods_etiquetas', 'mod_id', 'etiqueta_id');
    }

    public function comentarios(): HasMany
    {
        return $this->hasMany(Comentario::class, 'mod_id');
    }

    public function valoraciones(): HasMany
    {
        return $this->hasMany(Valoracion::class, 'mod_id');
    }

    public function usuariosGuardados(): BelongsToMany
    {
        return $this->belongsToMany(Usuario::class, 'mods_guardados', 'mod_id', 'usuario_id');
    }

    public function descargas(): HasMany
    {
        return $this->hasMany(DescargaUsuario::class, 'mod_id');
    }
}
