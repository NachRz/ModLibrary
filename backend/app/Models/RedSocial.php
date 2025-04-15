<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RedSocial extends Model
{
    use HasFactory;

    protected $table = 'redes_sociales';

    protected $fillable = [
        'usuario_id',
        'nombre_red',
        'url'
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
} 