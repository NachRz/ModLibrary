<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('juegos_favoritos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->onDelete('cascade');
            $table->foreignId('juego_id')->constrained('juegos')->onDelete('cascade');
            $table->timestamp('fecha_agregado');
            $table->timestamps();
            
            // Índice único para evitar duplicados de la misma relación usuario-juego
            $table->unique(['usuario_id', 'juego_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('juegos_favoritos');
    }
}; 