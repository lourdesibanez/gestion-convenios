<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Base de los seeders: se pueden correr muchas veces sin duplicar filas.
 * Cada fila se identifica por su clave (PK o clave única): si ya existe se
 * actualiza y si no, se inserta (upsert).
 */
abstract class SeederIdempotente extends Seeder
{
    /** Fecha en que se generaron los datos ficticios. */
    protected const ALTA = '2026-11-01 03:21:10';

    /** Hash de "password" (contraseña de todos los usuarios de prueba). */
    protected const PASSWORD = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

    /**
     * @param  string[]  $clave  columnas que identifican la fila
     * @param  string[]  $columnas  nombres de las columnas, en el orden de cada fila
     * @param  array[]  $filas  valores posicionales
     * @param  string[]  $sinActualizar  columnas que solo se cargan al insertar
     */
    protected function guardar(string $tabla, array $clave, array $columnas, array $filas, array $sinActualizar = []): void
    {
        $filas = array_map(fn (array $fila) => array_combine($columnas, $fila), $filas);
        $actualizar = array_values(array_diff($columnas, $clave, $sinActualizar));

        foreach (array_chunk($filas, 100) as $lote) {
            $actualizar === []
                ? DB::table($tabla)->insertOrIgnore($lote)
                : DB::table($tabla)->upsert($lote, $clave, $actualizar);
        }
    }
}
