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

    /**
     * Verifica si el género debe ser eliminado cuando no tiene juegos asociados
     * Solo elimina si no tiene juegos asociados
     */
    public function verificarYEliminarSiSinJuegos(): bool
    {
        // Verificar si tiene juegos asociados
        $totalJuegos = $this->juegos()->count();
        if ($totalJuegos > 0) {
            return false;
        }

        // Si no tiene juegos, se puede eliminar
        try {
            $this->delete();
            return true;
        } catch (\Exception $e) {
            // Si hay error al eliminar, log y retornar false
            \Illuminate\Support\Facades\Log::error("Error al eliminar género sin juegos: " . $e->getMessage(), [
                'genero_id' => $this->id,
                'genero_nombre' => $this->nombre
            ]);
            return false;
        }
    }

    /**
     * Verifica y elimina múltiples géneros sin juegos asociados
     * 
     * @param array $generoIds Array de IDs de géneros a verificar
     * @return array Array con información de géneros eliminados
     */
    public static function verificarYEliminarGenerosSinJuegos(array $generoIds): array
    {
        $generosEliminados = [];

        foreach ($generoIds as $generoId) {
            $genero = self::find($generoId);
            if ($genero) {
                $nombreGenero = $genero->nombre;
                $idGenero = $genero->id;

                if ($genero->verificarYEliminarSiSinJuegos()) {
                    $generosEliminados[] = [
                        'id' => $idGenero,
                        'nombre' => $nombreGenero
                    ];

                    \Illuminate\Support\Facades\Log::info("Género '{$nombreGenero}' (ID: {$idGenero}) eliminado automáticamente por no tener juegos asociados");
                }
            }
        }

        return $generosEliminados;
    }
}
