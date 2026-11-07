<?php

namespace App\Http\Controllers;

use App\Models\Institucion;
use App\Services\InstitucionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InstitucionController extends Controller
{
    public function __construct(private InstitucionService $institucionService)
    {
    }

    public function index(): JsonResponse
    {
        return response()->json($this->institucionService->listarTodas());
    }

    public function store(Request $request): JsonResponse
    {
        $validado = $request->validate([
            'nombre' => 'required|string|max:255',
            'identificacion_fiscal' => 'required|string|max:255',
            'domicilio' => 'nullable|string|max:255',
            'id_representante' => 'nullable|integer|exists:representante,id',
            'es_interna' => 'boolean',
            'latitud' => 'nullable|numeric|between:-90,90',
            'longitud' => 'nullable|numeric|between:-180,180',
        ]);

        if ($this->institucionService->existeIdentificacionFiscal($validado['identificacion_fiscal'])) {
            return response()->json(['message' => 'La identificación fiscal ya está registrada.'], 422);
        }

        $institucion = $this->institucionService->crear($validado);

        return response()->json($institucion, 201);
    }

    public function show(int $id): JsonResponse
    {
        $institucion = $this->institucionService->obtenerPorId($id);
        return response()->json($institucion);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $institucion = $this->institucionService->obtenerPorId($id);

        $validado = $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'identificacion_fiscal' => 'sometimes|required|string|max:255',
            'domicilio' => 'nullable|string|max:255',
            'id_representante' => 'nullable|integer|exists:representante,id',
            'es_interna' => 'boolean',
            'latitud' => 'nullable|numeric|between:-90,90',
            'longitud' => 'nullable|numeric|between:-180,180',
        ]);

        $identificacion = $validado['identificacion_fiscal'] ?? $institucion->identificacion_fiscal;

        if ($this->institucionService->existeIdentificacionFiscal($identificacion, $id)) {
            return response()->json(['message' => 'La identificación fiscal ya está registrada.'], 422);
        }

        $actualizado = $this->institucionService->actualizar($institucion, $validado);

        return response()->json($actualizado);
    }

    public function destroy(int $id): JsonResponse
    {
        $institucion = $this->institucionService->obtenerPorId($id);
        $this->institucionService->eliminar($institucion);

        return response()->json(null, 204);
    }
}