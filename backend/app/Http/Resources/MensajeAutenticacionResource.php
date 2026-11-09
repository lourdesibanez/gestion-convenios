<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MensajeAutenticacionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'message' => $this['message'],
            'expira_en_minutos' => $this['expira_en_minutos'],
            'codigo_debug' => config('app.debug') ? $this['codigo_debug'] : null,
        ];
    }
}
