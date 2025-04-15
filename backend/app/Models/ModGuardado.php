<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ModGuardado extends Model
{
    use HasFactory;

    protected $table = 'mods_guardados';

    protected $fillable = [
        'usuario_id',
        'mod_id',
        'fecha_guardado'
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function mod(): BelongsTo
    {
        return $this->belongsTo(Mod::class, 'mod_id');
    }
} 