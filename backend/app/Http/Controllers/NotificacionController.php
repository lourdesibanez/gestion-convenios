<?php

namespace App\Http\Controllers;

use App\Models\Notificacion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificacionController extends Controller
{
    public function listar(Request $request): JsonResponse
    {
        $usuario = $request->user();
        $notificaciones = $usuario->notificaciones()
            ->visiblesPara($usuario)
            ->with('instrumento.estado')
            ->latest('created_at')
            ->latest('id')
            ->paginate(30);

        return response()->json([
            'data' => $notificaciones->getCollection()->map(function (Notificacion $notificacion) {
                $instrumento = $notificacion->instrumento;

                return [
                    'id' => $notificacion->id,
                    'tipo' => $notificacion->tipo,
                    'mensaje' => $notificacion->mensaje,
                    'leido' => $notificacion->leido,
                    'created_at' => $notificacion->created_at?->toIso8601String(),
                    'id_instrumento' => $notificacion->id_instrumento,
                    'convenio' => $instrumento ? [
                        'codigo' => $instrumento->codigo,
                        'titulo' => $instrumento->titulo,
                        'estado' => $instrumento->estado?->nombre,
                    ] : null,
                ];
            })->values(),
            'meta' => [
                'current_page' => $notificaciones->currentPage(),
                'last_page' => $notificaciones->lastPage(),
            ],
            'unread_count' => $usuario->notificaciones()
                ->visiblesPara($usuario)
                ->where('leido', false)
                ->count(),
        ]);
    }

    public function marcarLeida(Request $request, int $id): JsonResponse
    {
        $usuario = $request->user();
        $notificacion = $usuario->notificaciones()->visiblesPara($usuario)->findOrFail($id);
        $notificacion->update(['leido' => true]);

        return response()->json(['message' => 'Notificación marcada como leída.']);
    }

    public function marcarTodasLeidas(Request $request): JsonResponse
    {
        $usuario = $request->user();
        $usuario->notificaciones()
            ->visiblesPara($usuario)
            ->where('leido', false)
            ->update(['leido' => true, 'updated_at' => now()]);

        return response()->json(['message' => 'Notificaciones marcadas como leídas.']);
    }
}
