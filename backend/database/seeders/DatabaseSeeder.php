<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Corregir automáticamente el problema del enlace simbólico PRIMERO
        $this->fixStorageLink();

        // Limpiar solo las carpetas específicas antes de ejecutar los seeders
        $this->limpiarCarpetasEspecificas();

        $this->call([
            UsuarioSeeder::class,
            ModSeeder::class,
            ComentarioSeeder::class,
            ValoracionSeeder::class,
        ]);
    }

    /**
     * Limpia únicamente las carpetas mods y users, manteniendo el resto
     */
    private function limpiarCarpetasEspecificas(): void
    {
        $this->command->info('Limpiando carpetas específicas (mods y users)...');

        $storageAppPublicPath = storage_path('app/public');

        // Limpiar carpeta de mods
        $modsPath = $storageAppPublicPath . '/mods';
        if (File::exists($modsPath)) {
            File::deleteDirectory($modsPath);
            $this->command->info('Carpeta mods eliminada');
        }

        // Limpiar carpeta de users
        $usersPath = $storageAppPublicPath . '/users';
        if (File::exists($usersPath)) {
            File::deleteDirectory($usersPath);
            $this->command->info('Carpeta users eliminada');
        }

        // Recrear las carpetas
        File::makeDirectory($modsPath, 0755, true);
        File::makeDirectory($usersPath, 0755, true);

        $this->command->info('Carpetas mods y users recreadas');
    }

    /**
     * Corrige el problema del enlace simbólico entre public/storage y storage/app/public
     */
    private function fixStorageLink(): void
    {
        $this->command->info('Creando enlace simbólico de storage...');

        try {
            // Simplemente ejecutar el comando artisan storage:link
            Artisan::call('storage:link');
            $this->command->info('Enlace simbólico creado correctamente');
        } catch (\Exception $e) {
            $this->command->error('Error al crear el enlace simbólico: ' . $e->getMessage());
            Log::error('Error al crear enlace simbólico en seeder', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}
