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
        'fecha_lanzamiento'
    ];

    public function mod(): BelongsTo
    {
        return $this->belongsTo(Mod::class, 'mod_id');
    }
} 