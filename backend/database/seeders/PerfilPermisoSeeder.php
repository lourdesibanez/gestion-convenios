<?php

namespace Database\Seeders;

class PerfilPermisoSeeder extends SeederIdempotente
{
    public function run(): void
    {
        // id_perfil => ids de permiso (ver PermisoSeeder).
        $asignaciones = [
            1 => array_keys(PermisoSeeder::PERMISOS), // administracion: todos
            2 => [1, 2, 3, 5, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 20, 21, 22], // gestion
            3 => [1, 6, 12, 13, 14, 21, 22], // revision
            4 => [1, 20, 21, 22], // consulta
        ];

        $filas = [];
        foreach ($asignaciones as $perfil => $permisos) {
            foreach ($permisos as $permiso) {
                $filas[] = [$perfil, $permiso];
            }
        }

        $this->guardar('perfil_permiso', ['id_perfil', 'id_permiso'], ['id_perfil', 'id_permiso'], $filas);
    }
}
