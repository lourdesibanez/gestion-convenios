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
        Schema::create('archivo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_instrumento')->constrained('instrumento')->cascadeOnDelete();
            $table->string('nombre');
            $table->string('tipo_documento');
            $table->string('tipo_mime');
            $table->unsignedBigInteger('tamanio_bytes');
            $table->char('hash_sha256', 64);
            $table->string('ruta');
            // Las cargas no se editan: created_at es la fecha de carga.
            $table->timestamp('created_at')->useCurrent();
            $table->foreignId('created_by')->nullable()->constrained('usuario')->nullOnDelete();
            $table->softDeletes();
            $table->foreignId('deleted_by')->nullable()->constrained('usuario')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('archivo');
    }
};
