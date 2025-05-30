<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('mods', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->string('imagen_banner');
            $table->json('imagenes_adicionales')->nullable();
            $table->integer('edad_recomendada');
            $table->foreignId('juego_id')->constrained('juegos')->onDelete('cascade');
            $table->string('version_juego_necesaria');
            $table->string('version_actual');
            $table->string('url');
            $table->foreignId('creador_id')->constrained('usuarios')->onDelete('cascade');
            $table->text('descripcion');
            $table->integer('total_descargas')->default(0);
            $table->integer('num_valoraciones')->default(0);
            $table->decimal('val_media', 3, 1)->default(0.0);
            $table->string('estado')->default('publicado');
            
            // Campos booleanos para configuraciones del mod
            $table->boolean('es_destacado')->default(false);
            $table->boolean('permitir_comentarios')->default(true);
            $table->boolean('visible_en_busqueda')->default(true);
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('mods');
    }
}; 