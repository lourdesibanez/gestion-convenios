<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ArchivoResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                    => $this->id,
            'id_instrumento'        => $this->id_instrumento,
            'nombre'                => $this->nombre,
            'tipo_documento'        => $this->tipo_documento,
            'tipo_mime'             => $this->tipo_mime,
            'tamanio_bytes'         => $this->tamanio_bytes,
            'hash_sha256'           => $this->hash_sha256,
            'created_at'            => $this->created_at,
            'descarga_url'          => route('documents.download', $this->id),
            'hash_original'         => $this->hash_original,
            'origen'                => $this->origen,
            'sellado_en'            => $this->sellado_en,
        ];
    }
}
