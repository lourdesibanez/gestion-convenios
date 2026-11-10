<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegistrarFirmaRequest;
use App\Models\Firma;
use App\Services\ArchivoService;
use App\Services\FirmaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use App\Models\Archivo;

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

    public function registrar(RegistrarFirmaRequest $request, int $id_instrumento): JsonResponse
    {
        $this->authorize('registrar', [Firma::class, $id_instrumento]);

        return response()->json(
            $this->firmas->registrar(
                $request->user(),
                $id_instrumento,
                $request->validated(),
            ),
            201,
        );
    }

    public function verPdfFirmado(Request $request, int $id_instrumento): StreamedResponse
    {
        $this->authorize('verDocumentoFirmado', [Firma::class, $id_instrumento]);

        $archivo = $this->firmas->obtenerDocumentoFirmado(
            $request->user(),
            $id_instrumento,
        );

        return $this->archivos->visualizar($archivo, $request->user());
    }

    //Endpoint publico para que cualquier pueda verificar la validez de la firma mediante un qr
    public function verificar(string $token): JsonResponse
    {
        $firma = Firma::query()
            ->with('instrumento')
            ->where('token_verificacion', $token)
            ->whereNotNull('firmado_en')
            ->firstOrFail();

        $archivo = Archivo::query()
            ->where('id_instrumento', $firma->id_instrumento)
            ->where('tipo_documento', 'convenio_firmado')
            ->where('hash_sha256', $firma->hash_documento)
            ->firstOrFail();

        return response()->json([
            'data' => [
                'titulo' => $firma->instrumento->titulo,
                'codigo' => $firma->instrumento->codigo,
                'firmado_en' => $firma->firmado_en->toIso8601String(),
                'hash_documento' => $archivo->hash_sha256,
            ],
        ]);
    }
}
