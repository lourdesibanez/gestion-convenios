<?php

namespace App\Policies;

use App\Models\Representante;
use App\Models\Usuario;

class RepresentantePolicy
{
    public function viewAny(Usuario $usuario): bool
    {
        return $usuario->tienePermiso('representante.ver')
            || $usuario->tienePermiso('representante.gestionar');
    }

    public function view(Usuario $usuario, Representante $representante): bool
    {
        return $usuario->tienePermiso('representante.ver')
            || $usuario->tienePermiso('representante.gestionar');
    }

    public function create(Usuario $usuario): bool
    {
        return $usuario->tienePermiso('representante.gestionar');
    }

    public function update(Usuario $usuario, Representante $representante): bool
    {
        return $this->view($usuario, $representante);
    }

    public function delete(Usuario $usuario, Representante $representante): bool
    {
        return $this->view($usuario, $representante);
    }
}
