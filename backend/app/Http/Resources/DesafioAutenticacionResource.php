<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DesafioAutenticacionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id_desafio' => $this['id_desafio'],
            'canal' => $this['canal'],
            'destino' => $this['destino'],
            'canales_disponibles' => $this['canales_disponibles'],
            'expira_en' => $this['expira_en'],
            'reenviar_en_segundos' => $this['reenviar_en_segundos'],
            'codigo_debug' => config('app.debug') ? $this['codigo_debug'] : null,
        ];
    }
}
