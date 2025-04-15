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
        'descripcion'
    ];

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