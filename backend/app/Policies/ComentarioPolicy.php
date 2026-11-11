<?php

namespace App\Policies;

use App\Models\Instrumento;
use App\Models\Usuario;

class ComentarioPolicy
{
    public function create(Usuario $usuario, Instrumento $instrumento): bool
    {
        return $usuario->tienePermiso('comentario.crear');
    }
}
