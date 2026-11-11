<?php

namespace App\Http\Controllers;

use App\Http\Requests\InstitucionRequest;
use App\Http\Resources\InstitucionResource;
use App\Models\Institucion;
use App\Services\InstitucionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Models\Instrumento;

class InstitucionController extends Controller
{
    public function __construct(private InstitucionService $instituciones) {}

    public function listar(Request $request): JsonResponse {
        $filtros = $request->validate([
            'contexto' => ['sometimes', 'in:busqueda'],
        ]);

        if (($filtros['contexto'] ?? null) === 'busqueda') {
            $this->authorize('viewAny', Instrumento::class);

            return response()->json([
                'data' => $this->instituciones->listarParaBusqueda($request->user()),
            ]);
        }

        $this->authorize('viewAny', Institucion::class);

        return InstitucionResource::collection(
            $this->instituciones->listar()
        )->response();
    }

    public function crear(InstitucionRequest $request): JsonResponse
    {
        $this->authorize('create', Institucion::class);
        $institucion = $this->instituciones->crear($request->validated());

        return (new InstitucionResource($institucion))
            ->response()
            ->setStatusCode(201);
    }

    public function obtenerDetalle(Request $request, int $id): InstitucionResource
    {
        $institucion = $this->instituciones->obtenerDetalle($request->user(), $id);
        $this->authorize('view', $institucion);

        return new InstitucionResource($institucion);
    }

    public function actualizar(InstitucionRequest $request, int $id): InstitucionResource
    {
        $institucion = $this->instituciones->obtenerDetalle($request->user(), $id);
        $this->authorize('update', $institucion);

        return new InstitucionResource(
            $this->instituciones->actualizar($institucion, $request->validated())
        );
    }

    public function eliminar(Request $request, int $id): Response
    {
        $institucion = $this->instituciones->obtenerDetalle($request->user(), $id);
        $this->authorize('delete', $institucion);
        $this->instituciones->eliminar($institucion);

        return response()->noContent();
    }
}
