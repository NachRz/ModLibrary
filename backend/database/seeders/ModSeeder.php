<?php

namespace Database\Seeders;

use App\Models\Mod;
use App\Models\Juego;
use App\Models\Usuario;
use App\Models\Etiqueta;
use App\Models\Genero;
use App\Models\VersionMod;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use App\Services\RawgService;
use Illuminate\Support\Facades\Log;

class ModSeeder extends Seeder
{
    protected $rawgService;

    public function __construct(RawgService $rawgService)
    {
        $this->rawgService = $rawgService;
    }

    /**
     * Crear carpetas para un mod específico y copiar archivos por defecto
     */
    private function crearCarpetasMod($modTitulo, $versionActual, $versionesAnteriores = [], $modId)
    {
        $modSlug = strtolower(str_replace(' ', '_', $modTitulo));
        $basePath = storage_path('app/public/mods/' . $modSlug);

        // Eliminar carpeta del mod si ya existe
        if (File::exists($basePath)) {
            File::deleteDirectory($basePath);
        }

        // Crear carpeta principal del mod
        File::makeDirectory($basePath, 0755, true);

        // Crear subcarpetas
        $subcarpetas = ['banners', 'imagenes_adicionales', 'versions'];
        foreach ($subcarpetas as $subcarpeta) {
            $subcarpetaPath = $basePath . '/' . $subcarpeta;
            File::makeDirectory($subcarpetaPath, 0755, true);
        }

        // Crear carpetas de versiones y copiar archivos por defecto
        $versiones = array_merge([$versionActual], $versionesAnteriores);

        foreach ($versiones as $version) {
            $versionPath = $basePath . '/versions/v' . $version;
            File::makeDirectory($versionPath, 0755, true);

            // Copiar archivo de mod por defecto con nuevo nombre: mod_{mod_id}_v{version}.zip
            $defaultModFile = storage_path('app/public/defaults/files/default_mod.zip');
            $modFile = $versionPath . '/mod_' . $modId . '_v' . $version . '.zip';

            if (File::exists($defaultModFile)) {
                File::copy($defaultModFile, $modFile);
            } else {
                // Crear un archivo vacío como respaldo
                File::put($modFile, '');
            }
        }

        // Copiar banner por defecto: banner_{mod_id}_v{version}.jpg
        $defaultBanner = storage_path('app/public/defaults/banners/default_banner.jpg');
        $modBanner = $basePath . '/banners/banner_' . $modId . '_v' . $versionActual . '.jpg';

        if (File::exists($defaultBanner)) {
            File::copy($defaultBanner, $modBanner);
        } else {
            // Crear un archivo de imagen vacío como respaldo
            File::put($modBanner, '');
        }

        // Copiar imágenes adicionales por defecto
        $imagenesAdicionales = [];
        $defaultImagesDir = storage_path('app/public/defaults/imagenes_adicionales/');
        $defaultImagesPaths = [];

        if (File::exists($defaultImagesDir)) {
            $files = File::files($defaultImagesDir);
            foreach ($files as $file) {
                if (in_array(strtolower($file->getExtension()), ['jpg', 'jpeg', 'png', 'gif'])) {
                    $defaultImagesPaths[] = $file->getPathname();
                }
            }
        }

        // Copiar hasta 3 imágenes adicionales por defecto
        $maxImages = min(3, count($defaultImagesPaths));
        for ($i = 0; $i < $maxImages; $i++) {
            if (isset($defaultImagesPaths[$i]) && File::exists($defaultImagesPaths[$i])) {
                $imageName = 'img_' . ($i + 1) . '.jpg';
                $modImage = $basePath . '/imagenes_adicionales/' . $imageName;
                File::copy($defaultImagesPaths[$i], $modImage);
                $imagenesAdicionales[] = "mods/{$modSlug}/imagenes_adicionales/{$imageName}";
            }
        }

        // Si no hay imágenes por defecto, crear imágenes vacías
        if ($maxImages === 0) {
            for ($i = 1; $i <= 3; $i++) {
                $imageName = 'img_' . $i . '.jpg';
                $modImage = $basePath . '/imagenes_adicionales/' . $imageName;
                File::put($modImage, '');
                $imagenesAdicionales[] = "mods/{$modSlug}/imagenes_adicionales/{$imageName}";
            }
        }

        return [$modSlug, 'banner_' . $modId . '_v' . $versionActual . '.jpg', $imagenesAdicionales];
    }

    /**
     * Extraer y asociar géneros de un juego desde RAWG
     */
    private function extraerYAsociarGeneros(Juego $juego, array $gameData): void
    {
        try {
            $generosIds = [];

            // Verificar si el juego tiene géneros en los datos de RAWG
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

            // Sincronizar la relación (esto reemplaza los géneros existentes del juego)
            $juego->generos()->sync($generosIds);
        } catch (\Exception $e) {
            // Silenciar errores para mantener consistencia
        }
    }

