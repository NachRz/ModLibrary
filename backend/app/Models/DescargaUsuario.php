<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DescargaUsuario extends Model
{
    use HasFactory;

    protected $table = 'descargas_usuarios';

    protected $fillable = [
        'usuario_id',
        'mod_id',
        'fecha_descarga'
    ];

    protected $casts = [
        'fecha_descarga' => 'datetime'
    ];

    /**
     * Relación con el usuario que descargó el mod
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    /**
     * Relación con el mod descargado
     */
    public function mod(): BelongsTo
    {
        return $this->belongsTo(Mod::class, 'mod_id');
    }
}
