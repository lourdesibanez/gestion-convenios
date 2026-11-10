<?php

namespace App\Http\Controllers;

use App\Http\Requests\ComentarioRequest;
use App\Http\Resources\ComentarioResource;
use App\Models\Instrumento;
use App\Services\ComentarioService;
use Illuminate\Http\Request;

class ComentarioController extends Controller
{
    public function __construct(
        private ComentarioService $comentarios,
    ) {}

    public function listar(Request $request, int $id)
    {
        $instrumento = $this->instrumentoAutorizado($request, $id);

        return ComentarioResource::collection(
            $this->comentarios->listar($instrumento),
        );
    }

    public function crear(ComentarioRequest $request, int $id)
    {
        $instrumento = $this->instrumentoAutorizado($request, $id);

        $comentario = $this->comentarios->crear(
            $instrumento,
            $request->user(),
            $request->validated('comentario'),
        );

        return (new ComentarioResource($comentario))
            ->response()
            ->setStatusCode(201);
    }

    private function instrumentoAutorizado(Request $request, int $id): Instrumento
    {
        $instrumento = Instrumento::query()
            ->visiblePara($request->user())
            ->findOrFail($id);

        $this->authorize('view', $instrumento);

        return $instrumento;
    }
}
