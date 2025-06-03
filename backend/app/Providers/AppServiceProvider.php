<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Usuario;
use App\Models\Mod;
use App\Models\VersionMod;
use App\Observers\UsuarioObserver;
use App\Observers\ModObserver;
use App\Observers\VersionModObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Registrar observers para automatizar la gestión de archivos
        Usuario::observe(UsuarioObserver::class);
        Mod::observe(ModObserver::class);
        VersionMod::observe(VersionModObserver::class);
    }
}
