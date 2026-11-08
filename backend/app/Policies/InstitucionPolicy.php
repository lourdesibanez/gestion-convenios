<?php

namespace App\Policies;

use App\Models\Institucion;
use App\Models\Usuario;

class InstitucionPolicy
{
    public function viewAny(Usuario $usuario): bool
    {
        return $usuario->tienePermiso('institucion.gestionar');
    }

    public function view(Usuario $usuario, Institucion $institucion): bool
    {
        return $usuario->tienePermiso('institucion.gestionar')
            && $this->estaDentroDelAlcance($usuario, $institucion);
    }

    public function create(Usuario $usuario): bool
    {
        return $usuario->tienePermiso('institucion.gestionar');
    }

    public function update(Usuario $usuario, Institucion $institucion): bool
    {
        return $this->view($usuario, $institucion);
    }

    public function delete(Usuario $usuario, Institucion $institucion): bool
    {
        return $this->view($usuario, $institucion);
    }

    private function estaDentroDelAlcance(Usuario $usuario, Institucion $institucion): bool
    {
        $ids = $usuario->institucionesVisibles();

        return $ids === null || in_array($institucion->id, $ids, true);
    }
}
