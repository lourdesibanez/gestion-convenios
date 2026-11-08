<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\OlvideContrasenaRequest;
use App\Http\Requests\Auth\ReenviarCodigoRequest;
use App\Http\Requests\Auth\RestablecerContrasenaRequest;
use App\Http\Requests\Auth\VerificarCodigoRequest;
use App\Http\Requests\TokenPushRequest;
use App\Http\Resources\DesafioAutenticacionResource;
use App\Http\Resources\EsperaReenvioResource;
use App\Http\Resources\MensajeAutenticacionResource;
use App\Http\Resources\MensajeResource;
use App\Http\Resources\TokenAutenticacionResource;
use App\Http\Resources\UsuarioResource;
use App\Services\AutenticacionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AuthController extends Controller
{
    public function __construct(private AutenticacionService $autenticacion) {}

    public function iniciarSesion(LoginRequest $request): DesafioAutenticacionResource
    {
        $datos = $request->validated();

        return new DesafioAutenticacionResource(
            $this->autenticacion->iniciarSesion($datos['email'], $datos['password'])
        );
    }

    public function verificarCodigo(VerificarCodigoRequest $request): TokenAutenticacionResource
    {
        $datos = $request->validated();

        return new TokenAutenticacionResource(
            $this->autenticacion->verificarCodigo(
                $datos['id_desafio'],
                $datos['codigo'],
                $datos['dispositivo'],
            )
        );
    }

    public function reenviarCodigo(ReenviarCodigoRequest $request): JsonResponse|DesafioAutenticacionResource
    {
        $datos = $this->autenticacion->reenviarCodigo(
            $request->validated('id_desafio'),
            $request->validated('canal'),
        );

        if ($datos['espera'] ?? false) {
            return (new EsperaReenvioResource($datos))
                ->response()
                ->setStatusCode(429);
        }

        return new DesafioAutenticacionResource($datos);
    }

    public function solicitarRestablecimientoContrasena(OlvideContrasenaRequest $request): MensajeAutenticacionResource
    {
        return new MensajeAutenticacionResource(
            $this->autenticacion->solicitarRestablecimientoContrasena($request->validated('email'))
        );
    }

    public function restablecerContrasena(RestablecerContrasenaRequest $request): MensajeResource
    {
        $datos = $request->validated();
        $this->autenticacion->restablecerContrasena(
            $datos['email'],
            $datos['codigo'],
            $datos['password'],
        );

        return new MensajeResource([
            'message' => 'Tu contraseña se actualizó. Ya podés iniciar sesión.',
        ]);
    }

    public function obtenerUsuarioAutenticado(Request $request): UsuarioResource
    {
        return new UsuarioResource($request->user());
    }

    public function cerrarSesion(Request $request): Response
    {
        $this->autenticacion->cerrarSesion($request->user());

        return response()->noContent();
    }

    public function guardarTokenPush(TokenPushRequest $request): Response
    {
        $this->autenticacion->guardarTokenPush($request->user(), $request->validated('push_token'));

        return response()->noContent();
    }
}
