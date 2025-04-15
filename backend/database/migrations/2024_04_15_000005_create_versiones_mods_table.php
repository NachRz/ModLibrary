<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('versiones_mods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mod_id')->constrained('mods')->onDelete('cascade');
            $table->string('version');
            $table->timestamp('fecha_lanzamiento');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('versiones_mods');
    }
}; 