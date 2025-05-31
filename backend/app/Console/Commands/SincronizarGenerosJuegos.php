<?php

namespace App\Console\Commands;

use App\Models\Juego;
use App\Models\Genero;
use App\Services\RawgService;
use Illuminate\Console\Command;

class SincronizarGenerosJuegos extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'juegos:sincronizar-generos {--force : Forzar sincronización incluso si el juego ya tiene géneros}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sincronizar géneros de todos los juegos existentes desde RAWG';

    protected $rawgService;

    public function __construct(RawgService $rawgService)
    {
        parent::__construct();
        $this->rawgService = $rawgService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Iniciando sincronización de géneros para todos los juegos...');
        
        $force = $this->option('force');
        $juegos = Juego::all();
        $totalJuegos = $juegos->count();
        $procesados = 0;
        $errores = 0;
        $generosSincronizados = 0;

        $this->info("Encontrados {$totalJuegos} juegos para procesar");

        foreach ($juegos as $juego) {
            // Si no es forzado y el juego ya tiene géneros, saltar
            if (!$force && $juego->generos()->count() > 0) {
                $this->line("Saltando {$juego->titulo} (ya tiene géneros)");
                continue;
            }

            $this->line("Procesando: {$juego->titulo}");

            try {
                // Obtener datos del juego desde RAWG
                $gameData = $this->rawgService->getGame($juego->rawg_id);

                if (!$gameData) {
                    $this->error("No se pudieron obtener datos para: {$juego->titulo}");
                    $errores++;
                    continue;
                }

                // Extraer y asociar géneros
                $generosIds = [];

                if (isset($gameData['genres']) && is_array($gameData['genres'])) {
                    foreach ($gameData['genres'] as $generoData) {
                        // Crear o actualizar el género sin duplicar
                        $genero = Genero::updateOrCreate(
                            ['rawg_id' => $generoData['id']],
                            [
                                'nombre' => $generoData['name'],
                                'slug' => $generoData['slug'],
                                'games_count' => $generoData['games_count'] ?? 0
                            ]
                        );
                        
                        $generosIds[] = $genero->id;
                    }
                }

                // Sincronizar la relación
                $juego->generos()->sync($generosIds);
                $generosSincronizados += count($generosIds);

                $this->info("✓ {$juego->titulo} - " . count($generosIds) . " géneros sincronizados");
                $procesados++;

                // Pausa pequeña para no sobrecargar la API
                usleep(100000); // 0.1 segundos

            } catch (\Exception $e) {
                $this->error("Error procesando {$juego->titulo}: {$e->getMessage()}");
                $errores++;
            }
        }

        $this->info('');
        $this->info('=== RESUMEN ===');
        $this->info("Total juegos: {$totalJuegos}");
        $this->info("Procesados exitosamente: {$procesados}");
        $this->info("Errores: {$errores}");
        $this->info("Géneros sincronizados: {$generosSincronizados}");
        $this->info('Sincronización completada!');

        return Command::SUCCESS;
    }
}
