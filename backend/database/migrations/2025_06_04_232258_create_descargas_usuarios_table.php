<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('descargas_usuarios', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('usuario_id');
            $table->unsignedBigInteger('mod_id');
            $table->timestamp('fecha_descarga')->useCurrent();
            $table->timestamps();

            // Índices y claves foráneas
            $table->foreign('usuario_id')->references('id')->on('usuarios')->onDelete('cascade');
            $table->foreign('mod_id')->references('id')->on('mods')->onDelete('cascade');
            
            // Índice compuesto para consultas eficientes
            $table->index(['usuario_id', 'mod_id']);
            $table->index(['mod_id', 'fecha_descarga']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('descargas_usuarios');
    }
};
