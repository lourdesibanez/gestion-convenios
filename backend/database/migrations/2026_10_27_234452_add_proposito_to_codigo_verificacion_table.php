<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('codigo_verificacion', function (Blueprint $table) {
            // login | reset: un código solo sirve para lo que fue pedido.
            $table->string('proposito')->default('login')->after('canal');
        });
    }

    public function down(): void
    {
        Schema::table('codigo_verificacion', function (Blueprint $table) {
            $table->dropColumn('proposito');
        });
    }
};
