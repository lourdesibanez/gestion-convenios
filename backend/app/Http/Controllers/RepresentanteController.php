<?php

namespace App\Http\Controllers;

use App\Http\Requests\RepresentanteRequest;
use App\Http\Resources\RepresentanteResource;
use App\Models\Representante;
use App\Services\RepresentanteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class RepresentanteController extends Controller
{
    public function __construct(private RepresentanteService $representantes) {}

    public function listar(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Representante::class);

        return RepresentanteResource::collection($this->representantes->listar())
            ->response();
    }

    public function crear(RepresentanteRequest $request): JsonResponse
    {
        $this->authorize('create', Representante::class);
        $representante = $this->representantes->crear($request->validated());

        return (new RepresentanteResource($representante))
            ->response()
            ->setStatusCode(201);
    }

    public function obtenerDetalle(Request $request, int $id): RepresentanteResource
    {
        $representante = $this->representantes->obtenerDetalle($id);
        $this->authorize('view', $representante);

        return new RepresentanteResource($representante);
    }

    public function actualizar(RepresentanteRequest $request, int $id): RepresentanteResource
    {
        $representante = $this->representantes->obtenerDetalle($id);
        $this->authorize('update', $representante);

        return new RepresentanteResource(
            $this->representantes->actualizar($representante, $request->validated())
        );
    }

    public function eliminar(int $id): Response
    {
        $representante = $this->representantes->obtenerDetalle($id);
        $this->authorize('delete', $representante);
        $this->representantes->eliminar($representante);

        return response()->noContent();
    }
}
