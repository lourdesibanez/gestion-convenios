<?php

namespace App\Policies;

use App\Models\Instrumento;
use App\Models\ParteFirmante;
use App\Models\Usuario;

/** Permisos por rol y unidad: se exigen en la unidad del convenio de la parte. */
class ParteFirmantePolicy
{
    public function viewAny(Usuario $usuario): bool
    {
        return $usuario->tienePermiso('instrumento.ver');
    }

    public function view(Usuario $usuario, ParteFirmante $parte): bool
    {
        return $this->permisoEnUnidad($usuario, 'instrumento.ver', $parte->instrumento);
    }

    public function create(Usuario $usuario, Instrumento $instrumento): bool
    {
        return $this->permisoEnUnidad($usuario, 'instrumento.editar', $instrumento);
    }

    public function update(Usuario $usuario, ParteFirmante $parte): bool
    {
        return $this->permisoEnUnidad($usuario, 'instrumento.editar', $parte->instrumento);
    }

    public function delete(Usuario $usuario, ParteFirmante $parte): bool
    {
        return $this->update($usuario, $parte);
    }

    private function permisoEnUnidad(Usuario $usuario, string $permiso, ?Instrumento $instrumento): bool
    {
        return $instrumento !== null
            && $usuario->tienePermiso($permiso, $instrumento->id_institucion);
    }
}
