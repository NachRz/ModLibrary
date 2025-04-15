<?php

namespace Database\Seeders;

use App\Models\Juego;
use Illuminate\Database\Seeder;

class JuegoSeeder extends Seeder
{
    public function run()
    {
        $juegos = [
            [
                'rawg_id' => 3498,
                'titulo' => 'Grand Theft Auto V',
                'imagen' => 'https://media.rawg.io/media/games/456/456dea5e1c7e3cd07060c14e96612001.jpg'
            ],
            [
                'rawg_id' => 3328,
                'titulo' => 'The Witcher 3: Wild Hunt',
                'imagen' => 'https://media.rawg.io/media/games/618/618c2031a07bbff6b4f97f9999b2b3d2.jpg'
            ],
            [
                'rawg_id' => 2800,
                'titulo' => 'Fallout 4',
                'imagen' => 'https://media.rawg.io/media/games/d82/d82990b9c67ba0d2d09d4e6eb8881a38.jpg'
            ]
        ];

        foreach ($juegos as $juego) {
            Juego::create($juego);
        }
    }
} 