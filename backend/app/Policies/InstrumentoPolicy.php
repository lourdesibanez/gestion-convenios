<?php

namespace App\Policies;

use App\Models\Instrumento;
use App\Models\Usuario;

/**
 * Permisos por rol y unidad: sobre un convenio puntual se exige el permiso en
 * la unidad responsable de ese convenio (o en un perfil de alcance global).
 */
class InstrumentoPolicy
{
    public function viewAny(Usuario $usuario): bool
    {
        return $usuario->tienePermiso('instrumento.ver');
    }

    /** En qué unidad puede crear se valida en ConvenioStoreRequest. */
    public function create(Usuario $usuario): bool
    {
        return $usuario->tienePermiso('instrumento.crear');
    }

    public function view(Usuario $usuario, Instrumento $instrumento): bool
    {
        return $usuario->tienePermiso('instrumento.ver', $instrumento->id_institucion);
    }

    public function update(Usuario $usuario, Instrumento $instrumento): bool
    {
        return $usuario->tienePermiso('instrumento.editar', $instrumento->id_institucion)
            && $this->esBorradorPropio($usuario, $instrumento);
    }

    public function delete(Usuario $usuario, Instrumento $instrumento): bool
    {
        return $this->update($usuario, $instrumento);
    }

    public function sendToReview(Usuario $usuario, Instrumento $instrumento): bool
    {
        return $usuario->tienePermiso('instrumento.enviar_revision', $instrumento->id_institucion)
            && $this->esBorradorPropio($usuario, $instrumento);
    }

    /** El listado se limita a las unidades donde puede aprobar (ConvenioService). */
    public function viewRevision(Usuario $usuario): bool
    {
        return $usuario->tienePermiso('instrumento.aprobar');
    }

    private function esBorradorPropio(Usuario $usuario, Instrumento $instrumento): bool
    {
        return (int) $instrumento->created_by === (int) $usuario->id
            && $instrumento->estado?->nombre === 'borrador';
    }

    public function approve(Usuario $usuario, Instrumento $instrumento): bool
    {
        return $instrumento->estado?->nombre === 'revision'
            && $usuario->tienePermiso(
                'instrumento.aprobar',
                $instrumento->id_institucion
            );
    }

    public function returnForCorrection(
        Usuario $usuario,
        Instrumento $instrumento
    ): bool {
        return $instrumento->estado?->nombre === 'revision'
            && $usuario->tienePermiso(
                'instrumento.aprobar',
                $instrumento->id_institucion
            );
    }
}
