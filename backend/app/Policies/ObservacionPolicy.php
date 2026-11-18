<?php

namespace App\Policies;

use App\Models\Instrumento;
use App\Models\Observacion;
use App\Models\Usuario;

class ObservacionPolicy
{
    public function view(Usuario $usuario, Observacion $observacion): bool
    {
        $instrumento = $observacion->instrumento;

        return $instrumento !== null && (
            $usuario->tienePermiso('instrumento.ver', $instrumento->id_institucion)
            || $usuario->tienePermiso('instrumento.aprobar', $instrumento->id_institucion)
        );
    }

    public function create(Usuario $usuario, Instrumento $instrumento): bool
    {
        return $instrumento->estado?->nombre === 'revision'
            && $usuario->tienePermiso(
                'instrumento.aprobar',
                $instrumento->id_institucion
            );
    }

    public function respond(Usuario $usuario, Observacion $observacion): bool
    {
        $instrumento = $observacion->instrumento;

        return $instrumento !== null
            && $observacion->estado === 'pendiente'
            && $instrumento->estado?->nombre === 'borrador'
            && (int) $instrumento->created_by === (int) $usuario->id
            && $usuario->tienePermiso(
                'instrumento.editar',
                $instrumento->id_institucion
            );
    }

    public function resolve(Usuario $usuario, Observacion $observacion): bool
    {
        $instrumento = $observacion->instrumento;

        return $instrumento !== null
            && $observacion->estado === 'respondida'
            && $instrumento->estado?->nombre === 'revision'
            && $usuario->tienePermiso(
                'instrumento.aprobar',
                $instrumento->id_institucion
            );
    }
}