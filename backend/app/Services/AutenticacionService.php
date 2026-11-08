<?php

namespace App\Services;

use App\Models\CodigoVerificacion;
use App\Models\Usuario;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Access\AuthorizationException;

class AutenticacionService
{
    public function __construct(private CodigoVerificacionService $codigos) {}

    /**
     * @return array<string, mixed>
     */
    public function iniciarSesion(string $email, string $contrasena): array
    {
        $usuario = Usuario::where('email', $email)->first();

        if (! $usuario || ! Hash::check($contrasena, $usuario->contrasena)) {
            throw ValidationException::withMessages([
                'email' => 'Email o contraseña incorrectos.',
            ]);
        }

        $this->verificarQueNoEsteSuspendido($usuario);
        [$desafio, $codigo] = $this->codigos->generarYEnviarCodigo($usuario, 'mail');

        return $this->datosDelDesafio($desafio, $codigo);
    }

    /**
     * @return array<string, mixed>
     */
    public function reenviarCodigo(int $idDesafio, string $canal): array
    {
        $anterior = CodigoVerificacion::with('usuario')->find($idDesafio);

        if (! $anterior || $anterior->usado_en) {
            throw ValidationException::withMessages([
                'id_desafio' => 'La verificación ya no es válida. Volvé a iniciar sesión.',
            ]);
        }

        $this->verificarQueNoEsteSuspendido($anterior->usuario);
        $segundos = $this->codigos->obtenerSegundosParaReenviar($anterior);

        if ($segundos > 0) {
            return [
                'espera' => true,
                'message' => "Esperá {$segundos} segundos para pedir otro código.",
                'segundos_restantes' => $segundos,
            ];
        }

        if (! in_array($canal, $this->codigos->obtenerCanalesDisponibles($anterior->usuario), true)) {
            throw ValidationException::withMessages([
                'canal' => 'Ese canal no está disponible para tu usuario.',
            ]);
        }

        [$desafio, $codigo] = DB::transaction(function () use ($anterior, $canal) {
            $anterior->update(['usado_en' => now()]);

            return $this->codigos->generarYEnviarCodigo($anterior->usuario, $canal, $anterior->proposito);
        });

        return $this->datosDelDesafio($desafio, $codigo);
    }

    /**
     * @return array{token: string, usuario: Usuario}
     */
    public function verificarCodigo(int $idDesafio, string $codigo, string $dispositivo): array
    {
        $desafio = CodigoVerificacion::with('usuario')->find($idDesafio);

        if (! $desafio
            || $desafio->proposito !== 'login'
            || ! $desafio->estaVigente()
            || ! Hash::check($codigo, $desafio->hash)) {
            throw ValidationException::withMessages([
                'codigo' => 'El código es incorrecto o está vencido.',
            ]);
        }

        $usuario = $desafio->usuario;
        $this->verificarQueNoEsteSuspendido($usuario);

        return DB::transaction(function () use ($desafio, $usuario, $dispositivo) {
            $desafio->update(['usado_en' => now()]);

            return [
                'token' => $usuario->createToken($dispositivo)->plainTextToken,
                'usuario' => $usuario,
            ];
        });
    }

    public function cerrarSesion(Usuario $usuario): void
    {
        $usuario->currentAccessToken()->delete();
    }

    /**
     * @return array<string, mixed>
     */
    public function solicitarRestablecimientoContrasena(string $email): array
    {
        $usuario = Usuario::where('email', $email)->first();
        $codigo = null;

        if ($usuario && ! $usuario->estaSuspendido()) {
            [, $codigo] = $this->codigos->generarYEnviarCodigo($usuario, 'mail', 'reset');
        }

        return [
            'message' => 'Si el correo está registrado, te enviamos un código para restablecer la contraseña.',
            'expira_en_minutos' => CodigoVerificacionService::MINUTOS_VALIDEZ,
            'codigo_debug' => $codigo,
        ];
    }

    public function restablecerContrasena(string $email, string $codigo, string $contrasena): void
    {
        $usuario = Usuario::where('email', $email)->first();
        $desafio = $usuario?->codigosVerificacion()
            ->where('proposito', 'reset')
            ->latest('id')
            ->first();

        if (! $desafio || ! $desafio->estaVigente() || ! Hash::check($codigo, $desafio->hash)) {
            throw ValidationException::withMessages([
                'codigo' => 'El código es incorrecto o está vencido.',
            ]);
        }

        DB::transaction(function () use ($desafio, $usuario, $contrasena): void {
            $desafio->update(['usado_en' => now()]);
            $usuario->update(['contrasena' => $contrasena]);
            $usuario->tokens()->delete();
        });
    }

    public function guardarTokenPush(Usuario $usuario, string $token): void
    {
        $usuario->forceFill(['push_token' => $token])->save();
    }

    /**
     * @return array<string, mixed>
     */
    private function datosDelDesafio(CodigoVerificacion $desafio, string $codigo): array
    {
        $usuario = $desafio->usuario;

        return [
            'id_desafio' => $desafio->id,
            'canal' => $desafio->canal,
            'destino' => $this->codigos->obtenerDestinoEnmascarado($usuario, $desafio->canal),
            'canales_disponibles' => $this->codigos->obtenerCanalesDisponibles($usuario),
            'expira_en' => $desafio->expira_en,
            'reenviar_en_segundos' => CodigoVerificacionService::SEGUNDOS_ESPERA_REENVIO,
            'codigo_debug' => $codigo,
        ];
    }

    private function verificarQueNoEsteSuspendido(Usuario $usuario): void
    {
        if ($usuario->estaSuspendido()) {
            throw new AuthorizationException('El usuario está suspendido.');
        }
    }
}
