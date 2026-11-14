<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConvenioDetalleResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'puede_firmar' => $this->resource['puede_firmar'] ?? false,
            'puede_editar' => $this->resource['puede_editar'] ?? false,
            'puede_enviar_revision' => $this->resource['puede_enviar_revision'] ?? false,
            'puede_subir_archivo' => $this->resource['puede_subir_archivo'] ?? false,
            'puede_eliminar' => $this->resource['puede_eliminar'] ?? false,
            'convenio' => (array) $this->resource['convenio'],
            'partes' => $this->resource['partes']->map(fn ($item) => (array) $item)->all(),
            'representantes' => $this->resource['representantes']->map(fn ($item) => (array) $item)->all(),
            'archivos' => $this->resource['archivos']->map(function ($item): array {
                $archivo = (array) $item;
                $archivo['descarga_url'] = route('documents.download', $archivo['id']);

                return $archivo;
            })->all(),
            'historial' => $this->resource['historial']->map(function ($item): array {
                $fila = (array) $item;
                $fila['usuario'] = trim($fila['nombre_usuario'].' '.$fila['apellido_usuario']);
                unset($fila['nombre_usuario'], $fila['apellido_usuario']);

                return $fila;
            })->all(),
            'observaciones' => $this->resource['observaciones']->map(function ($item): array {
                $fila = (array) $item;
                $fila['usuario'] = trim($fila['nombre_usuario'].' '.$fila['apellido_usuario']);
                unset($fila['nombre_usuario'], $fila['apellido_usuario']);

                return $fila;
            })->all(),
            'vinculos' => $this->resource['vinculos']->map(fn ($item) => (array) $item)->all(),
        ];
    }
}
