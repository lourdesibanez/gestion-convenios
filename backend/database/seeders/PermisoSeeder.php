<?php

namespace Database\Seeders;

class PermisoSeeder extends SeederIdempotente
{
    public const PERMISOS = [
        1 => 'instrumento.ver',
        2 => 'instrumento.crear',
        3 => 'instrumento.editar',
        4 => 'instrumento.eliminar',
        5 => 'instrumento.enviar_revision',
        6 => 'instrumento.aprobar',
        7 => 'instrumento.firmar',
        8 => 'instrumento.rescindir',
        9 => 'instrumento.archivar',
        10 => 'archivo.subir',
        11 => 'archivo.eliminar',
        12 => 'comentario.crear',
        13 => 'comentario.moderar',
        14 => 'observacion.crear',
        15 => 'observacion.responder',
        16 => 'institucion.gestionar',
        17 => 'representante.gestionar',
        18 => 'usuario.gestionar',
        19 => 'perfil.gestionar',
        20 => 'reporte.ver',
        21 => 'notificacion.ver',
        22 => 'historial.ver',
    ];

    public function run(): void
    {
        $filas = [];
        foreach (self::PERMISOS as $id => $nombre) {
            $filas[] = [$id, $nombre, self::ALTA];
        }

        $this->guardar('permiso', ['id'], ['id', 'nombre', 'created_at'], $filas);
    }
}
