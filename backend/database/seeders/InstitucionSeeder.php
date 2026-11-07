<?php

namespace Database\Seeders;

class InstitucionSeeder extends SeederIdempotente
{
    public function run(): void
    {
        $alta = '2026-11-01 03:20:58';
        $edicion = '2026-11-02 12:00:00';

        $this->guardar(
            'institucion',
            ['id'],
            ['id', 'nombre', 'identificacion_fiscal', 'domicilio', 'id_representante', 'es_interna', 'latitud', 'longitud', 'created_at', 'updated_at', 'created_by', 'updated_by'],
            [
                [1, 'Universidad Nacional de La Pampa (demo)', '30-00000001-0', 'Av. Uruguay 151, Santa Rosa, La Pampa', 1, true, -36.618, -64.287, $alta, $edicion, null, 1],
                [2, 'Secretaría Legal y Técnica', '30-00000002-0', 'Coronel Gil 353, Santa Rosa, La Pampa', 2, true, -36.62, -64.29, $alta, $edicion, null, 1],
                [3, 'Facultad de Agronomía', '30-00000003-0', 'Ruta Nacional 35 km 334, Santa Rosa, La Pampa', 3, true, -36.55, -64.30, $alta, $edicion, null, 1],
                [4, 'Facultad de Ingeniería', '30-00000004-0', 'Calle 110 esq. 9, General Pico, La Pampa', 4, true, -35.66, -63.76, $alta, $edicion, null, 1],
                [5, 'Acme S.A.', '30-10000000-9', 'Calle 15 N° 880, General Pico, La Pampa', 5, false, -35.661, -63.757, $alta, $edicion, null, 1],
                [6, 'Municipalidad de Ejemplo', '30-10000001-9', 'Calle 22 N° 1100, Municipalidad de Ejemplo, La Pampa', 6, false, -35.664, -63.761, $alta, $edicion, null, 1],
                [7, 'Fundación Demo', '30-10000002-9', 'Calle 13 N° 420, General Pico, La Pampa', 7, false, -35.658, -63.755, $alta, $edicion, null, 1],
                [8, 'Colegio de Ingenieros Ficticio', '30-10000003-9', 'Calle 17 N° 555, General Pico, La Pampa', 8, false, -35.662, -63.764, $alta, $edicion, null, 1],
                [9, 'Cooperativa Agrícola Demo', '30-10000004-9', 'Ruta Provincial 1 km 12, General Pico, La Pampa', 9, false, -35.67, -63.73, $alta, null, 1, null],
                [10, 'Cámara de Comercio Ficticia', '30-10000005-9', 'Calle 20 N° 745, General Pico, La Pampa', 10, false, -35.659, -63.758, $alta, null, 1, null],
                [11, 'Instituto Tecnológico Muestra', '30-10000006-9', 'Av. San Martín 310, Santa Rosa, La Pampa', 11, false, -36.617, -64.283, $alta, null, 1, null],
            ],
        );
    }
}
