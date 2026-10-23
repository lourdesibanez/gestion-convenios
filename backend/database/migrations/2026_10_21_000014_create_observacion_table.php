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
        Schema::create('observacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_instrumento')->constrained('instrumento')->cascadeOnDelete();
            // Revisor que hizo la observación.
            $table->foreignId('id_usuario')->constrained('usuario')->restrictOnDelete();
            $table->text('contenido');
            // Estado propio de la observación: pendiente | respondida | resuelta.
            $table->string('estado')->default('pendiente');
            $table->text('respuesta')->nullable();
            $table->foreignId('respondido_por')->nullable()->constrained('usuario')->nullOnDelete();
            $table->timestamp('fecha_respuesta')->nullable();
            $table->timestamp('fecha_resolucion')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('observacion');
    }
};
