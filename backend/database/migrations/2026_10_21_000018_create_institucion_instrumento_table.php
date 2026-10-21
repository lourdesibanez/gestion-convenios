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
        Schema::create('institucion_instrumento', function (Blueprint $table) {
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
        Schema::dropIfExists('institucion_instrumento');
    }
};
