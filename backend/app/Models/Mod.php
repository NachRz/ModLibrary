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

    protected $fillable = [
        'titulo',
        'imagen',
        'imagen_banner',
        'imagenes_adicionales',
        'edad_recomendada',
        'juego_id',
        'version_juego_necesaria',
        'version_actual',
        'url',
        'creador_id',
        'descripcion',
        'estado',
        'total_descargas',
        'num_valoraciones',
        'val_media',
        'es_destacado',
        'permitir_comentarios',
        'visible_en_busqueda'
    ];

    protected static function boot()
    {
        parent::boot();

        // Al crear un nuevo mod
        static::created(function ($mod) {
            if ($mod->juego) {
                $mod->juego->incrementarModsTotales();
            }
        });

        // Al eliminar un mod
        static::deleted(function ($mod) {
            if ($mod->juego) {
                $mod->juego->decrementarModsTotales();
            }
        });

        // Al actualizar un mod (por si cambia el juego)
        static::updated(function ($mod) {
            if ($mod->isDirty('juego_id')) {
                // Decrementar el contador del juego anterior
                if ($mod->getOriginal('juego_id')) {
                    Juego::find($mod->getOriginal('juego_id'))?->decrementarModsTotales();
                }
                // Incrementar el contador del nuevo juego
                if ($mod->juego_id) {
                    Juego::find($mod->juego_id)?->incrementarModsTotales();
                }
            }
        });
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
} 