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
        Schema::create('institucion', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('identificacion_fiscal')->unique();
            $table->string('domicilio')->nullable();
            $table->foreignId('id_representante')->nullable()->constrained('representante')->nullOnDelete();
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
        Schema::dropIfExists('institucion');
    }
};
