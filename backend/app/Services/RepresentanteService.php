<?php

namespace App\Services;

use App\Models\Representante;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class RepresentanteService
{
    public function listar(): LengthAwarePaginator
    {
        return Representante::query()
            ->select('representante.*')
            ->selectSub(
                DB::table('representante_instrumento')
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('id_representante', 'representante.id')
                    ->whereNull('deleted_at'),
                'total_convenios',
            )
            ->latest('id')
            ->paginate(15);
    }

    public function obtenerDetalle(int $id): Representante
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

}