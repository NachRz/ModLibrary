<?php

namespace Database\Seeders;

use App\Models\Usuario;
use App\Models\RedSocial;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsuarioSeeder extends Seeder
{
    public function run()
    {
        // Usuario 1 - Admin existente
        if (!Usuario::where('correo', 'admin@gmail.com')->exists()) {
            $usuario1 = Usuario::create([
                'nome' => 'usuario1',
                'contrasina' => Hash::make('1234'),
                'rol' => 'admin',
                'nombre' => 'Nombre Usuario 1',
                'apelidos' => 'Apellido1 Apellido2',
                'foto_perfil' => 'perfilPre.png',
                'correo' => 'admin@gmail.com'
            ]);

            // Redes sociales para usuario1
            $redes1 = ['Facebook', 'Twitter', 'LinkedIn'];
            foreach ($redes1 as $red) {
                RedSocial::create([
                    'usuario_id' => $usuario1->id,
                    'nombre_red' => $red,
                    'url' => 'https://www.' . strtolower($red) . '.com/usuario1'
                ]);
            }
        }

        // Usuario 2
        if (!Usuario::where('correo', 'usuario2@gmail.com')->exists()) {
            $usuario2 = Usuario::create([
                'nome' => 'usuario2',
                'contrasina' => Hash::make('1234'),
                'rol' => 'usuario',
                'nombre' => 'Nombre Usuario 2',
                'apelidos' => 'Apellido1 Apellido2',
                'foto_perfil' => 'perfilPre.png',
                'correo' => 'usuario2@gmail.com'
            ]);

            // Redes sociales para usuario2
            $redes2 = ['Instagram', 'Snapchat'];
            foreach ($redes2 as $red) {
                RedSocial::create([
                    'usuario_id' => $usuario2->id,
                    'nombre_red' => $red,
                    'url' => 'https://www.' . strtolower($red) . '.com/usuario2'
                ]);
            }
        }

        // Usuario 3
        if (!Usuario::where('correo', 'usuario3@gmail.com')->exists()) {
            $usuario3 = Usuario::create([
                'nome' => 'usuario3',
                'contrasina' => Hash::make('1234'),
                'rol' => 'usuario',
                'nombre' => 'Nombre Usuario 3',
                'apelidos' => 'Apellido1 Apellido2',
                'foto_perfil' => 'perfilPre.png',
                'correo' => 'usuario3@gmail.com'
            ]);

            // Redes sociales para usuario3
            RedSocial::create([
                'usuario_id' => $usuario3->id,
                'nombre_red' => 'LinkedIn',
                'url' => 'https://www.linkedin.com/usuario3'
            ]);
        }
    }
} 