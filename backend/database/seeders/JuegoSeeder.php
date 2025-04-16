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
                'slug' => 'grand-theft-auto-v',
                'titulo' => 'Grand Theft Auto V',
                'titulo_original' => 'Grand Theft Auto V',
                'descripcion' => 'Grand Theft Auto V es un videojuego de acción-aventura de mundo abierto desarrollado por Rockstar North y distribuido por Rockstar Games.',
                'metacritic' => 97,
                'fecha_lanzamiento' => '2013-09-17',
                'tba' => false,
                'actualizado' => now(),
                'imagen_fondo' => 'https://media.rawg.io/media/games/456/456dea5e1c7e3cd07060c14e96612001.jpg',
                'imagen_fondo_adicional' => null,
                'sitio_web' => 'https://www.rockstargames.com/V/',
                'rating' => 4.47,
                'rating_top' => 5
            ],
            [
                'rawg_id' => 3328,
                'slug' => 'the-witcher-3-wild-hunt',
                'titulo' => 'The Witcher 3: Wild Hunt',
                'titulo_original' => 'The Witcher 3: Wild Hunt',
                'descripcion' => 'The Witcher 3: Wild Hunt es un videojuego de rol desarrollado por CD Projekt RED.',
                'metacritic' => 93,
                'fecha_lanzamiento' => '2015-05-19',
                'tba' => false,
                'actualizado' => now(),
                'imagen_fondo' => 'https://media.rawg.io/media/games/618/618c2031a07bbff6b4f97f9999b2b3d2.jpg',
                'imagen_fondo_adicional' => null,
                'sitio_web' => 'https://thewitcher.com/en/witcher3',
                'rating' => 4.66,
                'rating_top' => 5
            ],
            [
                'rawg_id' => 2800,
                'slug' => 'fallout-4',
                'titulo' => 'Fallout 4',
                'titulo_original' => 'Fallout 4',
                'descripcion' => 'Fallout 4 es un videojuego de rol de acción desarrollado por Bethesda Game Studios.',
                'metacritic' => 84,
                'fecha_lanzamiento' => '2015-11-10',
                'tba' => false,
                'actualizado' => now(),
                'imagen_fondo' => 'https://media.rawg.io/media/games/d82/d82990b9c67ba0d2d09d4e6eb8881a38.jpg',
                'imagen_fondo_adicional' => null,
                'sitio_web' => 'https://fallout.bethesda.net/',
                'rating' => 3.99,
                'rating_top' => 5
            ]
        ];

        foreach ($juegos as $juego) {
            Juego::create($juego);
        }
    }
} 