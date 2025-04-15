<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Game extends Model
{
    use HasFactory;

    protected $fillable = [
        'rawg_id',
        'title',
        'description',
        'release_date',
        'rating',
        'background_image',
        'website',
        'metacritic'
    ];

    protected $casts = [
        'release_date' => 'date',
        'rating' => 'float',
        'metacritic' => 'integer'
    ];

    public function genres(): BelongsToMany
    {
        return $this->belongsToMany(Genre::class);
    }

    public function platforms(): BelongsToMany
    {
        return $this->belongsToMany(Platform::class);
    }

    public function developers(): BelongsToMany
    {
        return $this->belongsToMany(Developer::class);
    }

    public function publishers(): BelongsToMany
    {
        return $this->belongsToMany(Publisher::class);
    }
} 