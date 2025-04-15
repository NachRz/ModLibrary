<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('redes_sociales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('usuarios')->onDelete('cascade');
            $table->string('nombre_red');
            $table->string('url');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('redes_sociales');
    }
}; 