    public function run()
    {
        $this->command->info('Iniciando ModSeeder - Creación de mods y carpetas...');

        // Cargar datos del JSON
        $jsonPath = base_path('resources/assets/data/mods.json');
        if (!File::exists($jsonPath)) {
            $this->command->error("Archivo JSON no encontrado: {$jsonPath}");
            return;
        }

        $jsonData = json_decode(File::get($jsonPath), true);
        if (!$jsonData || !isset($jsonData['mods'])) {
            $this->command->error("Estructura JSON inválida o sin datos de mods");
            return;
        }

        $mods = $jsonData['mods'];
        $this->command->info("Encontrados " . count($mods) . " mods en el JSON");

        // Verificar y crear directorio de archivos por defecto si no existe
        $defaultsPath = storage_path('app/public/defaults');
        if (!File::exists($defaultsPath)) {
            File::makeDirectory($defaultsPath, 0755, true);
            $this->command->info("Creado directorio de archivos por defecto: {$defaultsPath}");

            // Crear subdirectorios
            File::makeDirectory($defaultsPath . '/banners', 0755, true);
            File::makeDirectory($defaultsPath . '/files', 0755, true);
            File::makeDirectory($defaultsPath . '/imagenes_adicionales', 0755, true);
        }

        // Obtener usuarios
        $usuarios = Usuario::whereIn('nome', ['usuario1', 'usuario2', 'usuario3'])->get()->keyBy('nome');

        if ($usuarios->count() < 3) {
            $this->command->error('Los usuarios necesarios no existen. Ejecute el seeder de usuarios primero.');
            return;
        }

        $this->command->info("Usuarios encontrados: " . $usuarios->count());

        // Primero, recopilar información sobre juegos de los mods
        $juegosInfo = [];
        foreach ($mods as $modData) {
            $juegoNombre = $modData['Juego'];
            if (!isset($juegosInfo[$juegoNombre])) {
                $juegosInfo[$juegoNombre] = [
                    'nombre' => $juegoNombre,
                    'edad_recomendada' => $modData['EdadRecomendada'] ?? 16
                ];
            }
        }

        // Crear juegos si no existen
        $juegosMap = [];
        $this->command->info('Obteniendo información de ' . count($juegosInfo) . ' juegos desde RAWG API...');

        foreach ($juegosInfo as $juegoNombre => $juegoInfo) {
            // Buscar el juego en RAWG API para obtener su ID real
            $rawgId = null;
            $rawgData = null;

            $searchResults = $this->rawgService->searchGames($juegoNombre);
            if ($searchResults && isset($searchResults['results']) && count($searchResults['results']) > 0) {
                // Tomar el primer resultado que coincide mejor con el nombre
                $rawgData = $searchResults['results'][0];
                $rawgId = $rawgData['id'];
            }

            $juego = Juego::firstOrCreate(
                ['titulo' => $juegoNombre],
                [
                    'slug' => $rawgData['slug'] ?? strtolower(str_replace(' ', '-', $juegoNombre)),
                    'rawg_id' => $rawgId ?? 10000 + rand(1, 9999), // Usar ID real o uno provisional si no se encuentra
                    'titulo_original' => $rawgData['name'] ?? $juegoNombre,
                    'descripcion' => $rawgData['description'] ?? 'Descripción generada automáticamente para ' . $juegoNombre,
                    'metacritic' => $rawgData['metacritic'] ?? rand(60, 95),
                    'fecha_lanzamiento' => isset($rawgData['released']) ? \Carbon\Carbon::parse($rawgData['released']) : now()->subYears(rand(1, 5)),
                    'tba' => $rawgData['tba'] ?? false,
                    'actualizado' => now(),
                    'imagen_fondo' => $rawgData['background_image'] ?? 'default_background.jpg',
                    'sitio_web' => $rawgData['website'] ?? 'https://www.ejemplo.com/' . strtolower(str_replace(' ', '-', $juegoNombre)),
                    'rating' => $rawgData['rating'] ?? (rand(30, 50) / 10),
                    'rating_top' => $rawgData['rating_top'] ?? 5
                ]
            );

            // Extraer y asociar géneros automáticamente si tenemos datos de RAWG
            if ($rawgData && $rawgId) {
                // Obtener datos completos del juego para extraer géneros
                $gameFullData = $this->rawgService->getGame($rawgId);
                if ($gameFullData) {
                    $this->extraerYAsociarGeneros($juego, $gameFullData);
                }
            }

            $juegosMap[$juegoNombre] = $juego;
        }

        $this->command->info('Juegos creados con géneros extraídos automáticamente.');

        // Recopilar todas las etiquetas únicas primero
        $etiquetasUnicas = collect();
        foreach ($mods as $modData) {
            if (isset($modData['Etiquetas']) && is_array($modData['Etiquetas'])) {
                $etiquetasUnicas = $etiquetasUnicas->concat($modData['Etiquetas']);
            }
        }
        $etiquetasUnicas = $etiquetasUnicas->unique()->values();

        // Procesar todas las etiquetas primero
        $this->command->info('Procesando ' . $etiquetasUnicas->count() . ' etiquetas únicas...');

        $etiquetasCache = [];
        foreach ($etiquetasUnicas as $etiquetaNombre) {
            try {
                // Buscar la etiqueta en RAWG
                $results = $this->rawgService->searchTags($etiquetaNombre);

                if ($results && isset($results['results']) && count($results['results']) > 0) {
                    // Intentar encontrar una coincidencia exacta primero
                    $tagMatch = collect($results['results'])->first(function ($tag) use ($etiquetaNombre) {
                        return strtolower($tag['name']) === strtolower($etiquetaNombre);
                    });

                    // Si no hay coincidencia exacta, usar el primer resultado
                    if (!$tagMatch) {
                        $tagMatch = $results['results'][0];
                    }

                    // Crear o actualizar la etiqueta
                    $etiqueta = Etiqueta::firstOrCreate(
                        ['rawg_id' => $tagMatch['id']],
                        ['nombre' => $tagMatch['name']]
                    );

                    $etiquetasCache[strtolower($etiquetaNombre)] = $etiqueta;
                }
            } catch (\Exception $e) {
                // Ignorar errores de linter como solicitado
            }
        }

        $this->command->info('Procesamiento de etiquetas completado.');

        // Ahora, procesar los mods usando los juegos y etiquetas ya creados
        $this->command->info('Creando mods y sus carpetas...');

        $totalMods = count($mods);

        foreach ($mods as $modData) {
            // Determinar el creador basado en el campo 'Creador'
            $creadorNombre = $modData['Creador'] ?? 'usuario1';
            $creador = $usuarios->has($creadorNombre) ? $usuarios[$creadorNombre] : $usuarios['usuario1'];

            // Obtener el juego ya creado
            $juego = $juegosMap[$modData['Juego']];

            // Crear el mod primero (sin imagen_banner definitiva)
            $mod = Mod::create([
                'titulo' => $modData['Titulo'],
                'imagen_banner' => 'temporal', // Se actualizará después
                'edad_recomendada' => $modData['EdadRecomendada'],
                'juego_id' => $juego->id,
                'version_actual' => $modData['VersionActual'],
                'url' => $modData['Url'],
                'creador_id' => $creador->id,
                'descripcion' => $modData['Descripcion'],
                'estado' => $modData['Estado'],
                'total_descargas' => $modData['NumDescargas']
            ]);

            // Crear carpetas para el mod usando el ID real
            $resultado = $this->crearCarpetasMod(
                $modData['Titulo'],
                $modData['VersionActual'],
                $modData['VersionesAnteriores'] ?? [],
                $mod->id
            );

            $modSlug = $resultado[0];
            $bannerFileName = $resultado[1];
            $imagenesAdicionales = $resultado[2];

            // Actualizar la imagen_banner con la ruta correcta
            $mod->update([
                'imagen_banner' => "mods/{$modSlug}/banners/{$bannerFileName}",
                'imagenes_adicionales' => !empty($imagenesAdicionales) ? json_encode($imagenesAdicionales) : null
            ]);

            // Asociar etiquetas usando el caché
            if (isset($modData['Etiquetas']) && is_array($modData['Etiquetas'])) {
                $etiquetasIds = [];
                foreach ($modData['Etiquetas'] as $etiquetaNombre) {
                    if (isset($etiquetasCache[strtolower($etiquetaNombre)])) {
                        $etiquetasIds[] = $etiquetasCache[strtolower($etiquetaNombre)]->id;
                    }
                }
                if (!empty($etiquetasIds)) {
                    $mod->etiquetas()->syncWithoutDetaching($etiquetasIds);
                }
            }

            // Crear versiones
            // Versión actual
            VersionMod::firstOrCreate(
                [
                    'mod_id' => $mod->id,
                    'version' => $modData['VersionActual']
                ],
                [
                    'fecha_lanzamiento' => now()->subDays(rand(1, 30))
                ]
            );

            // Versiones anteriores
            if (isset($modData['VersionesAnteriores']) && is_array($modData['VersionesAnteriores'])) {
                foreach ($modData['VersionesAnteriores'] as $version) {
                    VersionMod::firstOrCreate(
                        [
                            'mod_id' => $mod->id,
                            'version' => $version
                        ],
                        [
                            'fecha_lanzamiento' => now()->subDays(rand(31, 365))
                        ]
                    );
                }
            }
        }

        $this->command->info('Seeder de mods completado con éxito.');
        $this->command->info("Total de mods procesados: {$totalMods}");
        $this->command->info("Todas las carpetas y archivos de mods han sido creados.");
    }
}
