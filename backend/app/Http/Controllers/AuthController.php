<?php

namespace App\Http\Controllers;

use App\Models\CodigoVerificacion;
use App\Models\Usuario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private const MINUTOS_VALIDEZ_CODIGO = 10;

    /**
     * Paso 1: valida email y contraseña y envía un código de verificación (MFA).
     * Todavía no entrega token.
     */
    public function login(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $usuario = Usuario::where('email', $datos['email'])->first();

        if (! $usuario || ! Hash::check($datos['password'], $usuario->contrasena)) {
            throw ValidationException::withMessages([
                'email' => 'Email o contraseña incorrectos.',
            ]);
        }

        if ($usuario->estaSuspendido()) {
            return response()->json(['message' => 'El usuario está suspendido.'], 403);
        }

        $codigo = (string) random_int(100000, 999999);

        $desafio = $usuario->codigosVerificacion()->create([
            'hash' => Hash::make($codigo),
            'canal' => 'mail',
            'expira_en' => now()->addMinutes(self::MINUTOS_VALIDEZ_CODIGO),
        ]);

        // Envío simulado: con MAIL_MAILER=log queda en storage/logs/laravel.log.
        Mail::raw(
            "Tu código de verificación es {$codigo}. Vence en ".self::MINUTOS_VALIDEZ_CODIGO.' minutos.',
            fn ($mensaje) => $mensaje->to($usuario->email)->subject('Código de verificación'),
        );

        return response()->json([
            'id_desafio' => $desafio->id,
            'canal' => $desafio->canal,
            'expira_en' => $desafio->expira_en,
            // Solo en desarrollo, para probar desde la app sin leer el log.
            'codigo_debug' => config('app.debug') ? $codigo : null,
        ]);
    }

    /**
     * Paso 2: valida el código y entrega el token de acceso (sin vencimiento).
     */
    public function verificarCodigo(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'id_desafio' => ['required', 'integer'],
            'codigo' => ['required', 'digits:6'],
            'dispositivo' => ['required', 'string', 'max:100'],
        ]);

        $desafio = CodigoVerificacion::with('usuario')->find($datos['id_desafio']);

        if (! $desafio || ! $desafio->estaVigente() || ! Hash::check($datos['codigo'], $desafio->hash)) {
            throw ValidationException::withMessages([
                'codigo' => 'El código es incorrecto o está vencido.',
            ]);
        }

        $desafio->update(['usado_en' => now()]);

        $usuario = $desafio->usuario;

        return response()->json([
            'token' => $usuario->createToken($datos['dispositivo'])->plainTextToken,
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
}
