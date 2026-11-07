<?php

namespace Database\Seeders;

class UsuarioInstrumentoSeeder extends SeederIdempotente
{
    public function run(): void
    {
        // Últimos movimientos del usuario test: [id, instrumento, acción, fecha].
        $this->guardar('usuario_instrumento', ['id'], ['id', 'id_usuario', 'id_instrumento', 'accion', 'created_at'], array_map(
            fn ($f) => [$f[0], 1, $f[1], $f[2], $f[3]],
            [
                [1, 9, 'aprobacion', '2026-11-01 01:21:10'],
                [2, 13, 'creacion', '2026-10-31 22:21:10'],
                [3, 12, 'envio_revision', '2026-10-31 07:21:10'],
                [4, 10, 'aprobacion', '2026-10-31 03:21:10'],
                [5, 11, 'aprobacion', '2026-10-29 03:21:10'],
                [6, 6, 'firma', '2026-10-22 03:21:10'],
                [7, 4, 'firma', '2026-10-02 03:21:10'],
                [8, 8, 'rescision', '2026-09-20 11:21:10'],
            ],
        ));
    }
}
