<?php

namespace App\Services;

use App\Models\Firma;
use App\Models\Usuario;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use App\Models\Archivo;
use Illuminate\Database\Eloquent\ModelNotFoundException;

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
                'id' => $firma->id,
                'uuid' => $firma->instrumento->uuid,
                'codigo' => $firma->instrumento->codigo,
                'titulo' => $firma->instrumento->titulo,
                'tipo' => $firma->instrumento->tipo->nombre,
                'asignado_en' => $firma->created_at,
            ]);
    }

    public function obtenerDocumentoPendiente(Usuario $usuario, int $idInstrumento): Archivo
    {
        $usuario->firmas()
            ->pendientes()
            ->where('id_instrumento', $idInstrumento)
            ->firstOrFail();

        return Archivo::query()
            ->where('id_instrumento', $idInstrumento)
            ->where('tipo_documento', 'convenio_aprobado')
            ->where('tipo_mime', 'application/pdf')
            ->latest('id')
            ->firstOrFail();
    }
}
