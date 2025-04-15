<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Usuario extends Model
{
    use HasFactory;

    protected $table = 'usuarios';

    protected $fillable = [
        'nome',
        'contrasina',
        'rol',
        'nombre',
        'apelidos',
        'foto_perfil',
        'correo'
    ];

    protected $hidden = [
        'contrasina'
    ];

    public function redesSociales(): HasMany
    {
        return $this->hasMany(RedSocial::class, 'usuario_id');
    }

    public function mods(): HasMany
    {
        return $this->hasMany(Mod::class, 'creador_id');
    }

    public function comentarios(): HasMany
    {
        return $this->hasMany(Comentario::class, 'usuario_id');
    }

    public function valoraciones(): HasMany
    {
        return $this->hasMany(Valoracion::class, 'usuario_id');
    }

    public function modsGuardados(): HasMany
    {
        return $this->hasMany(ModGuardado::class, 'usuario_id');
    }
} 