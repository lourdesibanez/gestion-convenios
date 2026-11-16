<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class VerificarReciboPushExpo implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private const URL = 'https://exp.host/--/api/v2/push/getReceipts';

    public int $tries = 3;

    public int $timeout = 15;

    /**
     * @return list<int>
     */
    public function backoff(): array
    {
        return [60, 120, 300];
    }

    public function __construct(public string $ticketId) {}

    public function handle(): void
    {
        $respuesta = Http::acceptJson()->timeout(10)->post(self::URL, [
            'ids' => [$this->ticketId],
        ]);

        if ($respuesta->failed()) {
            throw new RuntimeException('No se pudo consultar el recibo del push en Expo.');
        }

        $recibo = $respuesta->json("data.{$this->ticketId}");

        if (! is_array($recibo)) {
            Log::warning('Expo todavía no devolvió el recibo del push.', [
                'ticket_id' => $this->ticketId,
            ]);

            return;
        }

        if (($recibo['status'] ?? null) !== 'ok') {
            Log::warning('El proveedor rechazó la entrega del push.', [
                'ticket_id' => $this->ticketId,
                'error_code' => $recibo['details']['error'] ?? null,
                'receipt_status' => $recibo['status'] ?? null,
            ]);

            return;
        }

        Log::info('El proveedor aceptó la entrega del push.', [
            'ticket_id' => $this->ticketId,
        ]);
    }
}
