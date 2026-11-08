<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InstitucionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'identificacion_fiscal' => $this->identificacion_fiscal,
            'domicilio' => $this->domicilio,
            'id_representante' => $this->id_representante,
            'es_interna' => $this->es_interna,
            'latitud' => $this->latitud,
            'longitud' => $this->longitud,
            'total_convenios' => $this->when(
                array_key_exists('total_convenios', (array) $this->resource),
                $this->total_convenios,
            ),
            'representante' => $this->whenLoaded('representante', fn () => $this->representante
                ? (new RepresentanteResource($this->representante))->resolve()
                : null),
        ];
    }
}
