<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CatalogoSeeder extends Seeder
{
    /**
     * Catálogos base definidos por el TP.
     */
    public function run(): void
    {
        $ahora = now();

        DB::table('tipo_instrumento')->insert(array_map(fn ($t) => $t + ['created_at' => $ahora, 'updated_at' => $ahora], [
            ['nombre' => 'Convenio marco de colaboración', 'ambito' => 'colaboracion', 'categoria' => 'marco'],
            ['nombre' => 'Convenio específico de colaboración', 'ambito' => 'colaboracion', 'categoria' => 'especifico'],
            ['nombre' => 'Convenio marco de pasantía', 'ambito' => 'pasantia', 'categoria' => 'marco'],
            ['nombre' => 'Convenio específico de pasantía', 'ambito' => 'pasantia', 'categoria' => 'especifico'],
            ['nombre' => 'Adenda', 'ambito' => null, 'categoria' => 'adenda'],
        ]));

        DB::table('estado')->insert(array_map(fn ($nombre) => ['nombre' => $nombre, 'created_at' => $ahora, 'updated_at' => $ahora], [
            'borrador', 'revision', 'aprobado', 'firmado', 'rescindido', 'archivado',
        ]));
    }
}
