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
        Schema::create('juegos_generos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('juego_id')->constrained('juegos')->onDelete('cascade');
            $table->foreignId('genero_id')->constrained('generos')->onDelete('cascade');
            $table->timestamps();

            // Evitar duplicados en la relación
            $table->unique(['juego_id', 'genero_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('juegos_generos');
    }
};
