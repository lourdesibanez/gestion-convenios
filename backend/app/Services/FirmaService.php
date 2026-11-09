<?php

namespace App\Services;

use App\Models\Firma;
use App\Models\Usuario;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class FirmaService
{
    private const POR_PAGINA = 10;

    public function listarPendientes(Usuario $usuario): LengthAwarePaginator
    {
        return $usuario->firmas()
            ->pendientes()
            ->with('instrumento.tipo')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(self::POR_PAGINA)
            ->through(fn (Firma $firma): array => [
                'uuid'              => $firma->instrumento->uuid,
                'id_instrumento'    => $firma->instrumento->id,
                'codigo'            => $firma->instrumento->codigo,
                'titulo'            => $firma->instrumento->titulo,
                'tipo'              => $firma->instrumento->tipo->nombre,
                'asignado_en'       => $firma->created_at,
            ]);
    }
}
