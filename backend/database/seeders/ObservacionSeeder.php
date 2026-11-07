<?php

namespace Database\Seeders;

class ObservacionSeeder extends SeederIdempotente
{
    public function run(): void
    {
        // [id, instrumento, revisor, contenido, estado, respuesta, respondido por, fecha respuesta, fecha resolución, fecha]
        $this->guardar('observacion', ['id'], [
            'id', 'id_instrumento', 'id_usuario', 'contenido', 'estado', 'respuesta',
            'respondido_por', 'fecha_respuesta', 'fecha_resolucion', 'created_at',
        ], [
            [1, 12, 10, 'La cláusula de propiedad intelectual no define la titularidad de los resultados.', 'respondida', 'Se incorporará un apartado específico en la próxima versión.', 1, '2026-11-01 14:10:00', null, '2026-10-31 15:00:00'],
            [2, 12, 10, 'Falta incluir el domicilio legal de Acme S.A.', 'pendiente', null, null, null, null, '2026-10-31 15:10:00'],
            [3, 9, 10, 'Verificar la carga horaria semanal máxima según la normativa de pasantías.', 'resuelta', 'Se ajustó a 20 horas semanales.', 1, '2026-10-25 11:00:00', '2026-10-26 09:00:00', '2026-10-24 10:20:00'],
            [4, 11, 11, 'Aclarar si la renovación es automática o requiere nueva firma.', 'resuelta', 'Se aclaró: requiere firma expresa de ambas partes.', 1, '2026-10-20 10:00:00', '2026-10-21 15:30:00', '2026-10-19 16:00:00'],
            [5, 10, 11, 'Indicar expresamente la cláusula del convenio original que se modifica.', 'respondida', 'Se agregó la referencia a la cláusula tercera.', 1, '2026-10-28 12:00:00', null, '2026-10-27 17:45:00'],
            [6, 13, 11, 'Definir responsables de seguimiento por parte del municipio.', 'pendiente', null, null, null, null, '2026-11-02 08:55:00'],
            [7, 4, 10, 'Confirmar la vigencia de la póliza de seguro de los pasantes.', 'resuelta', 'Póliza vigente hasta 2027, se adjuntó constancia.', 1, '2026-09-25 10:00:00', '2026-09-26 11:00:00', '2026-09-24 09:30:00'],
        ]);
    }
}
