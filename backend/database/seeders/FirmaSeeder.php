<?php

namespace Database\Seeders;

class FirmaSeeder extends SeederIdempotente
{
    public function run(): void
    {
        // [id, instrumento, usuario, firmado en (null = pendiente), latitud, longitud, imagen, hash del PDF, fecha]
        $this->guardar('firma', ['id'], [
            'id', 'id_instrumento', 'id_usuario', 'firmado_en', 'latitud', 'longitud',
            'ruta_imagen_firma', 'hash_documento', 'created_at', 'created_by',
        ], array_map(fn ($f) => [...$f, $f[3] ? $f[2] : null], [
            // Pendientes de firma del usuario test ("Mis pendientes").
            [1, 9, 1, null, null, null, null, null, '2026-11-01 01:21:10'],
            [2, 10, 1, null, null, null, null, null, '2026-10-31 03:21:10'],
            [3, 11, 1, null, null, null, null, null, '2026-10-29 03:21:10'],
            // Firmas realizadas.
            [4, 1, 1, '2026-07-04 10:00:00', -36.617915, -64.2893776, 'firmas/CM-2026-0001_usuario1.png', '65803b2941a2a830b2266512eba5da92b0f62deee5982ac5875d9b024c070d42', '2026-07-04 10:00:00'],
            [5, 2, 1, '2025-09-27 10:00:00', -36.6181572, -64.2886216, 'firmas/CM-2025-0031_usuario1.png', '99ce327aaff7f0d7b31e16367f089039f2d798c7a5ab70df82fe2e023886def4', '2025-09-27 10:00:00'],
            [6, 3, 1, '2026-09-02 10:00:00', -36.6197826, -64.2871613, 'firmas/CE-2026-0090_usuario1.png', 'cbb13aea067e1bdc028771e0a7692e0e5ebd715f405e03b21a6ee4b1f0caeb8f', '2026-09-02 10:00:00'],
            [7, 4, 1, '2026-10-02 03:21:00', -36.6207288, -64.2896878, 'firmas/CE-2026-0101_usuario1.png', '586d67e93ece9e1ef26b606c081105d0e6c104f69a012fe6926103bab1b3f9ca', '2026-10-02 03:21:00'],
            [8, 5, 1, '2026-04-15 10:00:00', -36.6180236, -64.2892889, 'firmas/CE-2026-0077_usuario1.png', 'ef185e889a42b7c5ab5ddd059d342671bcc7b354e5ade3fc601ce4897db31e56', '2026-04-15 10:00:00'],
            [9, 6, 1, '2026-10-22 03:21:00', -36.6178298, -64.2895359, 'firmas/AD-2026-0012_usuario1.png', '21c6958b53a2ea615e228fa144d6221e1b5b77a8fc061715501f9f65df54890c', '2026-10-22 03:21:00'],
            [10, 7, 1, '2026-01-05 10:00:00', -36.6187726, -64.2927251, 'firmas/CE-2025-0050_usuario1.png', 'ee53f40a7cd52ca7a590f34eecbcaeeee3e2abafd8124aeb249d262c717c7aa9', '2026-01-05 10:00:00'],
            [11, 8, 1, '2026-08-03 10:00:00', -36.6216326, -64.2912637, 'firmas/CE-2026-0060_usuario1.png', 'af5803b864d2c4214f580c845b8225707ee22e51f5586f82a7495c44c9340c8b', '2026-08-03 10:00:00'],
            [12, 14, 1, '2024-12-01 10:00:00', -36.6225212, -64.2916033, 'firmas/CE-2024-0010_usuario1.png', '46af54af9fbe67b6ae39380c6755074fb2d192c8a193bcebb1e62863f8a9db94', '2024-12-01 10:00:00'],
            [13, 15, 8, '2026-10-17 10:00:00', -36.552394, -64.2913322, 'firmas/CE-2026-0200_usuario8.png', '87d214635b266f3dc11c723639eb9dbd73332d393cb380b5b4cae6d4468159a7', '2026-10-17 10:00:00'],
        ]));
    }
}
