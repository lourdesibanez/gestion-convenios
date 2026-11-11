<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;

class PerfilPermisoSeeder extends SeederIdempotente
{
    public function run(): void
    {
        // id_perfil => ids de permiso (ver PermisoSeeder).
        $asignaciones = [
            1 => array_keys(PermisoSeeder::PERMISOS), // administracion: todos
            2 => [1, 2, 3, 5, 7, 10, 12, 15, 20, 21, 22, 23, 24], // gestion
            3 => [1, 6, 12, 14, 20, 21, 22, 24], // revision
            4 => [1, 12, 20, 21, 22], // consulta
        ];

        $filas = [];
        foreach ($asignaciones as $perfil => $permisos) {
            DB::table('perfil_permiso')
                ->where('id_perfil', $perfil)
                ->whereNotIn('id_permiso', $permisos)
                ->delete();

            foreach ($permisos as $permiso) {
                $filas[] = [$perfil, $permiso];
            }
        }

        $this->guardar('perfil_permiso', ['id_perfil', 'id_permiso'], ['id_perfil', 'id_permiso'], $filas);
    }
}
