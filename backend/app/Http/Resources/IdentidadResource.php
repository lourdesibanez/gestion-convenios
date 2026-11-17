<?php

namespace App\Http\Resources;

use App\Services\IdentidadService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IdentidadResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'firma' => app(IdentidadService::class)->firmaComoDataUrl($this->resource),
            'firma_registrada_en' => $this->firma_registrada_en,
            'facial_registrado_en' => $this->facial_registrado_en,
            'huella_registrada_en' => $this->huella_registrada_en,
        ];
    }
}
