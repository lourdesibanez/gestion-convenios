<?php

namespace App\Services;

use App\Models\ParteFirmante;
use Illuminate\Database\Eloquent\Collection;

class ParteFirmanteService
{
    public function listarTodas(): Collection
    {
        return ParteFirmante::with(['institucion', 'instrumento'])->latest('id')->get();
    }

    public function obtenerPorId(int $id): ParteFirmante
    {
        return ParteFirmante::with(['institucion', 'instrumento'])->findOrFail($id);
    }

    public function crear(array $datos): ParteFirmante
    {
        return ParteFirmante::create($datos);
    }

    public function actualizar(ParteFirmante $parte, array $datos): ParteFirmante
    {
        $parte->update($datos);
        return $parte;
    }

    public function eliminar(ParteFirmante $parte): void
    {
        $parte->delete();
    }

    public function existeVinculoDuplicado(int $idInstitucion, int $idInstrumento, ?int $idExcluido = null): bool
    {
        $query = ParteFirmante::where('id_institucion', $idInstitucion)
            ->where('id_instrumento', $idInstrumento);

        if ($idExcluido) {
            $query->where('id', '!=', $idExcluido);
        }

        return $query->exists();
    }
}