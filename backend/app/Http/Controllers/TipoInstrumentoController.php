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

        $tiposVisibles = TipoInstrumento::query()
            ->whereIn(
                'id',
                Instrumento::query()
                    ->visiblePara($request->user())
                    ->select('id_tipo_instrumento')
            );

        $tipos = (clone $tiposVisibles)
            ->whereNotNull('ambito')
            ->distinct()
            ->orderBy('ambito')
            ->pluck('ambito')
            ->map(fn (string $valor): array => [
                'valor' => $valor,
                'etiqueta' => match ($valor) {
                    'colaboracion' => 'Colaboración',
                    'pasantia' => 'Pasantía',
                    default => ucfirst($valor),
                },
            ])
            ->values();

        $categorias = (clone $tiposVisibles)
            ->whereNotNull('categoria')
            ->distinct()
            ->orderBy('categoria')
            ->pluck('categoria')
            ->map(fn (string $valor): array => [
                'valor' => $valor,
                'etiqueta' => match ($valor) {
                    'especifico' => 'Específico',
                    'marco' => 'Marco',
                    'adenda' => 'Adenda',
                    default => ucfirst($valor),
                },
            ])
            ->values();

        return response()->json([
            'data' => [
                'tipos' => $tipos,
                'categorias' => $categorias,
            ],
        ]);
    }
}
