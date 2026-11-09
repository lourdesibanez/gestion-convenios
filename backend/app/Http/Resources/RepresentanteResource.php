<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RepresentanteResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'apellido' => $this->apellido,
            'tipo_documento' => $this->tipo_documento,
            'numero_documento' => $this->numero_documento,
            'correo_electronico' => $this->correo_electronico,
            'telefono' => $this->telefono,
            'total_convenios' => $this->when(
                array_key_exists('total_convenios', (array) $this->resource),
                $this->total_convenios,
            ),
        ];
    }
}
