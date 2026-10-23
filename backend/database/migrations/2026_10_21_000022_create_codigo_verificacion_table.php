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
        // Códigos de MFA enviados al usuario (mail, sms o push).
        Schema::create('codigo_verificacion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_usuario')->constrained('usuario')->cascadeOnDelete();
            // Se guarda el hash del código, nunca el código en claro.
            $table->string('hash');
            // mail | sms | push
            $table->string('canal');
            $table->timestamp('expira_en');
            $table->timestamp('usado_en')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('codigo_verificacion');
    }
};
