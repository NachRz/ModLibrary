<?php

namespace Database\Seeders;

use App\Models\Etiqueta;
use Illuminate\Database\Seeder;

class EtiquetaSeeder extends Seeder
{
    public function run()
    {
        $etiquetas = [
            'Texturas',
            'Personajes',
            'Armas',
            'Mapas',
            'Modo de Juego',
            'Interfaz',
            'Sonido',
            'Realismo',
            'Fantasía',
            'Ciencia Ficción'
        ];

        foreach ($etiquetas as $etiqueta) {
            Etiqueta::create([
                'nombre' => $etiqueta
            ]);
        }
    }
} 