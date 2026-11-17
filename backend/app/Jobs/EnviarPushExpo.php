<?php

namespace App\Jobs;

use App\Models\Usuario;
use App\Services\PushService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class EnviarPushExpo implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 15;

    /**
     * @return list<int>
     */
    public function backoff(): array
    {
        return [10, 30, 60];
    }

    /**
     * @param  array<string, mixed>  $datos
     */
    public function __construct(
        public int $idUsuario,
        public string $titulo,
        public string $mensaje,
        public array $datos,
    ) {}

    public function handle(PushService $push): void
    {
        $usuario = Usuario::query()->find($this->idUsuario);

        if (! $usuario || $usuario->estaSuspendido() || ! $usuario->push_token) {
            return;
        }

        $push->enviarNotificacionPush(
            $usuario->push_token,
            $this->titulo,
            $this->mensaje,
            $this->datos,
        );
    }
}
