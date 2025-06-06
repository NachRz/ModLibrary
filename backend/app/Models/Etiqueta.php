<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Log;

class Etiqueta extends Model
{
    use HasFactory;

    protected $table = 'etiquetas';

    protected $fillable = [
        'nombre',
        'rawg_id'
    ];

    public function mods(): BelongsToMany
    {
        return $this->belongsToMany(Mod::class, 'mods_etiquetas', 'etiqueta_id', 'mod_id');
    }

    /**
     * Verifica si esta etiqueta tiene mods asociados y la elimina si no los tiene
     * 
     * @return array Array con información sobre si la etiqueta fue eliminada
     */
    public function verificarYEliminarSiSinMods(): array
    {
        try {
            // Contar mods asociados a esta etiqueta
            $countMods = $this->mods()->count();

            if ($countMods === 0) {
                Log::info("Etiqueta '{$this->nombre}' (ID: {$this->id}) será eliminada por no tener mods asociados");

                // Guardar información antes de eliminar
                $infoEtiqueta = [
                    'id' => $this->id,
                    'nombre' => $this->nombre,
                    'rawg_id' => $this->rawg_id
                ];

                // Eliminar la etiqueta
                $this->delete();

                Log::info("Etiqueta '{$infoEtiqueta['nombre']}' eliminada exitosamente");

                return [
                    'etiqueta_eliminada' => true,
                    'etiqueta_info' => $infoEtiqueta
                ];
            }

            return [
                'etiqueta_eliminada' => false,
                'etiqueta_info' => null
            ];
        } catch (\Exception $e) {
            Log::error("Error al verificar/eliminar etiqueta {$this->id}: " . $e->getMessage(), [
                'etiqueta_id' => $this->id,
                'etiqueta_nombre' => $this->nombre,
                'error' => $e->getMessage()
            ]);

            return [
                'etiqueta_eliminada' => false,
                'etiqueta_info' => null,
                'error' => $e->getMessage()
            ];
        }
    }
}
