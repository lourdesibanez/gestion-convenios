<?php

namespace App\Http\Controllers;

use App\Http\Requests\IdentidadBiometriaRequest;
use App\Http\Requests\IdentidadFirmaRequest;
use App\Http\Resources\IdentidadResource;
use App\Services\IdentidadService;
use Illuminate\Http\Request;

// Cada usuario solo ve y modifica su propia identidad: todo sale de $request->user().
class IdentidadController extends Controller
{
    public function __construct(
        private IdentidadService $identidades,
    ) {}

    public function obtener(Request $request): IdentidadResource
    {
        return new IdentidadResource($this->identidades->obtener($request->user()));
    }

    public function guardarFirma(IdentidadFirmaRequest $request): IdentidadResource
    {
        return new IdentidadResource(
            $this->identidades->guardarFirma($request->user(), $request->validated('firma')),
        );
    }

    public function registrarBiometria(IdentidadBiometriaRequest $request): IdentidadResource
    {
        return new IdentidadResource(
            $this->identidades->registrarBiometria($request->user(), $request->validated('tipo')),
        );
    }
}
