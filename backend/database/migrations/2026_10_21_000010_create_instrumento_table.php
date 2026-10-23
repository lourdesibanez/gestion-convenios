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
        Schema::create('instrumento', function (Blueprint $table) {
            $table->id();
            // Referencia pública no adivinable, usada en el QR.
            $table->uuid('uuid')->unique();
            $table->string('codigo')->unique();
            $table->string('titulo');
            $table->foreignId('id_tipo_instrumento')->constrained('tipo_instrumento')->restrictOnDelete();
            // Unidad responsable: institución interna (UNLPam o unidad académica).
            $table->foreignId('id_institucion')->constrained('institucion')->restrictOnDelete();
            $table->foreignId('id_estado')->constrained('estado')->restrictOnDelete();
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_fin')->nullable();
            $table->date('fecha_firma')->nullable();
            $table->date('fecha_preaviso')->nullable();
            $table->string('numero_resolucion')->nullable();
            $table->string('referencia_expediente')->nullable();
            $table->text('notas')->nullable();
            // Bloqueo optimista: una edición con versión vieja se rechaza.
            $table->unsignedInteger('version')->default(1);
            $table->timestamps();
            $table->foreignId('created_by')->nullable()->constrained('usuario')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('usuario')->nullOnDelete();
            $table->softDeletes();
            $table->foreignId('deleted_by')->nullable()->constrained('usuario')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('instrumento');
    }
};
