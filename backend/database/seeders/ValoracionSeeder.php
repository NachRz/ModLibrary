<?php

namespace Database\Seeders;

use App\Models\Mod;
use App\Models\Usuario;
use App\Models\Valoracion;
use Illuminate\Database\Seeder;

class ValoracionSeeder extends Seeder
{
    public function run()
    {
        $mods = Mod::all();
        $usuarios = Usuario::all();

        foreach ($mods as $mod) {
            $numValoraciones = rand(5, 10);
            for ($i = 0; $i < $numValoraciones; $i++) {
                Valoracion::create([
                    'usuario_id' => $usuarios->random()->id,
                    'mod_id' => $mod->id,
                    'puntuacion' => rand(30, 50) / 10, // Genera puntuaciones entre 3.0 y 5.0
                    'fecha' => now()->subDays(rand(0, 30))
                ]);
            }
        }
    }
}
