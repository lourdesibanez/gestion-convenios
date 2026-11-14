<?php

namespace App\Policies;

use App\Models\Instrumento;
use App\Models\Usuario;

class InstrumentoPolicy
{
    public function viewAny(Usuario $usuario): bool
    {
        return $usuario->tienePermiso('instrumento.ver');
    }

    public function create(Usuario $usuario): bool
    {
        return $usuario->tienePermiso('instrumento.crear');
    }

    public function view(Usuario $usuario, Instrumento $instrumento): bool
    {
        return $usuario->tienePermiso('instrumento.ver')
            && $this->estaDentroDelAlcance($usuario, $instrumento);
    }

    public function update(Usuario $usuario, Instrumento $instrumento): bool
    {
        return $usuario->tienePermiso('instrumento.editar')
            && (int) $instrumento->created_by === (int) $usuario->id
            && $instrumento->estado?->nombre === 'borrador'
            && $this->estaDentroDelAlcance($usuario, $instrumento);
    }

    public function sendToReview(Usuario $usuario, Instrumento $instrumento): bool
    {
        return $usuario->tienePermiso('instrumento.enviar_revision')
            && (int) $instrumento->created_by === (int) $usuario->id
            && $instrumento->estado?->nombre === 'borrador'
            && $this->estaDentroDelAlcance($usuario, $instrumento);
    }

    public function viewRevision(Usuario $usuario): bool
    {
        return $usuario->tienePermiso('instrumento.aprobar');
    }

    private function estaDentroDelAlcance(Usuario $usuario, Instrumento $instrumento): bool
    {
        $ids = $usuario->institucionesVisibles();

        return $ids === null || in_array($instrumento->id_institucion, $ids, true);
    }
}
