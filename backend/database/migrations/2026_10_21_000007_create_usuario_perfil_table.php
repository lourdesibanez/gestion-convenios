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
        Schema::create('usuario_perfil', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_usuario')->constrained('usuario')->cascadeOnDelete();
            $table->foreignId('id_perfil')->constrained('perfil')->cascadeOnDelete();
            $table->foreignId('id_unidad')->nullable()->constrained('unidad')->nullOnDelete();
            $table->timestamps();
            $table->foreignId('created_by')->nullable()->constrained('usuario')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('usuario')->nullOnDelete();
            $table->timestamp('suspended_at')->nullable();
            $table->foreignId('suspended_by')->nullable()->constrained('usuario')->nullOnDelete();

            $table->unique(['id_usuario', 'id_perfil', 'id_unidad']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuario_perfil');
    }
};
