<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

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
} 