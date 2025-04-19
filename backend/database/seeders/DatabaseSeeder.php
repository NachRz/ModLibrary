<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

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
            ModGuardadoSeeder::class,
        ]);
    }
}
