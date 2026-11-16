<?php

namespace Tests\Feature;

use App\Jobs\VerificarReciboPushExpo;
use App\Services\PushService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Queue;
use Mockery;
use Tests\TestCase;

class PushServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_encola_la_verificacion_del_recibo_cuando_expo_acepta_el_push(): void
    {
        Queue::fake();
        Http::fake([
            'https://exp.host/--/api/v2/push/send' => Http::response([
                'data' => [
                    'status' => 'ok',
                    'id' => 'ticket-de-prueba',
                ],
            ]),
        ]);

        app(PushService::class)->enviarNotificacionPush(
            'ExponentPushToken[prueba]',
            'Prueba',
            'Mensaje de prueba',
        );

        Queue::assertPushed(VerificarReciboPushExpo::class, fn ($job) => $job->ticketId === 'ticket-de-prueba');
    }

    public function test_registra_el_codigo_de_error_devuelto_por_fcm_en_el_recibo(): void
    {
        Http::fake([
            'https://exp.host/--/api/v2/push/getReceipts' => Http::response([
                'data' => [
                    'ticket-de-prueba' => [
                        'status' => 'error',
                        'details' => ['error' => 'InvalidCredentials'],
                    ],
                ],
            ]),
        ]);
        Log::spy();

        (new VerificarReciboPushExpo('ticket-de-prueba'))->handle();

        Log::shouldHaveReceived('warning')
            ->once()
            ->with(
                'El proveedor rechazó la entrega del push.',
                Mockery::on(fn (array $context) => $context['error_code'] === 'InvalidCredentials'),
            );
    }
}
