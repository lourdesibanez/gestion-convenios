<?php

namespace App\Policies;

use App\Models\Usuario;
use App\Models\Instrumento;

class FirmaPolicy
{
    public function verPdfPendiente(Usuario $usuario, int $id_instrumento): bool
    {
        return $usuario->tienePermiso('instrumento.ver')
            && $usuario->firmas()
                ->pendientes()
                ->where('id_instrumento', $id_instrumento)
                ->exists();
    }

    public function registrar(Usuario $usuario, int $id_instrumento): bool
    {
        return $usuario->tienePermiso('instrumento.firmar')
            && $usuario->firmas()
                ->pendientes()
                ->where('id_instrumento', $id_instrumento)
                ->exists();
    }

    public function verDocumentoFirmado(Usuario $usuario, int $id_instrumento): bool
    {
        return $usuario->tienePermiso('instrumento.ver')
        && Instrumento::query()
            ->visiblePara($usuario)
            ->whereKey($id_instrumento)
            ->exists();
    }
}
