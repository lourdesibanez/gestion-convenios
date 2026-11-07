<?php

namespace Database\Seeders;

class UsuarioSeeder extends SeederIdempotente
{
    public function run(): void
    {
        $p = self::PASSWORD;
        $alta = '2026-11-01 03:21:10';

        $this->guardar('usuario', ['id'], ['id', 'nombre_usuario', 'nombre', 'apellido', 'contrasena', 'email', 'telefono', 'created_at', 'created_by'], [
            [1, 'test', 'Laura', 'Iriarte', $p, 'test@example.com', null, '2026-11-01 03:20:50', null],
            [2, 'pgomez', 'Pablo', 'Gómez', $p, 'pgomez@example.com', null, '2026-11-01 03:20:50', null],
            [3, 'lmartinez', 'Lucía', 'Martínez', $p, 'lmartinez@example.com', null, '2026-11-01 03:20:50', null],
            [4, 'fruiz', 'Federico', 'Ruiz', $p, 'fruiz@example.com', null, '2026-11-01 03:20:50', null],
            [5, 'sacosta', 'Sofía', 'Acosta', $p, 'sacosta@example.com', null, '2026-11-01 03:20:50', null],
            [6, 'nherrera', 'Nicolás', 'Herrera', $p, 'nherrera@example.com', null, '2026-11-01 03:20:50', null],
            [7, 'mgarcia', 'Marina', 'García', $p, 'mgarcia@example.com', '+54 2302 15600007', $alta, 1],
            [8, 'rlopez', 'Roberto', 'López', $p, 'rlopez@example.com', '+54 2302 15600008', $alta, 1],
            [9, 'cfernandez', 'Carolina', 'Fernández', $p, 'cfernandez@example.com', '+54 2302 15600009', $alta, 1],
            [10, 'dsosa', 'Diego', 'Sosa', $p, 'dsosa@example.com', '+54 2302 15600010', $alta, 1],
            [11, 'apereyra', 'Andrea', 'Pereyra', $p, 'apereyra@example.com', '+54 2302 15600011', $alta, 1],
            [12, 'jmolina', 'Julián', 'Molina', $p, 'jmolina@example.com', null, $alta, 1],
        ]);
    }
}
