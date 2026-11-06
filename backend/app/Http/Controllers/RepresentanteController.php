<?php

namespace App\Http\Controllers;

use App\Models\Representante;
use App\Services\RepresentanteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RepresentanteController extends Controller
{
    public function __construct(private RepresentanteService $representanteService)
    {
    }

    public function index(): JsonResponse
    {
        return response()->json($this->representanteService->listarTodos());
    }

    public function store(Request $request): JsonResponse
    {
        $validado = $request->validate([
            'nombre' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'tipo_documento' => 'required|string|max:255',
            'numero_documento' => 'required|string|max:255',
            'correo_electronico' => 'nullable|email|max:255',
            'telefono' => 'nullable|string|max:255',
        ]);

        if ($this->representanteService->existeDocumentoDuplicado($validado['tipo_documento'], $validado['numero_documento'])) {
            return response()->json(['message' => 'El documento ya está registrado para este tipo.'], 422);
        }

        $representante = $this->representanteService->crear($validado);

        return response()->json($representante, 201);
    }

    public function show(int $id): JsonResponse
    {
        $representante = $this->representanteService->obtenerPorId($id);
        return response()->json($representante);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $representante = $this->representanteService->obtenerPorId($id);

        $validado = $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'apellido' => 'sometimes|required|string|max:255',
            'tipo_documento' => 'sometimes|required|string|max:255',
            'numero_documento' => 'sometimes|required|string|max:255',
            'correo_electronico' => 'nullable|email|max:255',
            'telefono' => 'nullable|string|max:255',
        ]);

        $tipo = $validado['tipo_documento'] ?? $representante->tipo_documento;
        $numero = $validado['numero_documento'] ?? $representante->numero_documento;

        if ($this->representanteService->existeDocumentoDuplicado($tipo, $numero, $id)) {
            return response()->json(['message' => 'El documento ya está registrado para este tipo.'], 422);
        }

        $actualizado = $this->representanteService->actualizar($representante, $validado);

        return response()->json($actualizado);
    }

    public function destroy(int $id): JsonResponse
    {
        $representante = $this->representanteService->obtenerPorId($id);
        $this->representanteService->eliminar($representante);

        return response()->json(null, 204);
    }
}