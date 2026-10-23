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
        // Especialización de instrumento: comparte la PK.
        Schema::create('convenio', function (Blueprint $table) {
            $table->foreignId('id_instrumento')->primary()->constrained('instrumento')->cascadeOnDelete();
            $table->text('objeto')->nullable();
            $table->text('marco_legal')->nullable();
            $table->text('obligaciones')->nullable();
            $table->text('condiciones_terminacion')->nullable();
            $table->text('condiciones_renovacion')->nullable();
            $table->text('confidencialidad')->nullable();
            $table->text('alcance_actividades')->nullable();
            $table->timestamps();
            $table->foreignId('created_by')->nullable()->constrained('usuario')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('usuario')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('convenio');
    }
};
