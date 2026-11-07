<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Todos los seeders son idempotentes (upsert por clave): `php artisan db:seed`
 * se puede correr las veces que haga falta sin duplicar filas.
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(CatalogoSeeder::class);

        // Datos ficticios para ver las pantallas con contenido.
        // El orden respeta las claves foráneas.
        if (app()->environment('local')) {
            $this->call([
                UsuarioSeeder::class,
                RepresentanteSeeder::class,
                InstitucionSeeder::class,
                UsuarioPerfilSeeder::class,
                InstrumentoSeeder::class,
                ConvenioSeeder::class,
                ParteFirmanteSeeder::class,
                RepresentanteInstrumentoSeeder::class,
                PasantiaSeeder::class,
                HistorialEstadoSeeder::class,
                InstrumentoVinculoSeeder::class,
                ArchivoSeeder::class,
                ComentarioSeeder::class,
                ObservacionSeeder::class,
                FirmaSeeder::class,
                CodigoVerificacionSeeder::class,
                NotificacionSeeder::class,
                UsuarioInstrumentoSeeder::class,
            ]);
        }
    }
}
