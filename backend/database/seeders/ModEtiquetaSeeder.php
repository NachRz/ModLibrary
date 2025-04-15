<?php

namespace Database\Seeders;

use App\Models\Mod;
use App\Models\Etiqueta;
use Illuminate\Database\Seeder;

class ModEtiquetaSeeder extends Seeder
{
    public function run()
    {
        $mods = Mod::all();
        $etiquetas = Etiqueta::all();

        foreach ($mods as $mod) {
            $etiquetasAleatorias = $etiquetas->random(rand(2, 4));
            $mod->etiquetas()->attach($etiquetasAleatorias);
        }
    }
} 