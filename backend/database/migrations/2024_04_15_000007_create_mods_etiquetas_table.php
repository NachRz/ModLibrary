<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('mods_etiquetas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mod_id')->constrained('mods')->onDelete('cascade');
            $table->foreignId('etiqueta_id')->constrained('etiquetas')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('mods_etiquetas');
    }
}; 