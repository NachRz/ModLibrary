<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('comentarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->onDelete('cascade');
            $table->foreignId('mod_id')->constrained('mods')->onDelete('cascade');
            $table->text('contenido');
            $table->timestamp('fecha');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('comentarios');
    }
}; 