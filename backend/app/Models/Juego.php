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
        'slug',
        'titulo',
        'titulo_original',
        'descripcion',
        'metacritic',
        'fecha_lanzamiento',
        'tba',
        'actualizado',
        'imagen_fondo',
        'imagen_fondo_adicional',
        'sitio_web',
        'rating',
        'rating_top'
    ];

    protected $casts = [
        'fecha_lanzamiento' => 'date',
        'tba' => 'boolean',
        'actualizado' => 'datetime',
        'rating' => 'decimal:2'
    ];

    public function mods(): HasMany
    {
        return $this->hasMany(Mod::class, 'juego_id');
    }
} 