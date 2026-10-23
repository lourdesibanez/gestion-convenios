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
        Schema::create('comentario', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_instrumento')->constrained('instrumento')->cascadeOnDelete();
            // Autor del comentario.
            $table->foreignId('id_usuario')->constrained('usuario')->restrictOnDelete();
            // Texto original; si es_ofensivo, la API devuelve "comentario ofensivo" en su lugar.
            $table->text('comentario');
            $table->boolean('es_ofensivo')->default(false);
            $table->timestamps();
            $table->softDeletes();
            $table->foreignId('deleted_by')->nullable()->constrained('usuario')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comentario');
    }
};
