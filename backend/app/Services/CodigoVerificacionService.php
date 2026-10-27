<?php

namespace App\Services;

use App\Models\CodigoVerificacion;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Genera y envía los códigos de verificación del login (MFA).
 */
class CodigoVerificacionService
{
    public const MINUTOS_VALIDEZ = 5;

    public const SEGUNDOS_ESPERA_REENVIO = 60;

    /**
     * Crea un código nuevo para el usuario y lo envía por el canal indicado.
     *
     * @return array{0: CodigoVerificacion, 1: string} El desafío y el código en claro.
     */
    public function generarYEnviar(Usuario $usuario, string $canal): array
    {
        $codigo = (string) random_int(100000, 999999);

        $desafio = $usuario->codigosVerificacion()->create([
            'hash' => Hash::make($codigo),
            'canal' => $canal,
            'expira_en' => now()->addMinutes(self::MINUTOS_VALIDEZ),
        ]);

        $this->enviar($usuario, $canal, $codigo);

        return [$desafio, $codigo];
    }

    /**
     * Canales por los que se le puede mandar el código a este usuario.
     *
     * @return list<string>
     */
    public function canalesDisponibles(Usuario $usuario): array
    {
        return array_values(array_filter([
            'mail',
            $usuario->telefono ? 'sms' : null,
            $usuario->push_token ? 'push' : null,
        ]));
    }

    /**
     * Destino para mostrar en pantalla sin exponer el dato completo.
     */
    public function destinoEnmascarado(Usuario $usuario, string $canal): string
    {
        return match ($canal) {
            'mail' => $this->enmascararEmail($usuario->email),
            'sms' => '•••• '.substr($usuario->telefono, -3),
            'push' => 'tu dispositivo registrado',
        };
    }

    public function segundosParaReenviar(CodigoVerificacion $desafio): int
    {
        $disponibleDesde = $desafio->created_at->copy()->addSeconds(self::SEGUNDOS_ESPERA_REENVIO);

        return max(0, (int) ceil(now()->diffInSeconds($disponibleDesde)));
    }

    private function enviar(Usuario $usuario, string $canal, string $codigo): void
    {
        $texto = "Tu código de verificación es {$codigo}. Vence en ".self::MINUTOS_VALIDEZ.' minutos.';

        match ($canal) {
            // Con MAIL_MAILER=log queda en storage/logs/laravel.log.
            'mail' => Mail::raw($texto, fn ($mensaje) => $mensaje->to($usuario->email)->subject('Código de verificación')),
            // Simulados en el log hasta integrar un proveedor de SMS y Expo Push.
            'sms' => Log::info("SMS simulado a {$usuario->telefono}: {$texto}"),
            'push' => Log::info("Push simulado al usuario {$usuario->id}: {$texto}"),
        };
    }

    private function enmascararEmail(string $email): string
    {
        [$nombre, $dominio] = explode('@', $email, 2);

        return mb_substr($nombre, 0, 1).'•••••@'.$dominio;
    }
}
