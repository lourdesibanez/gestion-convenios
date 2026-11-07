<?php

namespace Database\Seeders;

class CodigoVerificacionSeeder extends SeederIdempotente
{
    public function run(): void
    {
        // [id, usuario, hash del código, canal, propósito, expira, usado, fecha]
        $this->guardar('codigo_verificacion', ['id'], ['id', 'id_usuario', 'hash', 'canal', 'proposito', 'expira_en', 'usado_en', 'created_at'], [
            [1, 1, '212780a5d0e114750635c96672f3424d3a0e68267f7912067c23a54d8814bd76', 'email', 'login', '2026-11-02 09:00:00', '2026-11-02 09:03:00', '2026-11-02 08:55:00'],
            [2, 1, '4ea527c7fb3a0c85adfd9968c90dd6493ac43e39d3e8b7bffb59aec4846914ca', 'sms', 'firma', '2026-11-02 09:20:00', null, '2026-11-02 09:10:00'],
            [3, 7, 'f73d4a4396eea04c4d9ca5996c178f47dd771783523111dea8239c17a0e159b7', 'email', 'login', '2026-10-30 10:15:00', '2026-10-30 10:10:00', '2026-10-30 10:05:00'],
            [4, 8, '89b58b82761b67a08b84584ff989001722a5e0561becea5556b524ed2bcdd421', 'sms', 'firma', '2026-10-17 12:35:00', '2026-10-17 12:30:00', '2026-10-17 12:25:00'],
            [5, 10, 'c988608614c95c26fbe1dcc5fff2250310c7b18c08098acbd3e118e3eadf15d7', 'email', 'login', '2026-10-29 18:00:00', null, '2026-10-29 17:45:00'],
            [6, 9, '2ef5d8086caf6e5d8d52da49314730172b6041679bd9f99aed77ae645c3cc01f', 'email', 'recuperacion', '2026-10-28 16:00:00', '2026-10-28 15:50:00', '2026-10-28 15:40:00'],
        ]);
    }
}
