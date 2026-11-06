<?php

namespace App\Services;

use App\Models\Representante;
use Illuminate\Database\Eloquent\Collection;

class RepresentanteService
{
    public function listarTodos(): Collection
    {
        return Representante::latest('id')->get();
    }

    public function obtenerPorId(int $id): Representante
    {
        return Representante::findOrFail($id);
    }

    public function crear(array $datos): Representante
    {
        return Representante::create($datos);
    }

    public function actualizar(Representante $representante, array $datos): Representante
    {
        $representante->update($datos);
        return $representante;
    }

    public function eliminar(Representante $representante): void
    {
        $representante->delete();
    }

    public function existeDocumentoDuplicado(string $tipo, string $numero, ?int $idExcluido = null): bool
    {
        $query = Representante::where('tipo_documento', $tipo)
            ->where('numero_documento', $numero);

        if ($idExcluido) {
            $query->where('id', '!=', $idExcluido);
        }

        return $query->exists();
    }
}