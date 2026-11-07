<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Catálogos base definidos por el TP (se cargan en todos los entornos).
 */
class CatalogoSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            TipoInstrumentoSeeder::class,
            EstadoSeeder::class,
            PerfilSeeder::class,
            PermisoSeeder::class,
            PerfilPermisoSeeder::class,
        ]);
    }
}
