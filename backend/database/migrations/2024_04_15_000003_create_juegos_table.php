<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('juegos', function (Blueprint $table) {
            $table->id();
            $table->integer('rawg_id')->unique();
            $table->string('slug')->unique();
            $table->string('titulo');
            $table->string('titulo_original');
            $table->text('descripcion');
            $table->integer('metacritic')->nullable();
            $table->date('fecha_lanzamiento');
            $table->boolean('tba')->default(false);
            $table->timestamp('actualizado');
            $table->string('imagen_fondo');
            $table->string('imagen_fondo_adicional')->nullable();
            $table->string('sitio_web')->nullable();
            $table->decimal('rating', 3, 2);
            $table->integer('rating_top');
            $table->integer('mods_totales')->default(0);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('juegos');
    }
}; 