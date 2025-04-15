<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Genre extends Model
{
    use HasFactory;

    protected $fillable = [
        'rawg_id',
        'name'
    ];

    public function games(): BelongsToMany
    {
        return $this->belongsToMany(Game::class);
    }
} 