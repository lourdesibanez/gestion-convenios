<?php

namespace App\Services;

use App\Models\Firma;
use App\Models\Usuario;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use App\Models\Archivo;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

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

    public function verPdfPendiente(Usuario $usuario, int $idInstrumento): StreamedResponse
    {
        $usuario->firmas()
            ->pendientes()
            ->where('id_instrumento', $idInstrumento)
            ->firstOrFail();

        $archivo = Archivo::query()
            ->where('id_instrumento', $idInstrumento)
            ->where('tipo_documento', 'convenio_aprobado')
            ->latest('id')
            ->firstOrFail();

        if (! Storage::disk('local')->exists($archivo->ruta)) {
            throw (new ModelNotFoundException())->setModel(Archivo::class, [$archivo->id]);
        }

        return Storage::disk('local')->response(
            $archivo->ruta,
            $archivo->nombre,
            [
                'Content-Type' => 'application/pdf',
                'X-Content-Type-Options' => 'nosniff',
            ],
            'inline',
        );
    }
}
