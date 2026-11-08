<?php

namespace App\Http\Controllers;

use App\Http\Requests\ParteFirmanteRequest;
use App\Http\Resources\ParteFirmanteResource;
use App\Models\ParteFirmante;
use App\Services\ParteFirmanteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ParteFirmanteController extends Controller
{
    public function __construct(private ParteFirmanteService $partes) {}

    public function listar(Request $request): JsonResponse
    {
        $this->authorize('viewAny', ParteFirmante::class);

        return ParteFirmanteResource::collection(
            $this->partes->listar($request->user())
        )->response();
    }

    public function crear(ParteFirmanteRequest $request): JsonResponse
    {
        $instrumento = $this->partes->obtenerInstrumentoVisible(
            $request->user(),
            $request->validated('id_instrumento'),
        );
        $this->authorize('create', [ParteFirmante::class, $instrumento]);
        $parte = $this->partes->crear($request->validated());

        return (new ParteFirmanteResource($parte))
            ->response()
            ->setStatusCode(201);
    }

    public function obtenerDetalle(Request $request, int $id): ParteFirmanteResource
    {
        $parte = $this->partes->obtenerDetalle($request->user(), $id);
        $this->authorize('view', $parte);

        return new ParteFirmanteResource($parte);
    }

    public function actualizar(ParteFirmanteRequest $request, int $id): ParteFirmanteResource
    {
        $parte = $this->partes->obtenerDetalle($request->user(), $id);
        $this->authorize('update', $parte);
        $datos = $request->validated();

        if (isset($datos['id_instrumento'])) {
            $instrumento = $this->partes->obtenerInstrumentoVisible(
                $request->user(),
                $datos['id_instrumento'],
            );
            $this->authorize('create', [ParteFirmante::class, $instrumento]);
        }

        return new ParteFirmanteResource(
            $this->partes->actualizar($parte, $datos)
        );
    }

    public function eliminar(Request $request, int $id): Response
    {
        $parte = $this->partes->obtenerDetalle($request->user(), $id);
        $this->authorize('delete', $parte);
        $this->partes->eliminar($parte);

        return response()->noContent();
    }
}
