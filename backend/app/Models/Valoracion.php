<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Valoracion extends Model
{
    use HasFactory;

    protected $table = 'valoraciones';

    protected $fillable = [
        'usuario_id',
        'mod_id',
        'puntuacion',
        'fecha'
    ];

    /**
     * El "booted" method del modelo.
     *
     * @return void
     */
    protected static function booted()
    {
        // Cuando se crea o actualiza una valoración, actualizamos los contadores en el mod
        static::saved(function ($valoracion) {
            $valoracion->mod->actualizarValMedia();
        });

        // Cuando se elimina una valoración, actualizamos los contadores en el mod
        static::deleted(function ($valoracion) {
            $valoracion->mod->actualizarValMedia();
        });
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function mod(): BelongsTo
    {
        return $this->belongsTo(Mod::class, 'mod_id');
    }
}
