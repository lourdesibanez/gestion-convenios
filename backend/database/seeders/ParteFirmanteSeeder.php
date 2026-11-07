<?php

namespace Database\Seeders;

class ParteFirmanteSeeder extends SeederIdempotente
{
    public function run(): void
    {
        // id_instrumento => [instituciones firmantes, fecha de firma, autor]
        $partes = [
            1 => [[2, 6], '2026-07-04', 1],
            2 => [[2, 5], '2025-09-27', 1],
            3 => [[2, 7], '2026-09-02', 1],
            4 => [[2, 5], '2026-10-02', 1],
            5 => [[2, 8], '2026-04-15', 1],
            6 => [[2, 6], '2026-10-22', 1],
            7 => [[2, 6], '2026-01-05', 1],
            8 => [[2, 7], '2026-08-03', 1],
            9 => [[2, 8], null, 1],
            10 => [[2, 8], null, 1],
            11 => [[2, 7], null, 1],
            12 => [[2, 5], null, 1],
            13 => [[2, 6], null, 1],
            14 => [[2, 7], '2024-12-01', 1],
            15 => [[3, 9], '2026-10-17', 8],
            16 => [[1, 10], null, 7],
        ];

        $filas = [];
        foreach ($partes as $instrumento => [$instituciones, $fecha, $autor]) {
            foreach ($instituciones as $institucion) {
                $filas[] = [$institucion, $instrumento, $fecha, self::ALTA, $autor];
            }
        }

        // Clave única (institución, instrumento).
        $this->guardar('parte_firmante', ['id_institucion', 'id_instrumento'], ['id_institucion', 'id_instrumento', 'fecha_firma', 'created_at', 'created_by'], $filas);
    }
}
