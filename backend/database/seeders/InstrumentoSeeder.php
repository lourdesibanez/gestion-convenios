<?php

namespace Database\Seeders;

use Illuminate\Support\Str;

class InstrumentoSeeder extends SeederIdempotente
{
    public function run(): void
    {
        $edicion = '2026-11-02 12:00:00';

        // Tipos: 1 marco colab, 2 específico colab, 3 marco pasantía, 4 específico pasantía, 5 adenda.
        // Estados: 1 borrador, 2 revision, 3 aprobado, 4 firmado, 5 rescindido, 6 archivado.
        // [id, código, título, tipo, unidad, estado, fecha firma/inicio, fecha fin, preaviso, resolución, expediente, notas, autor]
        $instrumentos = [
            [1, 'CM-2026-0001', 'Marco de colaboración · Municipalidad de Ejemplo', 1, 2, 4, '2026-07-04', '2029-04-19', '2029-02-18', 'RES-CD-0107/2026', 'EXP-2026-03013', 'Convenio marco con la Municipalidad. Base para futuros específicos y adendas.', 1],
            [2, 'CM-2025-0031', 'Marco de pasantías · Acme S.A.', 3, 2, 4, '2025-09-27', '2027-09-27', '2027-07-29', 'RES-CD-0114/2025', 'EXP-2025-03026', null, 1],
            [3, 'CE-2026-0090', 'Específico de colaboración · Fundación Demo', 2, 2, 4, '2026-09-02', '2026-11-21', '2026-09-22', 'RES-CD-0121/2026', 'EXP-2026-03039', 'Renueva el convenio específico 2024. Próximo a vencer: evaluar renovación.', 1],
            [4, 'CE-2026-0101', 'Específico de pasantías · Acme S.A.', 4, 2, 4, '2026-10-02', '2027-05-20', '2027-03-21', 'RES-CD-0128/2026', 'EXP-2026-03052', null, 1],
            [5, 'CE-2026-0077', 'Específico de colaboración · Colegio de Ingenieros', 2, 2, 4, '2026-04-15', null, null, 'RES-CD-0135/2026', 'EXP-2026-03065', null, 1],
            [6, 'AD-2026-0012', 'Adenda I · Marco Municipalidad de Ejemplo', 5, 2, 4, '2026-10-22', '2029-04-19', '2029-02-18', 'RES-CD-0142/2026', 'EXP-2026-03078', null, 1],
            [7, 'CE-2025-0050', 'Específico de colaboración · Municipalidad de Ejemplo', 2, 2, 4, '2026-01-05', '2026-10-17', '2026-08-18', 'RES-CD-0149/2026', 'EXP-2026-03091', 'Convenio vencido el 17/10/2026. Pendiente decidir renovación o archivo.', 1],
            [8, 'CE-2026-0060', 'Específico de pasantías · Fundación Demo', 4, 2, 5, '2026-08-03', '2027-08-28', '2027-06-29', 'RES-CD-0156/2026', 'EXP-2026-03104', 'Rescindido por mutuo acuerdo. La Fundación discontinuó el programa de pasantías.', 1],
            [9, 'CE-2026-0142', 'Específico de pasantías · Colegio de Ingenieros', 4, 2, 3, null, null, null, 'RES-CD-0163/2026', 'EXP-2026-03117', 'Aprobado. Pendiente de firma de las partes.', 1],
            [10, 'AD-2026-0021', 'Adenda I · Colegio de Ingenieros', 5, 2, 3, null, null, null, 'RES-CD-0170/2026', 'EXP-2026-03130', null, 1],
            [11, 'CM-2026-0040', 'Renovación marco · Fundación Demo', 1, 2, 3, null, null, null, 'RES-CD-0177/2026', 'EXP-2026-03143', null, 1],
            [12, 'CE-2026-0150', 'Específico de colaboración · Acme S.A.', 2, 2, 2, null, null, null, null, 'EXP-2026-03156', 'En revisión legal. Hay observaciones pendientes de respuesta.', 1],
            [13, 'CE-2026-0155', 'Específico de pasantías · Municipalidad de Ejemplo', 4, 2, 1, null, null, null, null, 'EXP-2026-03169', 'Borrador inicial. Falta definir responsables y cupo de pasantes.', 1],
            [14, 'CE-2024-0010', 'Específico de colaboración · Fundación Demo (2024)', 2, 2, 6, '2024-12-01', '2026-01-05', '2025-11-06', 'RES-CD-0198/2024', 'EXP-2024-03182', null, 1],
            // De otras unidades: el usuario test no los ve.
            [15, 'CE-2026-0200', 'Específico de pasantías · Agronomía', 4, 3, 4, '2026-10-17', '2027-11-01', '2027-09-02', 'RES-CD-0205/2026', 'EXP-2026-03195', 'Primer convenio de pasantías de la Facultad con la Cooperativa Agrícola Demo.', 8],
            [16, 'CE-2026-0201', 'Específico de colaboración · Agronomía', 2, 1, 1, null, null, null, null, 'EXP-2026-03208', null, 7],
        ];

        $filas = array_map(fn ($i) => [
            $i[0], (string) Str::uuid(), $i[1], $i[2], $i[3], $i[4], $i[5],
            $i[6], $i[7], $i[6], $i[8], $i[9], $i[10], $i[11],
            self::ALTA, $edicion, $i[12], $i[12],
        ], $instrumentos);

        $this->guardar('instrumento', ['id'], [
            'id', 'uuid', 'codigo', 'titulo', 'id_tipo_instrumento', 'id_institucion', 'id_estado',
            'fecha_inicio', 'fecha_fin', 'fecha_firma', 'fecha_preaviso', 'numero_resolucion', 'referencia_expediente', 'notas',
            'created_at', 'updated_at', 'created_by', 'updated_by',
        ], $filas, sinActualizar: ['uuid']); // el uuid (QR) no cambia entre corridas
    }
}
