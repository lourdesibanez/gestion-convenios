<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ParteFirmanteResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'id_institucion' => $this->id_institucion,
            'id_instrumento' => $this->id_instrumento,
            'fecha_firma' => $this->fecha_firma?->toDateString(),
            'institucion' => $this->whenLoaded('institucion', fn () => $this->institucion
                ? ['id' => $this->institucion->id, 'nombre' => $this->institucion->nombre]
                : null),
            'instrumento' => $this->whenLoaded('instrumento', fn () => $this->instrumento
                ? [
                    'uuid' => $this->instrumento->uuid,
                    'codigo' => $this->instrumento->codigo,
                    'titulo' => $this->instrumento->titulo,
                ]
                : null),
        ];
    }
}
