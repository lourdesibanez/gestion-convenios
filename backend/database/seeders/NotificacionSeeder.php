<?php

namespace Database\Seeders;

class NotificacionSeeder extends SeederIdempotente
{
    public function run(): void
    {
        // [id, usuario, tipo, instrumento, mensaje, leído, fecha]
        $this->guardar('notificacion', ['id'], ['id', 'id_usuario', 'tipo', 'id_instrumento', 'mensaje', 'leido', 'created_at'], [
            [1, 1, 'firma_pendiente', 9, 'CE-2026-0142 · Específico de pasantías está listo para firmar.', false, self::ALTA],
            [2, 1, 'revision_asignada', 12, 'CE-2026-0150 · Específico de colaboración pendiente de revisión.', false, self::ALTA],
            [3, 1, 'cambio_estado', 6, 'AD-2026-0012 · Adenda I fue firmada.', true, self::ALTA],
            [4, 3, 'vencimiento_proximo', 3, 'CE-2026-0090 · Específico de colaboración vence el 21/11/2026.', false, '2026-11-01 08:00:00'],
            [5, 8, 'vencimiento_proximo', 3, 'CE-2026-0090 · Específico de colaboración vence el 21/11/2026.', false, '2026-11-01 08:00:00'],
            [6, 1, 'vencimiento_proximo', 7, 'CE-2025-0050 · Convenio vencido el 17/10/2026.', true, '2026-10-18 08:00:00'],
            [7, 1, 'observacion_nueva', 12, 'Nueva observación en CE-2026-0150: falta el domicilio legal.', false, '2026-10-31 15:10:00'],
            [8, 10, 'revision_asignada', 12, 'CE-2026-0150 · Específico de colaboración pendiente de revisión.', true, '2026-10-31 07:21:00'],
            [9, 11, 'revision_asignada', 13, 'CE-2026-0155 · Borrador creado: se solicita revisión.', false, '2026-11-02 08:50:00'],
            [10, 7, 'cambio_estado', 9, 'CE-2026-0142 · Específico de pasantías fue aprobado.', true, '2026-11-01 01:21:00'],
            [11, 1, 'comentario_nuevo', 12, 'Nuevo comentario en CE-2026-0150.', false, '2026-10-31 15:05:00'],
        ]);
    }
}
