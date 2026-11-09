<?php

namespace App\Http\Controllers;

use App\Http\Requests\ConvenioIndexRequest;
use App\Http\Resources\ConvenioDetalleResource;
use App\Http\Resources\ConvenioResource;
use App\Models\Instrumento;
use App\Services\ConvenioService;
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

    public function obtenerDetalle(Request $request, int $id): ConvenioDetalleResource
    {
        $detalle = $this->convenios->obtenerDetalle($request->user(), $id);
        $instrumento = $detalle['instrumento_model'];
        $this->authorize('view', $instrumento);
        unset($detalle['instrumento_model']);

        return new ConvenioDetalleResource($detalle);
    }

    public function listarEnRevision(Request $request)
    {
        $this->authorize('viewRevision', Instrumento::class);

        return ConvenioResource::collection($this->convenios->listarEnRevision($request->user()));
    }
}
