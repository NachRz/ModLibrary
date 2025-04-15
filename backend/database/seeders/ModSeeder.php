<?php

namespace Database\Seeders;

use App\Models\Mod;
use App\Models\VersionMod;
use Illuminate\Database\Seeder;

class ModSeeder extends Seeder
{
    public function run()
    {
        $mods = [
            [
                'titulo' => 'Realistic Graphics Mod',
                'imagen' => 'https://example.com/mod1.jpg',
                'edad_recomendada' => 18,
                'juego_id' => 1,
                'version_juego_necesaria' => '1.0',
                'version_actual' => '1.2',
                'url' => 'https://example.com/mod1',
                'creador_id' => 1,
                'descripcion' => 'Mejora los gráficos del juego para una experiencia más realista.'
            ],
            [
                'titulo' => 'New Weapons Pack',
                'imagen' => 'https://example.com/mod2.jpg',
                'edad_recomendada' => 16,
                'juego_id' => 2,
                'version_juego_necesaria' => '1.0',
                'version_actual' => '1.1',
                'url' => 'https://example.com/mod2',
                'creador_id' => 2,
                'descripcion' => 'Añade nuevas armas al juego con efectos especiales.'
            ]
        ];

        foreach ($mods as $mod) {
            $modCreado = Mod::create($mod);
            
            VersionMod::create([
                'mod_id' => $modCreado->id,
                'version' => $mod['version_actual'],
                'fecha_lanzamiento' => now()
            ]);
        }
    }
} 