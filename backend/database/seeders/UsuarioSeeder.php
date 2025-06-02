<?php

namespace Database\Seeders;

use App\Models\Usuario;
use App\Models\RedSocial;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\File;

class UsuarioSeeder extends Seeder
{
    /**
     * Crear carpeta de usuario y copiar avatar por defecto
     */
    private function crearCarpetaUsuario($usuarioId)
    {
        $userPath = storage_path('app/public/users/user_' . $usuarioId);
        
        // Crear carpeta del usuario
        if (!File::exists($userPath)) {
            File::makeDirectory($userPath, 0755, true);
        }

        // Copiar avatar por defecto con nuevo nombre: user_{id}_avatar.png
        $defaultAvatar = storage_path('app/public/defaults/avatars/default_avatar.png');
        $userAvatar = $userPath . '/user_' . $usuarioId . '_avatar.png';
        if (File::exists($defaultAvatar) && !File::exists($userAvatar)) {
            File::copy($defaultAvatar, $userAvatar);
        }

        return "users/user_{$usuarioId}/user_{$usuarioId}_avatar.png";
    }

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

            // Crear carpeta y actualizar foto de perfil
            $avatarPath = $this->crearCarpetaUsuario($usuario1->id);
            $usuario1->update(['foto_perfil' => $avatarPath]);

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

            // Crear carpeta y actualizar foto de perfil
            $avatarPath = $this->crearCarpetaUsuario($usuario2->id);
            $usuario2->update(['foto_perfil' => $avatarPath]);

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

            // Crear carpeta y actualizar foto de perfil
            $avatarPath = $this->crearCarpetaUsuario($usuario3->id);
            $usuario3->update(['foto_perfil' => $avatarPath]);

            // Redes sociales para usuario3
            RedSocial::create([
                'usuario_id' => $usuario3->id,
                'nombre_red' => 'LinkedIn',
                'url' => 'https://www.linkedin.com/usuario3'
            ]);
        }
    }
} 