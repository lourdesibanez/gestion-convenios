<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Envía notificaciones push a la app móvil a través del servicio de Expo.
 */
class PushService
{
    private const URL = 'https://exp.host/--/api/v2/push/send';

    /**
     * @param  array<string, mixed>  $datos  Información extra para la app (por ejemplo, a qué pantalla ir).
     */
    public function enviar(string $pushToken, string $titulo, string $mensaje, array $datos = []): void
    {
        $respuesta = Http::acceptJson()->post(self::URL, [
            'to' => $pushToken,
            'title' => $titulo,
            'body' => $mensaje,
            'data' => (object) $datos,
            'sound' => 'default',
            'priority' => 'high',
        ]);

        // Expo responde 200 aunque el envío falle; el detalle viene en data.status.
        if ($respuesta->failed() || $respuesta->json('data.status') === 'error') {
            Log::warning('No se pudo enviar el push', [
                'token' => $pushToken,
                'respuesta' => $respuesta->json(),
            ]);
        }
    }
}
