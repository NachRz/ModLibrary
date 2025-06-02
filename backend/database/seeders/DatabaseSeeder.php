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
        $this->call([
            UsuarioSeeder::class,
            ModSeeder::class,
            ComentarioSeeder::class,
            ValoracionSeeder::class,
        ]);

        // Corregir automáticamente el problema del enlace simbólico
        $this->fixStorageLink();
    }

    /**
     * Corrige el problema del enlace simbólico entre public/storage y storage/app/public
     */
    private function fixStorageLink(): void
    {
        $this->command->info('🔧 Corrigiendo enlace simbólico de storage...');

        $publicStoragePath = public_path('storage');
        $storageAppPublicPath = storage_path('app/public');

        try {
            // Si public/storage existe y NO es un enlace simbólico
            if (File::exists($publicStoragePath) && !is_link($publicStoragePath)) {
                
                // Hacer backup del contenido existente si hay archivos
                if (File::exists($publicStoragePath) && count(File::allFiles($publicStoragePath)) > 0) {
                    $this->command->warn('⚠️  Encontrados archivos en public/storage. Sincronizando con storage/app/public...');
                    
                    // Copiar archivos de public/storage a storage/app/public si no existen
                    $this->syncFiles($publicStoragePath, $storageAppPublicPath);
                }

                // Eliminar la carpeta public/storage
                File::deleteDirectory($publicStoragePath);
                $this->command->info('📂 Eliminada carpeta duplicada public/storage');
            }

            // Crear el enlace simbólico correcto
            if (!is_link($publicStoragePath)) {
                Artisan::call('storage:link');
                $this->command->info('🔗 Enlace simbólico creado correctamente');
                $this->command->info('✅ Problema de almacenamiento corregido. Ahora los archivos solo se guardan en una ubicación.');
            } else {
                $this->command->info('✅ El enlace simbólico ya existe y está configurado correctamente');
            }

        } catch (\Exception $e) {
            $this->command->error('❌ Error al corregir el enlace simbólico: ' . $e->getMessage());
            Log::error('Error al corregir enlace simbólico en seeder', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Sincroniza archivos entre dos directorios
     */
    private function syncFiles(string $source, string $destination): void
    {
        if (!File::exists($destination)) {
            File::makeDirectory($destination, 0755, true);
        }

        $files = File::allFiles($source);
        
        foreach ($files as $file) {
            $relativePath = $file->getRelativePathname();
            $destFile = $destination . DIRECTORY_SEPARATOR . $relativePath;
            
            // Solo copiar si el archivo no existe en el destino
            if (!File::exists($destFile)) {
                $destDir = dirname($destFile);
                if (!File::exists($destDir)) {
                    File::makeDirectory($destDir, 0755, true);
                }
                File::copy($file->getRealPath(), $destFile);
                $this->command->info("📄 Sincronizado: {$relativePath}");
            }
        }
    }
}
