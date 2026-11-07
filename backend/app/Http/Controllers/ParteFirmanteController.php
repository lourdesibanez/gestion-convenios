<?php

namespace App\Http\Controllers;

use App\Models\ParteFirmante;
use App\Services\ParteFirmanteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParteFirmanteController extends Controller
{
    public function __construct(private ParteFirmanteService $parteFirmanteService)
    {
    }

    public function index(): JsonResponse
    {
        return response()->json($this->parteFirmanteService->listarTodas());
    }

    public function store(Request $request): JsonResponse
    {
        $validado = $request->validate([
            'id_institucion' => 'required|integer|exists:institucion,id',
            'id_instrumento' => 'required|integer|exists:instrumento,id',
            'fecha_firma' => 'nullable|date',
        ]);

        if ($this->parteFirmanteService->existeVinculoDuplicado($validado['id_institucion'], $validado['id_instrumento'])) {
            return response()->json(['message' => 'La institución ya es parte firmante de este instrumento.'], 422);
        }

        $parte = $this->parteFirmanteService->crear($validado);

        return response()->json($parte, 201);
    }

    public function show(int $id): JsonResponse
    {
        $parte = $this->parteFirmanteService->obtenerPorId($id);
        return response()->json($parte);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $parte = $this->parteFirmanteService->obtenerPorId($id);

        $validado = $request->validate([
            'id_institucion' => 'sometimes|required|integer|exists:institucion,id',
            'id_instrumento' => 'sometimes|required|integer|exists:instrumento,id',
            'fecha_firma' => 'nullable|date',
        ]);

        $idInstitucion = $validado['id_institucion'] ?? $parte->id_institucion;
        $idInstrumento = $validado['id_instrumento'] ?? $parte->id_instrumento;

        if ($this->parteFirmanteService->existeVinculoDuplicado($idInstitucion, $idInstrumento, $id)) {
            return response()->json(['message' => 'La institución ya es parte firmante de este instrumento.'], 422);
        }

        $actualizado = $this->parteFirmanteService->actualizar($parte, $validado);

        return response()->json($actualizado);
    }

    public function destroy(int $id): JsonResponse
    {
        $parte = $this->parteFirmanteService->obtenerPorId($id);
        $this->parteFirmanteService->eliminar($parte);

        return response()->json(null, 204);
    }
}