<?php

namespace App\Http\Controllers;

use App\Services\FirmaService;
use App\Services\ArchivoService;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

    public function visualizarDocumentoPendiente(Request $request, int $id_instrumento): StreamedResponse {
        $archivo = $this->firmas->obtenerDocumentoPendiente(
            $request->user(),
            $idInstrumento,
        );

        return $this->archivos->visualizar($archivo, $request->user());
    }
}
