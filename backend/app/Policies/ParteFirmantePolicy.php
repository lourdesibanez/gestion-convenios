<?php

namespace App\Policies;

use App\Models\Instrumento;
use App\Models\ParteFirmante;
use App\Models\Usuario;

class ParteFirmantePolicy
{
    public function viewAny(Usuario $usuario): bool
    {
        return $usuario->tienePermiso('instrumento.ver');
    }

    public function view(Usuario $usuario, ParteFirmante $parte): bool
    {
        return $usuario->tienePermiso('instrumento.ver')
            && $this->instrumentoVisible($usuario, $parte->instrumento);
    }

    public function create(Usuario $usuario, Instrumento $instrumento): bool
    {
        return $usuario->tienePermiso('instrumento.editar')
            && $this->instrumentoVisible($usuario, $instrumento);
    }

    public function update(Usuario $usuario, ParteFirmante $parte): bool
    {
        return $usuario->tienePermiso('instrumento.editar')
            && $this->instrumentoVisible($usuario, $parte->instrumento);
    }

    public function delete(Usuario $usuario, ParteFirmante $parte): bool
    {
        return $this->update($usuario, $parte);
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
