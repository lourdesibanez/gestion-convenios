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
        Schema::create('instrumento_vinculo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_instrumento_origen')->constrained('instrumento')->cascadeOnDelete();
            $table->foreignId('id_instrumento_destino')->constrained('instrumento')->cascadeOnDelete();
            $table->string('tipo_vinculo');
            $table->timestamps();
            $table->foreignId('created_by')->nullable()->constrained('usuario')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('usuario')->nullOnDelete();

            $table->unique(['id_instrumento_origen', 'id_instrumento_destino', 'tipo_vinculo']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('instrumento_vinculo');
    }
};
