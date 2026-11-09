<?php

namespace App\Policies;

use App\Models\Usuario;

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
}
