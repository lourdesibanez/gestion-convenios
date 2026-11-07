<?php

namespace Database\Seeders;

class InstrumentoVinculoSeeder extends SeederIdempotente
{
    public function run(): void
    {
        // Se lee "origen <tipo_vinculo> destino". Clave única (origen, destino, tipo).
        $this->guardar(
            'instrumento_vinculo',
            ['id_instrumento_origen', 'id_instrumento_destino', 'tipo_vinculo'],
            ['id_instrumento_origen', 'id_instrumento_destino', 'tipo_vinculo', 'created_at', 'created_by'],
            [
                [6, 1, 'modifica', self::ALTA, 1],
                [4, 2, 'deriva_de', self::ALTA, 1],
                [10, 5, 'modifica', self::ALTA, 1],
                [3, 14, 'renueva', self::ALTA, 1],
            ],
        );
    }
}
