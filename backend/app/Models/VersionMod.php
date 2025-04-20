<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VersionMod extends Model
{
    use HasFactory;

    protected $table = 'versiones_mods';

    protected $fillable = [
        'mod_id',
        'version',
        'notas',
        'archivo',
        'fecha_lanzamiento',
        'descargas'
    ];

    protected $casts = [
        'fecha_lanzamiento' => 'datetime',
        'descargas' => 'integer'
    ];

    public function mod(): BelongsTo
    {
        return $this->belongsTo(Mod::class, 'mod_id');
    }
} 