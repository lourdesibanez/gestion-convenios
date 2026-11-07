<?php

namespace Database\Seeders;

class PerfilSeeder extends SeederIdempotente
{
    public function run(): void
    {
        $this->guardar('perfil', ['id'], ['id', 'nombre', 'created_at'], [
            [1, 'administracion', self::ALTA],
            [2, 'gestion', self::ALTA],
            [3, 'revision', self::ALTA],
            [4, 'consulta', self::ALTA],
        ]);
    }
}
