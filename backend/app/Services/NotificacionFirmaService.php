<?php

namespace App\Services;

use App\Jobs\EnviarPushExpo;
use App\Models\Firma;
use App\Models\Instrumento;
use App\Models\Notificacion;
use App\Models\Usuario;
use Illuminate\Support\Facades\Log;
use Throwable;

class NotificacionFirmaService
{
    /**
     * Crea avisos por cada firma para el creador y firmantes, y el aviso final para Consulta.
     *
     * @return list<array{usuario_id: int, notificacion_id: int, titulo: string, mensaje: string, datos: array<string, mixed>}>
     */
    public function registrarFirma(Instrumento $instrumento, Usuario $firmante, bool $convenioCompleto): array
    {
        $idsDestinatarios = collect([$instrumento->created_by])
            ->merge(Firma::query()
                ->where('id_instrumento', $instrumento->id)
                ->pluck('id_usuario'))
            ->filter()
            ->unique()
            ->values();

        $nombreFirmante = trim($firmante->nombre.' '.$firmante->apellido);
        $mensajeFirma = "{$instrumento->codigo} · {$instrumento->titulo}: {$nombreFirmante} registró una firma.";

        if ($convenioCompleto) {
            $mensajeFirma .= ' El convenio quedó firmado por todas las partes.';
        }

        $pushes = [];

        foreach (Usuario::query()->whereIn('id', $idsDestinatarios)->get() as $destinatario) {
            if ($destinatario->estaSuspendido() || $destinatario->esConsulta()) {
                continue;
            }

            $push = $this->crearNotificacion(
                $destinatario,
                $instrumento,
                'firma_registrada',
                'Firma registrada',
                $mensajeFirma,
                'firma_registrada',
            );

            if ($push) {
                $pushes[] = $push;
            }
        }

        if ($convenioCompleto) {
            $consultas = Usuario::query()
                ->whereHas('perfiles', function ($query) use ($instrumento) {
                    $query->activos()
                        ->where(function ($alcance) use ($instrumento) {
                            $alcance->whereNull('id_institucion')
                                ->orWhere('id_institucion', $instrumento->id_institucion);
                        })
                        ->whereHas('perfil', fn ($perfil) => $perfil->where('nombre', 'consulta'));
                })
                ->get();

            $mensajeFinal = "{$instrumento->codigo} · {$instrumento->titulo} quedó firmado por todas las partes.";

            foreach ($consultas as $destinatario) {
                if ($destinatario->estaSuspendido()) {
                    continue;
                }

                $push = $this->crearNotificacion(
                    $destinatario,
                    $instrumento,
                    'convenio_firmado',
                    'Convenio firmado',
                    $mensajeFinal,
                    'convenio_firmado',
                );

                if ($push) {
                    $pushes[] = $push;
                }
            }
        }

        return $pushes;
    }

    /**
     * @param  list<array{usuario_id: int, notificacion_id: int, titulo: string, mensaje: string, datos: array<string, mixed>}>  $pushes
     */
    public function despacharPushes(array $pushes): void
    {
        foreach ($pushes as $push) {
            try {
                EnviarPushExpo::dispatch(
                    $push['usuario_id'],
                    $push['titulo'],
                    $push['mensaje'],
                    $push['datos'],
                );
            } catch (Throwable $error) {
                Log::error('No se pudo encolar el push de una notificación de firma.', [
                    'usuario_id' => $push['usuario_id'],
                    'notificacion_id' => $push['notificacion_id'],
                    'error' => $error->getMessage(),
                ]);
            }
        }
    }

    /**
     * @return array{usuario_id: int, notificacion_id: int, titulo: string, mensaje: string, datos: array<string, mixed>}|null
     */
    private function crearNotificacion(
        Usuario $destinatario,
        Instrumento $instrumento,
        string $tipo,
        string $titulo,
        string $mensaje,
        string $tipoPush,
    ): ?array {
        $notificacion = Notificacion::create([
            'id_usuario' => $destinatario->id,
            'id_instrumento' => $instrumento->id,
            'tipo' => $tipo,
            'mensaje' => $mensaje,
        ]);

        if (! $destinatario->push_token) {
            return null;
        }

        return [
            'usuario_id' => $destinatario->id,
            'notificacion_id' => $notificacion->id,
            'titulo' => $titulo,
            'mensaje' => $mensaje,
            'datos' => [
                'tipo' => $tipoPush,
                'id_instrumento' => $instrumento->id,
                'notificacion_id' => $notificacion->id,
            ],
        ];
    }
}
