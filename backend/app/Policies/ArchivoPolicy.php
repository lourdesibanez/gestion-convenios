<?php

namespace App\Policies;

use App\Models\Archivo;
use App\Models\Instrumento;
use App\Models\Usuario;

/** Permisos por rol y unidad: se exigen en la unidad del convenio del archivo. */
class ArchivoPolicy
{
    public function viewAny(Usuario $usuario): bool
    {
        return $usuario->tienePermiso('instrumento.ver');
    }

    public function view(Usuario $usuario, Archivo $archivo): bool
    {
        return $this->permisoEnUnidad($usuario, 'instrumento.ver', $archivo->instrumento);
    }

    public function create(Usuario $usuario, Instrumento $instrumento): bool
    {
        return $this->permisoEnUnidad($usuario, 'archivo.subir', $instrumento);
    }

    public function update(Usuario $usuario, Archivo $archivo): bool
    {
        return false;
    }

    public function delete(Usuario $usuario, Archivo $archivo): bool
    {
        return $this->permisoEnUnidad($usuario, 'archivo.eliminar', $archivo->instrumento);
    }

    private function permisoEnUnidad(Usuario $usuario, string $permiso, ?Instrumento $instrumento): bool
    {
        return $instrumento !== null
            && $usuario->tienePermiso($permiso, $instrumento->id_institucion);
    }
}
