<?php

namespace App\Services;

use App\Jobs\VerificarReciboPushExpo;
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
    public function enviarNotificacionPush(string $pushToken, string $titulo, string $mensaje, array $datos = []): void
    {
        $respuesta = Http::acceptJson()->timeout(10)->post(self::URL, [
            'to' => $pushToken,
            'title' => $titulo,
            'body' => $mensaje,
            'data' => (object) $datos,
            'sound' => 'default',
            'priority' => 'high',
        ]);

        $ticket = $respuesta->json('data');

        if ($respuesta->failed() || ($ticket['status'] ?? null) === 'error') {
            Log::warning('No se pudo enviar el push', [
                'http_status' => $respuesta->status(),
                'error_code' => $ticket['details']['error'] ?? null,
                'message' => $this->sanitizarMensaje(
                    $ticket['message'] ?? $respuesta->json('errors.0.message')
                ),
            ]);

            return;
        }

        if (($ticket['status'] ?? null) !== 'ok' || ! is_string($ticket['id'] ?? null)) {
            Log::warning('Expo no devolvió un ticket válido para el push', [
                'http_status' => $respuesta->status(),
            ]);

            return;
        }

        VerificarReciboPushExpo::dispatch($ticket['id'])->delay(now()->addMinutes(15));
    }

    private function sanitizarMensaje(?string $mensaje): ?string
    {
        if ($mensaje === null) {
            return null;
        }

        return preg_replace('/(?:Exponent|Expo)PushToken\[[^\]]+\]/', '[push-token]', $mensaje);
    }
}
