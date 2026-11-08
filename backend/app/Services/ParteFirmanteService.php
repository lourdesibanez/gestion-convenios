<?php

namespace App\Services;

use App\Models\ParteFirmante;
use App\Models\Instrumento;
use App\Models\Usuario;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ParteFirmanteService
{
    public function listar(Usuario $usuario): LengthAwarePaginator
    {
        return ParteFirmante::with(['institucion', 'instrumento'])
            ->whereHas('instrumento', fn ($query) => $query->visiblePara($usuario))
            ->latest('id')
            ->paginate(15);
    }

    public function obtenerDetalle(Usuario $usuario, int $id): ParteFirmante
    {
        return ParteFirmante::with(['institucion', 'instrumento'])
            ->whereHas('instrumento', fn ($query) => $query->visiblePara($usuario))
            ->findOrFail($id);
    }

    public function obtenerInstrumentoVisible(Usuario $usuario, int $id): Instrumento
    {
        return Instrumento::query()->visiblePara($usuario)->findOrFail($id);
    }

    public function crear(array $datos): ParteFirmante
    {
        return ParteFirmante::create($datos)->load(['institucion', 'instrumento']);
    }

    public function actualizar(ParteFirmante $parte, array $datos): ParteFirmante
    {
        $parte->update($datos);

        return $parte->load(['institucion', 'instrumento']);
    }

    public function eliminar(ParteFirmante $parte): void
    {
        $parte->delete();
    }

}