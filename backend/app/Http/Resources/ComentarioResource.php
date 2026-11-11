<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ComentarioResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'comentario' => $this->es_ofensivo
                ? 'comentario ofensivo'
                : $this->comentario,
            'es_ofensivo' => $this->es_ofensivo,
            'usuario' => [
                'id' => $this->usuario->id,
                'nombre' => $this->usuario->nombre,
                'apellido' => $this->usuario->apellido,
            ],
            'created_at' => $this->created_at,
        ];
    }
}
