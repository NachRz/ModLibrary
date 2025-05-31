<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('generos', function (Blueprint $table) {
            $table->id();
            $table->integer('rawg_id')->unique(); // ID del género en RAWG
            $table->string('nombre'); // Nombre del género
            $table->string('slug')->unique(); // Slug del género
            $table->text('descripcion')->nullable(); // Descripción del género
            $table->string('imagen')->nullable(); // URL de imagen del género
            $table->integer('games_count')->default(0); // Cantidad de juegos con este género
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('generos');
    }
};
