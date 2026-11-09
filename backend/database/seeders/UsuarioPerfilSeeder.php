<?php

namespace Database\Seeders;

class UsuarioPerfilSeeder extends SeederIdempotente
{
    public function run(): void
    {
        // [id, usuario, perfil, institución (null = alcance global), creado por]
        $this->guardar('usuario_perfil', ['id'], ['id', 'id_usuario', 'id_perfil', 'id_institucion', 'created_by', 'created_at'], array_map(
            fn ($f) => [...$f, self::ALTA],
            [
                [1, 1, 2, 2, null], // test: gestión en Secretaría Legal y Técnica
                [2, 7, 1, 1, 1],
                [3, 8, 2, 3, 1],
                [4, 9, 2, 4, 1],
                [5, 10, 3, 2, 1],
                [6, 11, 3, 1, 1],
                [7, 12, 4, null, 1],
                [8, 3, 4, null, 1],
                [9, 1, 3, 2, 1],
                [10, 2, 2, 2, 1],
                [11, 2, 3, 2, 1],
            ],
        ));
    }
}
