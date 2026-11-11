<?php

namespace Database\Seeders;

class UsuarioSeeder extends SeederIdempotente
{
    public function run(): void
    {
        $p = self::PASSWORD;
        $alta = '2026-11-01 03:21:10';

        $this->guardar('usuario', ['id'], ['id', 'nombre_usuario', 'nombre', 'apellido', 'contrasena', 'email', 'telefono', 'created_at', 'created_by'], [
            [1, 'lourdesibanez', 'Lourdes', 'Ibañez', $p, 'lourdes.ibanez@ing.unlpam.edu.ar', null, '2026-11-01 03:20:50', null],
            [2, 'marianosalto', 'Mariano', 'Salto', $p, 'mariano.salto@ing.unlpam.edu.ar', null, '2026-11-01 03:20:50', null],
            [3, 'obarskiguillermo', 'Guillermo', 'Obarski', $p, 'guillermo.obarski@ing.unlpam.edu.ar', null, '2026-11-01 03:20:50', null],
            [13, 'admin', 'Admin', 'Administración', $p, 'admin@gmail.com', null, $alta, null],
            [14, 'gestion', 'Gestion', 'Gestión', $p, 'gestion@gmail.com', null, $alta, null],
            [15, 'revision', 'Revision', 'Revisión', $p, 'revision@gmail.com', null, $alta, null],
            [16, 'consulta', 'Consulta', 'Consulta', $p, 'consulta@gmail.com', null, $alta, null],
        ]);
    }
}
