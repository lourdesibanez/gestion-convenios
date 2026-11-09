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

    //PARA LA WEB ... Por el momento no quiero ves si tiene periso de editar o no
    
    public function listarPrivadoWeb(ConvenioIndexRequest $request)
    {
           return ConvenioResource::collection(
            $this->convenios->listarPrivadoWeb($request->validated())
        );
    }
    //en la web hay una parte publica 
        public function listarPublicos(ConvenioIndexRequest $request)
    {
        return ConvenioResource::collection(
            $this->convenios->listarPublicos($request->validated())
        );
    }

    public function obtenerDetallesPublico($id)
    {
        try {
            $data = $this->convenios->ObtenerDetallesPublico((int) $id);

            return response()->json([
                'ok' => true,
                'data' => $data,
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'ok' => false,
                'mensaje' => 'Convenio no encontrado',
            ], 404);

        } catch (\Exception $e) {
            return response()->json([
                'ok' => false,
                'mensaje' => 'Error al obtener el convenio',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
