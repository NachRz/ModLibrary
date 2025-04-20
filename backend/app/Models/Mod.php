<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Mod extends Model
{
    use HasFactory;

    protected $table = 'mods';

    protected $fillable = [
        'titulo',
        'imagen',
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
        'val_media'
    ];

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