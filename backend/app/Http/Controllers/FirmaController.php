<?php

namespace App\Http\Controllers;

use App\Models\Firma;
use App\Services\ArchivoService;
use App\Services\FirmaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FirmaController extends Controller
{
    public function __construct(
        private FirmaService $firmas,
        private ArchivoService $archivos
    ) {}

    public function listarPendientes(Request $request): JsonResponse
    {
        return response()->json(
            $this->firmas->listarPendientes($request->user())
        );
    }

    public function verPdfPendiente(Request $request, int $id_instrumento): StreamedResponse
    {
        $this->authorize('verPdfPendiente', [Firma::class, $id_instrumento]);

        $archivo = $this->firmas->obtenerDocumentoPendiente(
            $request->user(),
            $id_instrumento,
        );

        return $this->archivos->visualizar($archivo, $request->user());
    }
}
