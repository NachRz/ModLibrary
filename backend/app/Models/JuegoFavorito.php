<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JuegoFavorito extends Model
{
    use HasFactory;

    protected $table = 'juegos_favoritos';

    protected $fillable = [
        'usuario_id',
        'juego_id',
        'fecha_agregado'
    ];

    protected $casts = [
        'fecha_agregado' => 'datetime'
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function juego(): BelongsTo
    {
        return $this->belongsTo(Juego::class, 'juego_id');
    }
}
