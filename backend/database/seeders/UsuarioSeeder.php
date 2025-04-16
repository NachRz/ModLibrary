<?php

namespace Database\Seeders;

use App\Models\Usuario;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsuarioSeeder extends Seeder
{
    public function run()
    {
        if (!Usuario::where('correo', 'admin@modlibrary.com')->exists()) {
            Usuario::create([
                'nome' => 'admin',
                'contrasina' => Hash::make('admin123'),
                'rol' => 'admin',
                'nombre' => 'Administrador',
                'apelidos' => 'Sistema',
                'foto_perfil' => null,
                'correo' => 'admin@modlibrary.com'
            ]);
        }

        if (!Usuario::where('correo', 'usuario1@modlibrary.com')->exists()) {
            Usuario::create([
                'nome' => 'usuario1',
                'contrasina' => Hash::make('usuario123'),
                'rol' => 'usuario',
                'nombre' => 'Usuario',
                'apelidos' => 'Ejemplo',
                'foto_perfil' => null,
                'correo' => 'usuario1@modlibrary.com'
            ]);
        }
    }
} 