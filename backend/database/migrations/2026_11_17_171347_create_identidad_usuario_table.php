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
        Schema::create('identidad_usuario', function (Blueprint $table) {
            $table->id();
            // Una sola identidad por usuario
            $table->foreignId('id_usuario')->unique()->constrained('usuario')->cascadeOnDelete();
            // La firma se guarda como PNG en el disco privado; acá va solo la ruta
            $table->string('ruta_firma')->nullable();
            $table->timestamp('firma_registrada_en')->nullable();
            // Del rostro y la huella solo se guarda cuándo se registraron (nunca salen del celular)
            $table->timestamp('facial_registrado_en')->nullable();
            $table->timestamp('huella_registrada_en')->nullable();
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('identidad_usuario');
    }
};
