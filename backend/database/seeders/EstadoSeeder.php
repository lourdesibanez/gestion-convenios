<?php

namespace Database\Seeders;

class EstadoSeeder extends SeederIdempotente
{
    public function run(): void
    {
        $this->guardar('estado', ['id'], ['id', 'nombre', 'created_at'], [
            [1, 'borrador', self::ALTA],
            [2, 'revision', self::ALTA],
            [3, 'aprobado', self::ALTA],
            [4, 'firmado', self::ALTA],
            [5, 'rescindido', self::ALTA],
            [6, 'archivado', self::ALTA],
        ]);
    }
}
