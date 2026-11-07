<?php

namespace Database\Seeders;

class TipoInstrumentoSeeder extends SeederIdempotente
{
    public function run(): void
    {
        $this->guardar('tipo_instrumento', ['id'], ['id', 'nombre', 'ambito', 'categoria', 'created_at'], [
            [1, 'Convenio marco de colaboración', 'colaboracion', 'marco', self::ALTA],
            [2, 'Convenio específico de colaboración', 'colaboracion', 'especifico', self::ALTA],
            [3, 'Convenio marco de pasantía', 'pasantia', 'marco', self::ALTA],
            [4, 'Convenio específico de pasantía', 'pasantia', 'especifico', self::ALTA],
            [5, 'Adenda', null, 'adenda', self::ALTA],
        ]);
    }
}
