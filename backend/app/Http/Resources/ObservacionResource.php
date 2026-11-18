<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ObservacionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'id_instrumento' => $this->id_instrumento,
            'contenido' => $this->contenido,
            'estado' => $this->estado,
            'respuesta' => $this->respuesta,
            'fecha_respuesta' => $this->fecha_respuesta,
            'fecha_resolucion' => $this->fecha_resolucion,
            'created_at' => $this->created_at,

            'usuario' => $this->whenLoaded('usuario', fn () => [
                'id' => $this->usuario?->id,
                'nombre' => $this->usuario?->nombre,
                'apellido' => $this->usuario?->apellido,
            ]),

            'respondido_por' => $this->whenLoaded('respondidoPor', fn () => $this->respondidoPor
                ? [
                    'id' => $this->respondidoPor->id,
                    'nombre' => $this->respondidoPor->nombre,
                    'apellido' => $this->respondidoPor->apellido,
                ]
                : null),
            'puede_responder' => $request->user()?->can('respond', $this->resource) ?? false,
            'puede_resolver' => $request->user()?->can('resolve', $this->resource) ?? false,
        ];
    }
}