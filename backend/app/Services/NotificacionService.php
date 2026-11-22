<?php

namespace App\Services;

use App\Jobs\EnviarPushExpo;
use App\Models\Instrumento;
use App\Models\Notificacion;
use App\Models\Observacion;
use App\Models\Usuario;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Throwable;

class NotificacionService
{
    /** El convenio llegó a revisión: avisa a quienes pueden aprobarlo en esa unidad. */
    public function revisionPendiente(Instrumento $instrumento, Usuario $actor): void
    {
        $this->seguro(fn () => $this->avisar(
            $this->revisores($instrumento),
            $instrumento,
            'revision_asignada',
            'Convenio pendiente de revisión',
            $this->etiqueta($instrumento).': '.$this->nombre($actor).' lo envió a revisión.',
            $actor,
        ));
    }

    /** Un revisor registró una observación: avisa al creador del convenio. */
    public function observacionNueva(Instrumento $instrumento, Usuario $autor): void
    {
        $this->seguro(fn () => $this->avisar(
            [$instrumento->created_by],
            $instrumento,
            'observacion_nueva',
            'Nueva observación',
            $this->etiqueta($instrumento).': '.$this->nombre($autor).' registró una observación.',
            $autor,
        ));
    }

    /** El creador respondió una observación: avisa a quien la hizo. */
    public function observacionRespondida(Instrumento $instrumento, Observacion $observacion, Usuario $autor): void
    {
        $this->seguro(fn () => $this->avisar(
            [$observacion->id_usuario],
            $instrumento,
            'comentario_nuevo',
            'Nuevo comentario',
            $this->etiqueta($instrumento).': '.$this->nombre($autor).' respondió tu observación.',
            $autor,
        ));
    }

    /** Cambió el estado del convenio (aprobado, devuelto): avisa al creador. */
    public function estadoCambiado(Instrumento $instrumento, Usuario $actor, string $accion): void
    {
        $this->seguro(fn () => $this->avisar(
            [$instrumento->created_by],
            $instrumento,
            'cambio_estado',
            'Cambio de estado',
            $this->etiqueta($instrumento).': '.$this->nombre($actor)." {$accion}.",
            $actor,
        ));
    }

    /** Una notificación fallida nunca debe romper la acción principal. */
    private function seguro(callable $accion): void
    {
        try {
            $accion();
        } catch (Throwable $error) {
            Log::error('Falló la generación de la notificación.', ['error' => $error->getMessage()]);
        }
    }

    /**
     * Crea una notificación por destinatario y encola el push cuando se confirma la transacción.
     *
     * @param  iterable<int>  $idsDestinatarios
     */
    private function avisar(
        iterable $idsDestinatarios,
        Instrumento $instrumento,
        string $tipo,
        string $titulo,
        string $mensaje,
        Usuario $actor,
    ): void {
        $ids = collect($idsDestinatarios)
            ->filter()
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->reject(fn (int $id) => $id === (int) $actor->id) // no avisarle a quien hizo la acción
            ->values();

        if ($ids->isEmpty()) {
            return;
        }

        foreach (Usuario::query()->whereIn('id', $ids)->get() as $destinatario) {
            if ($destinatario->estaSuspendido() || $destinatario->esConsulta()) {
                continue;
            }

            $notificacion = Notificacion::create([
                'id_usuario' => $destinatario->id,
                'id_instrumento' => $instrumento->id,
                'tipo' => $tipo,
                'mensaje' => $mensaje,
            ]);

            if (! $destinatario->push_token) {
                continue;
            }

            try {
                EnviarPushExpo::dispatch($destinatario->id, $titulo, $mensaje, [
                    'tipo' => $tipo,
                    'id_instrumento' => $instrumento->id,
                    'notificacion_id' => $notificacion->id,
                ])->afterCommit();
            } catch (Throwable $error) {
                Log::error('No se pudo encolar el push de la notificación.', [
                    'usuario_id' => $destinatario->id,
                    'notificacion_id' => $notificacion->id,
                    'error' => $error->getMessage(),
                ]);
            }
        }
    }

    /** @return Collection<int, int> ids de usuarios que pueden aprobar el convenio */
    private function revisores(Instrumento $instrumento): Collection
    {
        return Usuario::query()
            ->whereHas('perfiles', function ($query) use ($instrumento) {
                $query->activos()->where(function ($alcance) use ($instrumento) {
                    $alcance->whereNull('id_institucion')
                        ->orWhere('id_institucion', $instrumento->id_institucion);
                });
            })
            ->get()
            ->filter(function (Usuario $usuario) use ($instrumento) {
                if (! $usuario->tienePermiso('instrumento.aprobar')) {
                    return false;
                }

                $unidades = $usuario->institucionesConPermiso('instrumento.aprobar');

                return $unidades === null
                    || collect($unidades)->map(fn ($id) => (int) $id)->contains((int) $instrumento->id_institucion);
            })
            ->pluck('id');
    }

    // El código "BORRADOR-uuid" es temporal: mientras lo tenga se muestra solo el título.
    private function etiqueta(Instrumento $instrumento): string
    {
        $codigo = (string) $instrumento->codigo;

        return $codigo === '' || str_starts_with($codigo, 'BORRADOR-')
            ? $instrumento->titulo
            : "{$codigo} · {$instrumento->titulo}";
    }

    private function nombre(Usuario $usuario): string
    {
        return trim($usuario->nombre.' '.$usuario->apellido);
    }
}