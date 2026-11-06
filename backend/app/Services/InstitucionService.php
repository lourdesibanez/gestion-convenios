<?php

namespace App\Services;

use App\Models\Institucion;
use Illuminate\Database\Eloquent\Collection;

class InstitucionService
{
    public function listarTodas(): Collection
    {
        return Institucion::with('representante')->latest('id')->get();
    }

    public function obtenerPorId(int $id): Institucion
    {
        return Institucion::with('representante')->findOrFail($id);
    }

    public function crear(array $datos): Institucion
    {
        return Institucion::create($datos);
    }

    public function actualizar(Institucion $institucion, array $datos): Institucion
    {
        $institucion->update($datos);
        return $institucion;
    }

    public function eliminar(Institucion $institucion): void
    {
        $institucion->delete();
    }

    public function existeIdentificacionFiscal(string $identificacion, ?int $idExcluido = null): bool
    {
        $query = Institucion::where('identificacion_fiscal', $identificacion);

        if ($idExcluido) {
            $query->where('id', '!=', $idExcluido);
        }

        return $query->exists();
    }
}