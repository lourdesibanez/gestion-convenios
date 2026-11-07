<?php

namespace Database\Seeders;

class ConvenioSeeder extends SeederIdempotente
{
    public function run(): void
    {
        // Textos que se repiten según el tipo de convenio.
        $leyEducacion = 'Ley N° 24.521 de Educación Superior; Estatuto de la universidad y normativa interna de convenios.';
        $leyEspecifico = 'Ley N° 24.521 de Educación Superior; convenio marco vigente y normativa interna de convenios.';
        $leyPasantia = 'Ley N° 26.427 de Sistema de Pasantías Educativas; convenio marco de pasantías y normativa interna.';
        $leyAdenda = 'Código Civil y Comercial de la Nación y normativa interna de convenios de la universidad.';

        $marco = fn (string $objeto, string $renovacion) => [
            $objeto, $leyEducacion,
            'Ambas partes se comprometen a facilitar recursos, información y espacios para el desarrollo de actividades conjuntas, y a designar un responsable de seguimiento.',
            'Cualquiera de las partes podrá rescindir el convenio con un preaviso de 60 días corridos, sin que ello genere derecho a indemnización.',
            $renovacion,
            'Las partes se obligan a mantener la confidencialidad de la información intercambiada, durante la vigencia del convenio y por 2 años posteriores.',
            'Proyectos de investigación, capacitaciones, asistencia técnica y actividades de extensión a definir en convenios específicos.',
        ];

        $especifico = fn (string $unidad, string $contraparte, string $unidadMin) => [
            "Desarrollar un proyecto específico de colaboración entre {$unidad} y {$contraparte}, con objetivos, cronograma y recursos determinados.",
            $leyEspecifico,
            "{$unidadMin} aportará asistencia técnica y equipo de trabajo; {$contraparte}".' aportará información, instalaciones y personal de contraparte.',
            'Por vencimiento del plazo, cumplimiento del objeto o rescisión con 30 días de preaviso por escrito.',
            'Renovación expresa mediante adenda, previa evaluación de resultados.',
            'Los resultados y datos del proyecto serán confidenciales hasta su publicación acordada por ambas partes.',
            'Relevamiento inicial, ejecución de actividades según cronograma e informe final de resultados.',
        ];

        $pasantia = fn (string $unidad, string $organizacion) => [
            "Regular la pasantía educativa de estudiantes de {$unidad} en {$organizacion}, según el plan de actividades acordado.",
            $leyPasantia,
            ucfirst(mb_strtolower($organizacion)).' proveerá tutor, espacio de trabajo y asignación estímulo; el pasante cumplirá la carga horaria y presentará informes de avance.',
            'Finalización del plazo, abandono del pasante, incumplimiento del plan formativo o rescisión de las partes con 15 días de preaviso.',
            'Podrá prorrogarse por única vez, con conformidad del pasante, la organización y la unidad académica.',
            'El pasante se compromete a no divulgar información reservada de la organización.',
            'Tareas acordes a la carrera del pasante, con carga horaria semanal máxima de 20 horas y seguimiento tutorial.',
        ];

        $adenda = fn (string $contraparte) => [
            "Modificar y ampliar las cláusulas del convenio vigente entre la Secretaría Legal y Técnica y {$contraparte}, en lo referido a plazo y alcance de las actividades.",
            $leyAdenda,
            'Las partes mantienen las obligaciones del convenio original en todo lo que no se modifique por esta adenda.',
            null, null, null,
            'Se amplía el alcance de las actividades previstas en el convenio original.',
        ];

        $slt = 'la Secretaría Legal y Técnica';
        $sltMin = 'La secretaría legal y técnica';

        // id_instrumento => [textos, autor]
        $convenios = [
            1 => [$marco('Establecer un marco general de colaboración académica, científica y de transferencia entre la Secretaría Legal y Técnica y la Municipalidad de Ejemplo.', 'Se renovará por períodos iguales si ninguna de las partes manifiesta lo contrario con 60 días de anticipación.'), 1],
            2 => [[
                'Fijar las bases para la realización de pasantías educativas de estudiantes de la Secretaría Legal y Técnica en Acme S.A..',
                'Ley N° 26.427 de Sistema de Pasantías Educativas y normativa interna de pasantías.',
                'Acme s.a. designará tutores y garantizará condiciones de seguridad e higiene; la Secretaría Legal y Técnica designará un docente tutor y verificará el cumplimiento del plan formativo.',
                'Rescisión con 60 días de preaviso. Las pasantías en curso continuarán hasta su finalización.',
                'Renovación automática por períodos de 2 años salvo manifestación en contrario.',
                'El pasante y las partes mantendrán reserva sobre la información de la organización a la que accedan.',
                'Pasantías no rentadas o con asignación estímulo, de carácter formativo y sin relación laboral.',
            ], 1],
            3 => [$especifico($slt, 'la Fundación Demo', $sltMin), 1],
            4 => [$pasantia($slt, 'Acme S.A.'), 1],
            5 => [$especifico($slt, 'el Colegio de Ingenieros Ficticio', $sltMin), 1],
            6 => [$adenda('la Municipalidad de Ejemplo'), 1],
            7 => [$especifico($slt, 'la Municipalidad de Ejemplo', $sltMin), 1],
            8 => [$pasantia($slt, 'la Fundación Demo'), 1],
            9 => [$pasantia($slt, 'el Colegio de Ingenieros Ficticio'), 1],
            10 => [$adenda('el Colegio de Ingenieros Ficticio'), 1],
            11 => [$marco('Renovar el convenio marco de colaboración entre la Secretaría Legal y Técnica y la Fundación Demo, actualizando su alcance y condiciones.', 'Renovación por 3 años; luego renovación automática salvo oposición con 60 días de anticipación.'), 1],
            12 => [$especifico($slt, 'Acme S.A.', $sltMin), 1],
            13 => [$pasantia($slt, 'la Municipalidad de Ejemplo'), 1],
            14 => [$especifico($slt, 'la Fundación Demo', $sltMin), 1],
            15 => [$pasantia('la Facultad de Agronomía', 'la Cooperativa Agrícola Demo'), 8],
            16 => [$especifico('la Universidad Nacional de La Pampa (demo)', 'la Cámara de Comercio Ficticia', 'La universidad nacional de la pampa (demo)'), 7],
        ];

        $filas = [];
        foreach ($convenios as $id => [$textos, $autor]) {
            $filas[] = [$id, ...$textos, self::ALTA, $autor];
        }

        $this->guardar('convenio', ['id_instrumento'], [
            'id_instrumento', 'objeto', 'marco_legal', 'obligaciones', 'condiciones_terminacion',
            'condiciones_renovacion', 'confidencialidad', 'alcance_actividades', 'created_at', 'created_by',
        ], $filas);
    }
}
