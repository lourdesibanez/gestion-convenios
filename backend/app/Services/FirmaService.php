<?php

namespace App\Services;

use App\Models\Archivo;
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

    public function obtenerDocumentoPendiente(Usuario $usuario, int $id_instrumento): Archivo
    {
        $usuario->firmas()
            ->pendientes()
            ->where('id_instrumento', $id_instrumento)
            ->firstOrFail();

        return Archivo::query()
            ->where('id_instrumento', $id_instrumento)
            ->where('tipo_documento', 'convenio_aprobado')
            ->where('tipo_mime', 'application/pdf')
            ->latest('id')
            ->firstOrFail();
    }
}
