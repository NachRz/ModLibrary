<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Genero extends Model
{
    protected $table = 'generos';

    protected $fillable = [
        'rawg_id',
        'nombre',
        'slug',
        'descripcion',
        'imagen',
        'games_count'
    ];

    protected $casts = [
        'rawg_id' => 'integer',
        'games_count' => 'integer',
    ];

    /**
     * Relación muchos a muchos con juegos
     */
    public function juegos(): BelongsToMany
    {
        return $this->belongsToMany(Juego::class, 'juegos_generos', 'genero_id', 'juego_id')
                    ->withTimestamps();
    }
}
