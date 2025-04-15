<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Juego extends Model
{
    use HasFactory;

    protected $table = 'juegos';

    protected $fillable = [
        'rawg_id',
        'titulo',
        'imagen'
    ];

    public function mods(): HasMany
    {
        return $this->hasMany(Mod::class, 'juego_id');
    }
} 