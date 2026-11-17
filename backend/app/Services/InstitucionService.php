<?php

namespace App\Services;

use App\Models\Institucion;
use App\Models\Usuario;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class InstitucionService
{
    public function listar(): LengthAwarePaginator
    {
        return Institucion::with('representante')
            ->withCount('partesFirmantes as total_convenios')
            ->latest('id')
            ->paginate(15);
    }

    public function listarParaBusqueda(Usuario $usuario): array{
        return collect($usuario->unidades())
            ->map(fn (array $unidad) => ['id' => $unidad['id'], 'nombre' => $unidad['nombre']])
            ->values()
            ->all();
    }

    public function obtenerDetalle(Usuario $usuario, int $id): Institucion
    {
        $query = Institucion::with('representante')
            ->withCount('partesFirmantes as total_convenios')
            ->whereKey($id);
        $visibles = $usuario->institucionesVisibles();

        if ($visibles !== null) {
            $query->whereIn('id', $visibles);
        }

        return $query->firstOrFail();
    }

    public function crear(array $datos): Institucion
    {
        return Institucion::create($datos)
            ->load('representante')
            ->loadCount('partesFirmantes as total_convenios');
    }

    public function actualizar(Institucion $institucion, array $datos): Institucion
    {
        $institucion->update($datos);

        return $institucion->load('representante')
            ->loadCount('partesFirmantes as total_convenios');
    }

    public function eliminar(Institucion $institucion): void
    {
        $institucion->delete();
    }
}
