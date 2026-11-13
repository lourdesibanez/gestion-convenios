<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UsuarioResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $perfil = $this->perfiles()
            ->activos()
            ->with('perfil')
            ->oldest('id')
            ->first();

        return [
            'id' => $this->id,
            'nombre_usuario' => $this->nombre_usuario,
            'nombre' => $this->nombre,
            'apellido' => $this->apellido,
            'email' => $this->email,
            'tipo_perfil' => $perfil?->perfil?->nombre,
        ];
    }
}
