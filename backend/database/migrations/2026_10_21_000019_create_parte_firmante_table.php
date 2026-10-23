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
        // Partes del convenio: una fila por institución firmante (mínimo 2 para aprobar).
        Schema::create('parte_firmante', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_institucion')->constrained('institucion')->restrictOnDelete();
            $table->foreignId('id_instrumento')->constrained('instrumento')->cascadeOnDelete();
            $table->date('fecha_firma')->nullable();
            $table->timestamps();
            $table->foreignId('created_by')->nullable()->constrained('usuario')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('usuario')->nullOnDelete();

            $table->unique(['id_institucion', 'id_instrumento']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parte_firmante');
    }
};
