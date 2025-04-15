<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('mods_guardados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->onDelete('cascade');
            $table->foreignId('mod_id')->constrained('mods')->onDelete('cascade');
            $table->timestamp('fecha_guardado');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('mods_guardados');
    }
}; 