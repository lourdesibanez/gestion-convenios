<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\OlvideContrasenaRequest;
use App\Http\Requests\Auth\RestablecerContrasenaRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\ReenviarCodigoRequest;
use App\Http\Requests\Auth\VerificarCodigoRequest;
use App\Models\CodigoVerificacion;
use App\Models\Usuario;
use App\Services\CodigoVerificacionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(private CodigoVerificacionService $codigos) {}

    /**
     * Paso 1: valida email y contraseña y envía un código de verificación por mail.
     * Todavía no entrega token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $usuario = Usuario::where('email', $request->validated('email'))->first();

        if (! $usuario || ! Hash::check($request->validated('password'), $usuario->contrasena)) {
            throw ValidationException::withMessages([
                'email' => 'Email o contraseña incorrectos.',
            ]);
        }

        if ($usuario->estaSuspendido()) {
            return response()->json(['message' => 'El usuario está suspendido.'], 403);
        }

        [$desafio, $codigo] = $this->codigos->generarYEnviar($usuario, 'mail');

        return response()->json($this->respuestaDesafio($desafio, $codigo));
    }

    /**
     * Anula el código anterior y envía uno nuevo por el canal elegido.
     */
    public function reenviarCodigo(ReenviarCodigoRequest $request): JsonResponse
    {
        $anterior = CodigoVerificacion::with('usuario')->find($request->validated('id_desafio'));

        if (! $anterior || $anterior->usado_en) {
            throw ValidationException::withMessages([
                'id_desafio' => 'La verificación ya no es válida. Volvé a iniciar sesión.',
            ]);
        }

        $segundos = $this->codigos->segundosParaReenviar($anterior);

        if ($segundos > 0) {
            return response()->json([
                'message' => "Esperá {$segundos} segundos para pedir otro código.",
                'segundos_restantes' => $segundos,
            ], 429);
        }

        $canal = $request->validated('canal');

        if (! in_array($canal, $this->codigos->canalesDisponibles($anterior->usuario))) {
            throw ValidationException::withMessages([
                'canal' => 'Ese canal no está disponible para tu usuario.',
            ]);
        }

        // Un desafío reenviado queda anulado: solo vale el último código.
        $anterior->update(['usado_en' => now()]);

        [$desafio, $codigo] = $this->codigos->generarYEnviar($anterior->usuario, $canal, $anterior->proposito);


        return response()->json($this->respuestaDesafio($desafio, $codigo));
    }

    /**
     * Paso 2: valida el código y entrega el token de acceso (sin vencimiento).
     */
    public function verificarCodigo(VerificarCodigoRequest $request): JsonResponse
    {
        $desafio = CodigoVerificacion::with('usuario')->find($request->validated('id_desafio'));

        if (! $desafio || $desafio->proposito !== 'login' || ! $desafio->estaVigente() || ! Hash::check($request->validated('codigo'), $desafio->hash)) {
            throw ValidationException::withMessages([
                'codigo' => 'El código es incorrecto o está vencido.',
            ]);
        }

        $desafio->update(['usado_en' => now()]);

        $usuario = $desafio->usuario;

        return response()->json([
            'token' => $usuario->createToken($request->validated('dispositivo'))->plainTextToken,
            'usuario' => $usuario,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    /**
     * Cierra la sesión solo en el dispositivo actual.
     */
    public function logout(Request $request): Response
    {
        $request->user()->currentAccessToken()->delete();

        return response()->noContent();
    }

    /**
     * Datos que necesita la pantalla de verificación.
     */
    private function respuestaDesafio(CodigoVerificacion $desafio, string $codigo): array
    {
        $usuario = $desafio->usuario;

        return [
            'id_desafio' => $desafio->id,
            'canal' => $desafio->canal,
            'destino' => $this->codigos->destinoEnmascarado($usuario, $desafio->canal),
            'canales_disponibles' => $this->codigos->canalesDisponibles($usuario),
            'expira_en' => $desafio->expira_en,
            'reenviar_en_segundos' => CodigoVerificacionService::SEGUNDOS_ESPERA_REENVIO,
            // Solo en desarrollo, para probar desde la app sin leer el log.
            'codigo_debug' => config('app.debug') ? $codigo : null,
        ];
    }

    /*Recuperar contraseña, paso 1: envía un código al mail si el usuario existe.
    Responde lo mismo exista o no, para no revelar qué emails están registrados.*/
    public function olvideContrasena(OlvideContrasenaRequest $request): JsonResponse {
        $usuario = Usuario::where('email', $request->validated('email'))->first();
        $codigo = null;

        if ($usuario && ! $usuario->estaSuspendido()) {
            [, $codigo] = $this->codigos->generarYEnviar($usuario, 'mail', 'reset');
        }

        return response()->json([
            'message' => 'Si el correo está registrado, te enviamos un código para restablecer la contraseña.',
            'expira_en_minutos' => CodigoVerificacionService::MINUTOS_VALIDEZ,
            // Solo en desarrollo, para probar desde la app sin leer el log.
            'codigo_debug' => config('app.debug') ? $codigo : null,
        ]);
    }

    /* Recuperar contraseña, paso 2: valida el código, cambia la contraseña
     * y cierra todas las sesiones abiertas del usuario.*/
    public function restablecerContrasena(RestablecerContrasenaRequest $request): JsonResponse {
        $usuario = Usuario::where('email', $request->validated('email'))->first();

        // Solo vale el último código de reset pedido.
        $desafio = $usuario?->codigosVerificacion()
            ->where('proposito', 'reset')
            ->latest('id')
            ->first();

        if (! $desafio || ! $desafio->estaVigente() || ! Hash::check($request->validated('codigo'), $desafio->hash)) {
            throw ValidationException::withMessages([
                'codigo' => 'El código es incorrecto o está vencido.',
            ]);
        }

        $desafio->update(['usado_en' => now()]);
        $usuario->update(['contrasena' => $request->validated('password')]);
        $usuario->tokens()->delete();

        return response()->json([
            'message' => 'Tu contraseña se actualizó. Ya podés iniciar sesión.',
        ]);
    }

}
