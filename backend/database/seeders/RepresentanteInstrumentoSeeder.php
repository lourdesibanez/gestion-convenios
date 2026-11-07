<?php

namespace Database\Seeders;

class RepresentanteInstrumentoSeeder extends SeederIdempotente
{
    public function run(): void
    {
        // [id, representante, instrumento, rol, inicio, fin, autor]
        $filas = [
            [1, 2, 1, 'firmante', '2026-07-04', '2029-04-19', 1],
            [2, 6, 1, 'firmante', '2026-07-04', '2029-04-19', 1],
            [3, 2, 2, 'firmante', '2025-09-27', '2027-09-27', 1],
            [4, 5, 2, 'firmante', '2025-09-27', '2027-09-27', 1],
            [5, 2, 3, 'firmante', '2026-09-02', '2026-11-21', 1],
            [6, 7, 3, 'firmante', '2026-09-02', '2026-11-21', 1],
            [7, 2, 4, 'firmante', '2026-10-02', '2027-05-20', 1],
            [8, 5, 4, 'firmante', '2026-10-02', '2027-05-20', 1],
            [9, 2, 5, 'firmante', '2026-04-15', null, 1],
            [10, 8, 5, 'firmante', '2026-04-15', null, 1],
            [11, 2, 6, 'firmante', '2026-10-22', '2029-04-19', 1],
            [12, 6, 6, 'firmante', '2026-10-22', '2029-04-19', 1],
            [13, 2, 7, 'firmante', '2026-01-05', '2026-10-17', 1],
            [14, 6, 7, 'firmante', '2026-01-05', '2026-10-17', 1],
            [15, 2, 8, 'firmante', '2026-08-03', '2027-08-28', 1],
            [16, 7, 8, 'firmante', '2026-08-03', '2027-08-28', 1],
            [17, 2, 9, 'firmante', null, null, 1],
            [18, 8, 9, 'firmante', null, null, 1],
            [19, 2, 10, 'firmante', null, null, 1],
            [20, 8, 10, 'firmante', null, null, 1],
            [21, 2, 11, 'firmante', null, null, 1],
            [22, 7, 11, 'firmante', null, null, 1],
            [23, 2, 12, 'firmante', null, null, 1],
            [24, 5, 12, 'firmante', null, null, 1],
            [25, 2, 13, 'firmante', null, null, 1],
            [26, 6, 13, 'firmante', null, null, 1],
            [27, 2, 14, 'firmante', '2024-12-01', '2026-01-05', 1],
            [28, 7, 14, 'firmante', '2024-12-01', '2026-01-05', 1],
            [29, 3, 15, 'firmante', '2026-10-17', '2027-11-01', 8],
            [30, 9, 15, 'firmante', '2026-10-17', '2027-11-01', 8],
            [31, 1, 16, 'firmante', null, null, 7],
            [32, 10, 16, 'firmante', null, null, 7],
            [33, 18, 4, 'tutor_institucional', '2026-10-02', '2027-05-20', 1],
            [34, 19, 4, 'tutor_organizacion', '2026-10-02', '2027-05-20', 1],
            [35, 12, 4, 'pasante', '2026-10-02', '2027-05-20', 1],
            [36, 13, 4, 'pasante', '2026-10-02', '2027-05-20', 1],
            [37, 18, 8, 'tutor_institucional', '2026-08-03', '2027-08-28', 1],
            [38, 20, 8, 'tutor_organizacion', '2026-08-03', '2027-08-28', 1],
            [39, 14, 8, 'pasante', '2026-08-03', '2027-08-28', 1],
            [40, 18, 9, 'tutor_institucional', null, null, 1],
            [41, 21, 9, 'tutor_organizacion', null, null, 1],
            [42, 15, 9, 'pasante', null, null, 1],
            [43, 18, 15, 'tutor_institucional', '2026-10-17', '2027-11-01', 8],
            [44, 22, 15, 'tutor_organizacion', '2026-10-17', '2027-11-01', 8],
            [45, 16, 15, 'pasante', '2026-10-17', '2027-11-01', 8],
            [46, 17, 15, 'pasante', '2026-10-17', '2027-11-01', 8],
        ];

        $this->guardar(
            'representante_instrumento',
            ['id'],
            ['id', 'id_representante', 'id_instrumento', 'rol', 'fecha_inicio', 'fecha_fin', 'created_by', 'created_at'],
            array_map(fn ($f) => [...$f, self::ALTA], $filas),
        );
    }
}
