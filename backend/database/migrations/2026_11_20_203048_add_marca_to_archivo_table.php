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
        Schema::table('archivo', function (Blueprint $table) {
            // Desde dónde se subió: 'web' o 'app_movil'
            $table->string('origen', 20)->default('web')->after('ruta');
            // Cuándo la API escribió la marca en los metadatos (null = sin marca)
            $table->timestamp('sellado_en')->nullable()->after('origen');
            // Hash del PDF tal como llegó; hash_sha256 pasa a ser el del PDF ya marcado
            $table->char('hash_original', 64)->nullable()->after('hash_sha256');
        });
    }

    public function down(): void
    {
        Schema::table('archivo', function (Blueprint $table) {
            $table->dropColumn(['origen', 'sellado_en', 'hash_original']);
        });
    }

};
