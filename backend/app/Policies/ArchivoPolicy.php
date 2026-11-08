<?php

namespace App\Policies;

use App\Models\Archivo;
use App\Models\Instrumento;
use App\Models\Usuario;

class ArchivoPolicy
{
    public function viewAny(Usuario $usuario): bool
    {
        return $usuario->tienePermiso('instrumento.ver');
    }

    public function view(Usuario $usuario, Archivo $archivo): bool
    {
        return $usuario->tienePermiso('instrumento.ver')
            && $this->instrumentoVisible($usuario, $archivo->instrumento);
    }

    public function create(Usuario $usuario, Instrumento $instrumento): bool
    {
        return $usuario->tienePermiso('archivo.subir')
            && $this->instrumentoVisible($usuario, $instrumento);
    }

    public function update(Usuario $usuario, Archivo $archivo): bool
    {
        return false;
    }

    public function delete(Usuario $usuario, Archivo $archivo): bool
    {
        return $usuario->tienePermiso('archivo.eliminar')
            && $this->instrumentoVisible($usuario, $archivo->instrumento);
    }

    private function instrumentoVisible(Usuario $usuario, ?Instrumento $instrumento): bool
    {
        if (! $instrumento) {
            return false;
        }

        $instituciones = $usuario->institucionesVisibles();

        return $instituciones === null || in_array($instrumento->id_institucion, $instituciones, true);
    }
}
