<?php

namespace App\Http\Controllers;

use App\Models\Archivo;
use App\Services\ArchivoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ArchivoController extends Controller
{
    public function __construct(private ArchivoService $archivoService)
    {
    }

    public function index(): JsonResponse
    {
        return response()->json($this->archivoService->listarTodos());
    }

    public function store(Request $request): JsonResponse
    {
        $validado = $request->validate([
            'id_instrumento' => 'required|integer|exists:instrumento,id',
            'nombre' => 'required|string|max:255',
            'tipo_documento' => 'required|string|max:255',
            'tipo_mime' => 'required|string|max:255',
            'tamanio_bytes' => 'required|integer|min:0',
            'hash_sha256' => 'required|string|size:64',
            'ruta' => 'required|string|max:255',
        ]);

        $archivo = $this->archivoService->crear($validado);

        return response()->json($archivo, 201);
    }

    public function show(int $id): JsonResponse
    {
        $archivo = $this->archivoService->obtenerPorId($id);
        return response()->json($archivo);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $archivo = $this->archivoService->obtenerPorId($id);

        $validado = $request->validate([
            'id_instrumento' => 'sometimes|required|integer|exists:instrumento,id',
            'nombre' => 'sometimes|required|string|max:255',
            'tipo_documento' => 'sometimes|required|string|max:255',
            'tipo_mime' => 'sometimes|required|string|max:255',
            'tamanio_bytes' => 'sometimes|required|integer|min:0',
            'hash_sha256' => 'sometimes|required|string|size:64',
            'ruta' => 'sometimes|required|string|max:255',
        ]);

        $actualizado = $this->archivoService->actualizar($archivo, $validado);

        return response()->json($actualizado);
    }

    public function destroy(int $id): JsonResponse
    {
        $archivo = $this->archivoService->obtenerPorId($id);
        $this->archivoService->eliminar($archivo);

        return response()->json(null, 204);
    }
}