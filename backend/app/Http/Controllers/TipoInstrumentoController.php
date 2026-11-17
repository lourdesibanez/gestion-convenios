<?php

namespace App\Http\Controllers;

use App\Models\Instrumento;
use App\Models\TipoInstrumento;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TipoInstrumentoController extends Controller
{
    public function listar(Request $request): JsonResponse {
        $this->authorize('viewAny', Instrumento::class);

        $tipos = TipoInstrumento::query()
            ->orderBy('nombre')
            ->get(['id', 'nombre'])
            ->map(fn (TipoInstrumento $tipo): array => [
                'valor' => (string) $tipo->id,
                'etiqueta' => $tipo->nombre,
            ])
            ->values();

        return response()->json([
            'data' => [
                'tipos' => $tipos,
            ],
        ]);
    }
}
