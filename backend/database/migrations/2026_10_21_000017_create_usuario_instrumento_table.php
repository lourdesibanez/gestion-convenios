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
        Schema::create('usuario_instrumento', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_usuario')->constrained('usuario')->restrictOnDelete();
            $table->foreignId('id_instrumento')->constrained('instrumento')->cascadeOnDelete();
            $table->string('accion');
            $table->text('detalle')->nullable();
            // Registro de auditoría inmutable: solo fecha de alta.
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuario_instrumento');
    }
};
