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
            $table->string('titulo');
            $table->string('imagen');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('juegos');
    }
}; 