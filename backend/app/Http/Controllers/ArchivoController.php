<?php

namespace App\Http\Controllers;

use App\Http\Requests\ArchivoRequest;
use App\Http\Resources\ArchivoResource;
use App\Models\Archivo;
use App\Services\ArchivoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ArchivoController extends Controller
{
    public function __construct(private ArchivoService $archivos) {}

    public function listar(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Archivo::class);

        return ArchivoResource::collection(
            $this->archivos->listar($request->user())
        )->response();
    }

    public function crear(ArchivoRequest $request): JsonResponse
    {
        $instrumento = $this->archivos->obtenerInstrumentoVisible(
            $request->user(),
            $request->validated('id_instrumento'),
        );
        $this->authorize('create', [Archivo::class, $instrumento]);
        $archivo = $this->archivos->crear(
            $instrumento,
            $request->user(),
            $request->validated('tipo_documento'),
            $request->file('archivo'),
            $request->validated('origen') ?? 'web',
        );


        return (new ArchivoResource($archivo))
            ->response()
            ->setStatusCode(201);
    }

    public function obtenerDetalle(Request $request, int $id): ArchivoResource
    {
        $archivo = $this->archivos->obtenerDetalle($request->user(), $id);
        $this->authorize('view', $archivo);

        return new ArchivoResource($archivo);
    }

    public function descargar(Request $request, int $id): StreamedResponse
    {
        $archivo = $this->archivos->obtenerDetalle($request->user(), $id);
        $this->authorize('view', $archivo);

        return $this->archivos->descargar($archivo, $request->user());
    }

    public function eliminar(Request $request, int $id): Response
    {
        $archivo = $this->archivos->obtenerDetalle($request->user(), $id);
        $this->authorize('delete', $archivo);
        $this->archivos->eliminar($archivo);

        return response()->noContent();
    }
}
