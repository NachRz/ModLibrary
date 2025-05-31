<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

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
        'rating_top',
        'mods_totales'
    ];

    protected $casts = [
        'fecha_lanzamiento' => 'date',
        'tba' => 'boolean',
        'actualizado' => 'datetime',
        'rating' => 'decimal:2',
        'mods_totales' => 'integer'
    ];

    public function mods(): HasMany
    {
        return $this->hasMany(Mod::class, 'juego_id');
    }

    public function usuariosFavoritos(): BelongsToMany
    {
        return $this->belongsToMany(Usuario::class, 'juegos_favoritos', 'juego_id', 'usuario_id')
            ->withTimestamps()
            ->withPivot('fecha_agregado');
    }

    /**
     * Relación muchos a muchos con géneros
     */
    public function generos(): BelongsToMany
    {
        return $this->belongsToMany(Genero::class, 'juegos_generos', 'juego_id', 'genero_id')
                    ->withTimestamps();
    }

    /**
     * Incrementa el contador de mods
     */
    public function incrementarModsTotales(): void
    {
        $this->increment('mods_totales');
    }

    /**
     * Decrementa el contador de mods
     */
    public function decrementarModsTotales(): void
    {
        $this->decrement('mods_totales');
    }

    /**
     * Recalcula y actualiza el total de mods
     */
    public function recalcularModsTotales(): void
    {
        $this->mods_totales = $this->mods()->count();
        $this->save();
    }

    /**
     * Recalcula los mods totales para todos los juegos
     */
    public static function recalcularTodosModsTotales(): void
    {
        $juegos = self::all();
        foreach ($juegos as $juego) {
            $juego->recalcularModsTotales();
        }
    }
} 