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
        Schema::create('pasantia', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_representante_instrumento')->unique()->constrained('representante_instrumento')->cascadeOnDelete();
            $table->string('carrera');
            $table->unsignedInteger('carga_horaria');
            $table->decimal('asignacion', 12, 2)->nullable();
            $table->text('datos_seguro')->nullable();
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
        Schema::dropIfExists('pasantia');
    }
};
