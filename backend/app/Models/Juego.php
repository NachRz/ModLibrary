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
        $this->mods_totales = $this->mods()
            ->where('estado', 'publicado')
            ->whereNull('deleted_at')
            ->count();
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

    /**
     * Verifica si el juego debe ser eliminado cuando no tiene mods asociados
     * Solo elimina si no tiene favoritos y no tiene mods
     * También verifica y elimina géneros huérfanos después de eliminar el juego
     */
    public function verificarYEliminarSiSinMods(): array
    {
        // Recalcular primero para asegurar exactitud
        $this->recalcularModsTotales();
        
        // Si tiene mods, no eliminar
        if ($this->mods_totales > 0) {
            return ['juego_eliminado' => false, 'generos_eliminados' => []];
        }
        
        // Verificar si tiene mods en cualquier estado (incluyendo borradores)
        $totalModsEnTodosEstados = $this->mods()->withTrashed()->count();
        if ($totalModsEnTodosEstados > 0) {
            return ['juego_eliminado' => false, 'generos_eliminados' => []];
        }
        
        // Verificar si hay usuarios que lo tienen en favoritos
        $totalFavoritos = $this->usuariosFavoritos()->count();
        if ($totalFavoritos > 0) {
            return ['juego_eliminado' => false, 'generos_eliminados' => []];
        }
        
        // Obtener los IDs de los géneros asociados antes de eliminar el juego
        $generoIds = $this->generos()->pluck('generos.id')->toArray();
        
        // Si no tiene mods ni favoritos, se puede eliminar
        try {
            $this->delete();
            
            // Después de eliminar el juego, verificar y eliminar géneros huérfanos
            $generosEliminados = [];
            if (!empty($generoIds)) {
                $generosEliminados = \App\Models\Genero::verificarYEliminarGenerosSinJuegos($generoIds);
            }
            
            return [
                'juego_eliminado' => true, 
                'generos_eliminados' => $generosEliminados
            ];
        } catch (\Exception $e) {
            // Si hay error al eliminar, log y retornar false
            \Illuminate\Support\Facades\Log::error("Error al eliminar juego sin mods: " . $e->getMessage(), [
                'juego_id' => $this->id,
                'juego_titulo' => $this->titulo
            ]);
            return ['juego_eliminado' => false, 'generos_eliminados' => []];
        }
    }
} 