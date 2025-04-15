<?php

namespace Database\Seeders;

use App\Models\Comentario;
use App\Models\Mod;
use App\Models\Usuario;
use Illuminate\Database\Seeder;

class ComentarioSeeder extends Seeder
{
    public function run()
    {
        $mods = Mod::all();
        $usuarios = Usuario::all();

        foreach ($mods as $mod) {
            $numComentarios = rand(3, 7);
            for ($i = 0; $i < $numComentarios; $i++) {
                Comentario::create([
                    'usuario_id' => $usuarios->random()->id,
                    'mod_id' => $mod->id,
                    'contenido' => 'Este es un comentario de ejemplo para el mod ' . $mod->titulo,
                    'fecha' => now()->subDays(rand(0, 30))
                ]);
            }
        }
    }
} 