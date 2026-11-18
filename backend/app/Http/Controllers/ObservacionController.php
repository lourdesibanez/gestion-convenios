<?php

namespace App\Http\Controllers;

use App\Http\Requests\ObservacionRespuestaRequest;
use App\Http\Requests\ObservacionStoreRequest;
use App\Http\Resources\ObservacionResource;
use App\Models\Instrumento;
use App\Models\Observacion;
use App\Services\ObservacionService;
use Illuminate\Http\Request;

class ObservacionController extends Controller
{
    public function __construct(
        private ObservacionService $observaciones
    ) {}

    public function listar(Request $request, int $id)
    {
        $instrumento = Instrumento::query()
            ->visiblePara($request->user())
            ->findOrFail($id);

        $this->authorize('view', $instrumento);

        return ObservacionResource::collection(
            $this->observaciones->listar($instrumento)
        );
    }

    public function crear(ObservacionStoreRequest $request, int $id)
    {
        $instrumento = Instrumento::query()
            ->visiblePara($request->user())
            ->findOrFail($id);

        $this->authorize('create', [Observacion::class, $instrumento]);

        $observacion = $this->observaciones->crear(
            $instrumento,
            $request->user(),
            $request->validated('contenido')
        );

        return (new ObservacionResource($observacion))
            ->response()
            ->setStatusCode(201);
    }

    public function responder(
        ObservacionRespuestaRequest $request,
        int $id
    ): ObservacionResource {
        $observacion = $this->observaciones->obtenerVisible(
            $request->user(),
            $id
        );

        $this->authorize('respond', $observacion);

        return new ObservacionResource(
            $this->observaciones->responder(
                $observacion,
                $request->user(),
                $request->validated('respuesta')
            )
        );
    }

    public function resolver(Request $request, int $id): ObservacionResource
    {
        $observacion = $this->observaciones->obtenerVisible(
            $request->user(),
            $id
        );

        $this->authorize('resolve', $observacion);

        return new ObservacionResource(
            $this->observaciones->resolver($observacion)
        );
    }
}