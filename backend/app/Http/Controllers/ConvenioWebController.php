<?php

namespace App\Http\Controllers;

use App\Http\Requests\ConvenioIndexRequest;
use App\Http\Resources\ConvenioDetalleResource;
use App\Http\Resources\ConvenioResource;
use App\Models\Instrumento;
use App\Services\ConvenioService;
use App\Services\ConvenioWebService;

use Illuminate\Http\Request;

class ConvenioWebController extends Controller
{
    public function __construct(private ConvenioWebService $convenios) {}

    //PARA LA WEB ... Por el momento no quiero ves si tiene periso de editar o no
    
    public function listarPrivado(ConvenioIndexRequest $request)
    {
           return ConvenioResource::collection(
            $this->convenios->listarPrivado($request->validated())
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

    public function obtenerDetallePrivado(Request $request, int $id): ConvenioDetalleResource
    {
        $detalle = $this->convenios->obtenerDetallePrivados($id);

        unset($detalle['instrumento_model']);

        return new ConvenioDetalleResource($detalle);
    }

    
    public function listarEnRevision(Request $request)
    {
        return ConvenioResource::collection(
            $this->convenios->listarEnRevision());
    }
}
