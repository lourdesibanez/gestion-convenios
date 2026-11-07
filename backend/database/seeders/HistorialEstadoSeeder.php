<?php

namespace Database\Seeders;

class HistorialEstadoSeeder extends SeederIdempotente
{
    public function run(): void
    {
        $alta = 'Alta del instrumento en el sistema.';
        $envio = 'Enviado a revisión legal.';
        $aprobado = 'Aprobado por la Secretaría Legal y Técnica.';
        $firmado = 'Firmado por las partes.';

        // Estados: 1 borrador, 2 revision, 3 aprobado, 4 firmado, 5 rescindido, 6 archivado.
        // [instrumento, estado anterior, estado nuevo, usuario, fundamento, fecha]
        $cambios = [
            [1, null, 1, 1, $alta, '2026-06-13 09:00:00'],
            [1, 1, 2, 1, $envio, '2026-06-20 11:30:00'],
            [1, 2, 3, 7, $aprobado, '2026-06-29 16:00:00'],
            [1, 3, 4, 1, $firmado, '2026-07-04 10:00:00'],
            [2, null, 1, 1, $alta, '2025-09-06 09:00:00'],
            [2, 1, 2, 1, $envio, '2025-09-13 11:30:00'],
            [2, 2, 3, 7, $aprobado, '2025-09-22 16:00:00'],
            [2, 3, 4, 1, $firmado, '2025-09-27 10:00:00'],
            [3, null, 1, 1, $alta, '2026-08-12 09:00:00'],
            [3, 1, 2, 1, $envio, '2026-08-19 11:30:00'],
            [3, 2, 3, 7, $aprobado, '2026-08-28 16:00:00'],
            [3, 3, 4, 1, $firmado, '2026-09-02 10:00:00'],
            [4, null, 1, 1, $alta, '2026-09-11 09:00:00'],
            [4, 1, 2, 1, $envio, '2026-09-18 11:30:00'],
            [4, 2, 3, 7, $aprobado, '2026-09-27 16:00:00'],
            [4, 3, 4, 1, $firmado, '2026-10-02 03:21:00'],
            [5, null, 1, 1, $alta, '2026-03-25 09:00:00'],
            [5, 1, 2, 1, $envio, '2026-04-01 11:30:00'],
            [5, 2, 3, 7, $aprobado, '2026-04-10 16:00:00'],
            [5, 3, 4, 1, $firmado, '2026-04-15 10:00:00'],
            [6, null, 1, 1, $alta, '2026-10-01 09:00:00'],
            [6, 1, 2, 1, $envio, '2026-10-08 11:30:00'],
            [6, 2, 3, 7, $aprobado, '2026-10-17 16:00:00'],
            [6, 3, 4, 1, $firmado, '2026-10-22 03:21:00'],
            [7, null, 1, 1, $alta, '2025-12-15 09:00:00'],
            [7, 1, 2, 1, $envio, '2025-12-22 11:30:00'],
            [7, 2, 3, 7, $aprobado, '2025-12-31 16:00:00'],
            [7, 3, 4, 1, $firmado, '2026-01-05 10:00:00'],
            [8, null, 1, 1, $alta, '2026-07-13 09:00:00'],
            [8, 1, 2, 1, $envio, '2026-07-20 11:30:00'],
            [8, 2, 3, 7, $aprobado, '2026-07-29 16:00:00'],
            [8, 3, 4, 1, $firmado, '2026-08-03 10:00:00'],
            [8, 4, 5, 1, 'Rescisión por mutuo acuerdo: la Fundación Demo discontinuó el programa de pasantías.', '2026-09-20 11:21:00'],
            [9, null, 1, 1, $alta, '2026-10-12 10:00:00'],
            [9, 1, 2, 1, $envio, '2026-10-18 10:00:00'],
            [9, 2, 3, 1, $aprobado, '2026-11-01 01:21:00'],
            [10, null, 1, 1, $alta, '2026-10-14 09:30:00'],
            [10, 1, 2, 1, $envio, '2026-10-20 09:30:00'],
            [10, 2, 3, 1, $aprobado, '2026-10-31 03:21:00'],
            [11, null, 1, 1, $alta, '2026-10-15 11:00:00'],
            [11, 1, 2, 1, $envio, '2026-10-21 11:00:00'],
            [11, 2, 3, 1, $aprobado, '2026-10-29 03:21:00'],
            [12, null, 1, 1, $alta, '2026-10-27 10:00:00'],
            [12, 1, 2, 1, $envio, '2026-10-31 07:21:00'],
            [13, null, 1, 1, $alta, '2026-10-31 22:21:00'],
            [14, null, 1, 1, $alta, '2024-11-10 09:00:00'],
            [14, 1, 2, 1, $envio, '2024-11-17 11:30:00'],
            [14, 2, 3, 7, $aprobado, '2024-11-26 16:00:00'],
            [14, 3, 4, 1, $firmado, '2024-12-01 10:00:00'],
            [14, 4, 6, 7, 'Archivado por vencimiento del plazo de vigencia.', '2026-01-12 10:00:00'],
            [15, null, 1, 8, $alta, '2026-09-26 09:00:00'],
            [15, 1, 2, 8, $envio, '2026-10-03 11:30:00'],
            [15, 2, 3, 7, $aprobado, '2026-10-12 16:00:00'],
            [15, 3, 4, 8, $firmado, '2026-10-17 10:00:00'],
            [16, null, 1, 7, $alta, '2026-10-30 14:00:00'],
        ];

        // id fijo = posición en la lista, para que la próxima corrida actualice en vez de duplicar.
        $filas = array_map(fn ($c, $i) => [$i + 1, ...$c], $cambios, array_keys($cambios));

        $this->guardar('historial_estado', ['id'], ['id', 'id_instrumento', 'id_estado_anterior', 'id_estado_nuevo', 'id_usuario', 'fundamento', 'created_at'], $filas);
    }
}
