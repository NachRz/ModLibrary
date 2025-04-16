<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasFactory, HasApiTokens;

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
        'contrasina',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
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