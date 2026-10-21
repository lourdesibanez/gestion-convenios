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
            $table->foreignId('id_usuario')->constrained('usuario')->restrictOnDelete();
            $table->text('contenido');
            $table->foreignId('id_estado')->constrained('estado')->restrictOnDelete();
            $table->text('respuesta')->nullable();
            $table->timestamp('fecha_resolucion')->nullable();
            // id_usuario es quien la crea; updated_by registra quién respondió o la resolvió.
            $table->timestamps();
            $table->foreignId('updated_by')->nullable()->constrained('usuario')->nullOnDelete();
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
