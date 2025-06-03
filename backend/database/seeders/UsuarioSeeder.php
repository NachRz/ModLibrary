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
     * Limpiar todas las carpetas de usuarios existentes
     */
    private function limpiarCarpetasUsuarios()
    {
        $usersBasePath = storage_path('app/public/users');
        
        if (File::exists($usersBasePath)) {
            // Obtener todas las carpetas de usuarios
            $carpetasUsuarios = File::directories($usersBasePath);
            $totalCarpetas = count($carpetasUsuarios);
            
            if ($totalCarpetas > 0) {
                $this->command->info("Eliminando {$totalCarpetas} carpetas de usuarios existentes...");
                
                foreach ($carpetasUsuarios as $carpeta) {
                    File::deleteDirectory($carpeta);
                }
                
                $this->command->info("Limpieza completada - {$totalCarpetas} carpetas eliminadas");
            } else {
                $this->command->info("No hay carpetas de usuarios para eliminar");
            }
        } else {
            $this->command->info("Directorio de usuarios no existe");
        }
        
        // También crear el directorio de defaults si no existe
        $defaultsPath = storage_path('app/public/defaults');
        if (!File::exists($defaultsPath)) {
            File::makeDirectory($defaultsPath, 0755, true);
            $this->command->info("Creado directorio de archivos por defecto: {$defaultsPath}");
            
            // Crear subdirectorio de avatares
            File::makeDirectory($defaultsPath . '/avatars', 0755, true);
        }
    }

    /**
     * Crear carpeta de usuario y copiar avatar por defecto
     */
    private function crearCarpetaUsuario($usuarioId)
    {
        $userPath = storage_path('app/public/users/user_' . $usuarioId);
        
        // Eliminar carpeta del usuario si ya existe
        if (File::exists($userPath)) {
            File::deleteDirectory($userPath);
        }
        
        // Crear carpeta del usuario
        File::makeDirectory($userPath, 0755, true);

        // Copiar avatar por defecto con nuevo nombre: user_{id}_avatar.png
        $defaultAvatar = storage_path('app/public/defaults/avatars/default_avatar.png');
        $userAvatar = $userPath . '/user_' . $usuarioId . '_avatar.png';
        if (File::exists($defaultAvatar)) {
            File::copy($defaultAvatar, $userAvatar);
        } else {
            // Crear un archivo vacío como respaldo
            File::put($userAvatar, '');
        }

        return "users/user_{$usuarioId}/user_{$usuarioId}_avatar.png";
    }

    public function run()
    {
        $this->command->info('Iniciando UsuarioSeeder - Creación de usuarios y carpetas...');
        
        // Limpiar carpetas de usuarios existentes antes de empezar
        $this->limpiarCarpetasUsuarios();
        
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
        
        $this->command->newLine();
        $this->command->info('Seeder de usuarios completado con éxito.');
        $this->command->info("Total de usuarios procesados: 3");
        $this->command->info("Todas las carpetas y archivos de usuarios han sido creados.");
    }
} 