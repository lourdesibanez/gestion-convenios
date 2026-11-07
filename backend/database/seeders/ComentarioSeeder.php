<?php

namespace Database\Seeders;

class ComentarioSeeder extends SeederIdempotente
{
    public function run(): void
    {
        // [id, instrumento, autor, comentario, es ofensivo, fecha, borrado, borrado por]
        $this->guardar('comentario', ['id'], ['id', 'id_instrumento', 'id_usuario', 'comentario', 'es_ofensivo', 'created_at', 'deleted_at', 'deleted_by'], [
            [1, 12, 10, 'Revisé el borrador: falta precisar la titularidad de los resultados.', false, '2026-10-31 15:05:00', null, null],
            [2, 12, 1, 'Gracias, subo la versión corregida durante esta semana.', false, '2026-11-01 14:20:00', null, null],
            [3, 12, 1, 'Consulté con Acme y aceptan incorporar la cláusula.', false, '2026-11-02 09:40:00', null, null],
            [4, 9, 10, 'Texto OK. Verifiqué la carga horaria y el seguro de los pasantes.', false, '2026-10-30 16:30:00', null, null],
            [5, 9, 1, 'Queda aprobado. Coordino la firma con el Colegio de Ingenieros.', false, '2026-11-01 01:25:00', null, null],
            [6, 10, 11, 'La adenda queda clara; sugiero indicar la cláusula modificada.', false, '2026-10-31 02:50:00', null, null],
            [7, 11, 1, 'Antes de firmar, confirmar con la Fundación el período de renovación.', false, '2026-10-29 03:30:00', null, null],
            [8, 3, 8, 'Recordatorio: este convenio vence el 21/11. Evaluar renovación.', false, '2026-11-01 10:00:00', null, null],
            [9, 7, 7, 'Convenio vencido. Consultar a la Municipalidad si desean renovarlo.', false, '2026-10-18 09:15:00', null, null],
            [10, 8, 1, 'Se firmó el acta de rescisión. Se notificó a la pasante y su tutora.', false, '2026-09-20 11:40:00', null, null],
            [11, 4, 1, 'Los dos pasantes ya iniciaron actividades en Acme.', false, '2026-10-05 13:00:00', null, null],
            [12, 13, 12, 'Esto es una pérdida de tiempo, quién redactó esta basura.', true, '2026-11-01 18:30:00', '2026-11-01 19:00:00', 7],
            [13, 13, 11, 'Definir cupo de pasantes y responsables antes de enviar a revisión.', false, '2026-11-02 08:50:00', null, null],
            [14, 15, 8, 'Primera firma de la Facultad con la Cooperativa. Archivo cargado.', false, '2026-10-17 12:40:00', null, null],
        ]);
    }
}
