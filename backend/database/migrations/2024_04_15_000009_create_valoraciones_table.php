<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('valoraciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->onDelete('cascade');
            $table->foreignId('mod_id')->constrained('mods')->onDelete('cascade');
            $table->decimal('puntuacion', 2, 1);
            $table->timestamp('fecha');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('valoraciones');
    }
}; 