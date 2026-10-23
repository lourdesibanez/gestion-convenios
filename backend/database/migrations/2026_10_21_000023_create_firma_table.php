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
        // Firma de un instrumento por un usuario (autoridad) desde la app.
        Schema::create('firma', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_instrumento')->constrained('instrumento')->cascadeOnDelete();
            // Autoridad que debe firmar.
            $table->foreignId('id_usuario')->constrained('usuario')->restrictOnDelete();
            // null = pendiente ("Mis pendientes").
            $table->timestamp('firmado_en')->nullable();
            $table->decimal('latitud', 10, 7)->nullable();
            $table->decimal('longitud', 10, 7)->nullable();
            // Imagen de la firma a mano.
            $table->string('ruta_imagen_firma')->nullable();
            // SHA-256 del PDF firmado.
            $table->char('hash_documento', 64)->nullable();
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
        Schema::dropIfExists('firma');
    }
};
