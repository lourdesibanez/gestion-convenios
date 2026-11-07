<?php

namespace Database\Seeders;

class PasantiaSeeder extends SeederIdempotente
{
    public function run(): void
    {
        $demo = 'Aseguradora Demo Seguros S.A.';
        $ficticios = 'Seguros Ficticios La Pampa';

        // [id, representante_instrumento (pasante), carrera, carga horaria, asignación, seguro, autor]
        $filas = [
            [1, 35, 'Licenciatura en Ciencias de la Computación', 120, 185000.0, "{$demo} · Póliza AP-004512 · Accidentes personales", 1],
            [2, 36, 'Ingeniería en Sistemas', 120, 185000.0, "{$demo} · Póliza AP-004513 · Accidentes personales", 1],
            [3, 39, 'Licenciatura en Administración', 200, 150000.0, "{$ficticios} · Póliza SF-100231 · Accidentes personales", 1],
            [4, 42, 'Ingeniería Civil', 160, 170000.0, "{$ficticios} · Póliza SF-100877 · Accidentes personales", 1],
            [5, 45, 'Ingeniería en Recursos Naturales y Medio Ambiente', 240, 200000.0, "{$demo} · Póliza AP-005120 · Accidentes personales y ART", 8],
            [6, 46, 'Ingeniería Agronómica', 240, 200000.0, "{$demo} · Póliza AP-005121 · Accidentes personales y ART", 8],
        ];

        $this->guardar(
            'pasantia',
            ['id'],
            ['id', 'id_representante_instrumento', 'carrera', 'carga_horaria', 'asignacion', 'datos_seguro', 'created_by', 'created_at'],
            array_map(fn ($f) => [...$f, self::ALTA], $filas),
        );
    }
}
