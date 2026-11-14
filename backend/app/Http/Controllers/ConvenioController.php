<?php

namespace App\Http\Controllers;

use App\Http\Requests\ConvenioIndexRequest;
use App\Http\Requests\ConvenioStoreRequest;
use App\Http\Requests\ConvenioUpdateRequest;
use App\Http\Resources\ConvenioDetalleResource;
use App\Http\Resources\ConvenioResource;
use App\Models\Instrumento;
use App\Services\ConvenioService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConvenioController extends Controller
{
    public function __construct(private ConvenioService $convenios) {}

    public function listarPublicos(ConvenioIndexRequest $request)
    {
        return ConvenioResource::collection(
            $this->convenios->listarPublicos($request->validated())
        );
    }

    public function obtenerDetallePublico(int $id): ConvenioDetalleResource
    {
        return new ConvenioDetalleResource($this->convenios->obtenerDetallePublico($id));
    }

    public function listar(ConvenioIndexRequest $request)
    {
        $this->authorize('viewAny', Instrumento::class);

        return ConvenioResource::collection(
            $this->convenios->listar($request->user(), $request->validated())
        );
    }

    public function opcionesCreacion(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Instrumento::class);

        return response()->json([
            'data' => $this->convenios->opcionesCreacion($request->user()),
        ]);
    }

    public function crear(ConvenioStoreRequest $request): JsonResponse
    {
        $this->authorize('create', Instrumento::class);

        $instrumento = $this->convenios->crear($request->user(), $request->validated());

        return response()->json([
            'data' => [
                'id' => $instrumento->id,
                'uuid' => $instrumento->uuid,
                'codigo' => $instrumento->codigo,
                'titulo' => $instrumento->titulo,
                'estado' => $instrumento->estado->nombre,
            ],
        ], 201);
    }

    public function actualizar(ConvenioUpdateRequest $request, int $id): JsonResponse
    {
        $instrumento = Instrumento::query()->visiblePara($request->user())->findOrFail($id);
        $this->authorize('update', $instrumento);

        $instrumento = $this->convenios->actualizar(
            $request->user(),
            $instrumento,
            $request->validated(),
        );

        return response()->json([
            'data' => [
                'id' => $instrumento->id,
                'titulo' => $instrumento->titulo,
                'version' => $instrumento->version,
            ],
        ]);
    }

    public function obtenerDetalle(Request $request, int $id): ConvenioDetalleResource
    {
        $detalle = $this->convenios->obtenerDetalle($request->user(), $id);
        $instrumento = $detalle['instrumento_model'];
        $this->authorize('view', $instrumento);
        $detalle['puede_editar'] = $request->user()->can('update', $instrumento);
        unset($detalle['instrumento_model']);

        return new ConvenioDetalleResource($detalle);
    }

    public function listarEnRevision(Request $request)
    {
        $this->authorize('viewRevision', Instrumento::class);

        return ConvenioResource::collection($this->convenios->listarEnRevision($request->user()));
    }

}
