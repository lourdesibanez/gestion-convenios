<?php

namespace App\Http\Controllers;

use App\Http\Requests\ConvenioIndexRequest;
use App\Http\Requests\ConvenioStoreRequest;
use App\Http\Requests\ConvenioUpdateRequest;
use App\Http\Requests\RevisionAprobarRequest;
use App\Http\Requests\RevisionDevolverRequest;
use App\Http\Resources\ConvenioDetalleResource;
use App\Http\Resources\ConvenioResource;
use App\Models\Archivo;
use App\Models\Instrumento;
use App\Models\Observacion;
use App\Services\ConvenioService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

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

    public function enviarARevision(Request $request, int $id): JsonResponse
    {
        $instrumento = Instrumento::query()->visiblePara($request->user())->findOrFail($id);
        $this->authorize('sendToReview', $instrumento);

        $instrumento = $this->convenios->enviarARevision($request->user(), $instrumento);

        return response()->json([
            'data' => [
                'id' => $instrumento->id,
                'estado' => $instrumento->estado->nombre,
                'version' => $instrumento->version,
            ],
        ]);
    }

    public function eliminar(Request $request, int $id): Response
    {
        $instrumento = Instrumento::query()->visiblePara($request->user())->findOrFail($id);
        $this->authorize('delete', $instrumento);

        $this->convenios->eliminarBorrador($request->user(), $instrumento);

        return response()->noContent();
    }

    public function obtenerDetalle(Request $request, int $id): ConvenioDetalleResource
    {
        $detalle = $this->convenios->obtenerDetalle($request->user(), $id);
        $instrumento = $detalle['instrumento_model'];
        $this->authorize('view', $instrumento);
        $detalle['puede_editar'] = $request->user()->can('update', $instrumento);
        $detalle['puede_enviar_revision'] = $request->user()->can('sendToReview', $instrumento);
        $detalle['puede_subir_archivo'] = $request->user()->can('create', [Archivo::class, $instrumento]);
        $detalle['puede_crear_observacion'] = $request->user()->can('create',[Observacion::class, $instrumento]);
        $detalle['puede_aprobar'] = $request->user()->can('approve',$instrumento);
        $detalle['puede_devolver'] = $request->user()->can('returnForCorrection',$instrumento);
        $detalle['puede_eliminar'] = $request->user()->can('delete', $instrumento);
        unset($detalle['instrumento_model']);

        return new ConvenioDetalleResource($detalle);
    }

    public function listarEnRevision(Request $request)
    {
        $this->authorize('viewRevision', Instrumento::class);

        return ConvenioResource::collection($this->convenios->listarEnRevision($request->user()));
    }

    public function aprobar(
        RevisionAprobarRequest $request,
        int $id
    ): JsonResponse {
        $instrumento = Instrumento::query()
            ->visiblePara($request->user(), 'instrumento.aprobar')
            ->findOrFail($id);

        $this->authorize('approve', $instrumento);

        $instrumento = $this->convenios->aprobarRevision(
            $request->user(),
            $instrumento,
            $request->validated('version'),
            $request->validated('fundamento')
        );

        return response()->json([
            'data' => [
                'id' => $instrumento->id,
                'estado' => $instrumento->estado->nombre,
                'version' => $instrumento->version,
            ],
        ]);
    }

    public function devolverParaCorreccion(
        RevisionDevolverRequest $request,
        int $id
    ): JsonResponse {
        $instrumento = Instrumento::query()
            ->visiblePara($request->user(), 'instrumento.aprobar')
            ->findOrFail($id);

        $this->authorize('returnForCorrection', $instrumento);

        $instrumento = $this->convenios->devolverParaCorreccion(
            $request->user(),
            $instrumento,
            $request->validated('version'),
            $request->validated('fundamento')
        );

        return response()->json([
            'data' => [
                'id' => $instrumento->id,
                'estado' => $instrumento->estado->nombre,
                'version' => $instrumento->version,
            ],
        ]);
    }

}
