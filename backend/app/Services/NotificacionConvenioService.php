<?php

namespace App\Services;

use App\Jobs\EnviarPushExpo;
use App\Models\Instrumento;
use App\Models\Notificacion;
use App\Models\Usuario;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Notificaciones vía API de los cambios de un convenio.
 * Cada aviso queda en la tabla notificacion (pantalla Notificaciones de la app)
 * y, si el usuario tiene el celular registrado, se le manda un push por Expo.
 */
class NotificacionConvenioService
{
    public function nuevoConvenio(Instrumento $instrumento, Usuario $autor): void
    {
        $this->notificar(
            $instrumento,
            $autor,
            'convenio_nuevo',
            'Nuevo convenio',
            "{$this->nombre($autor)} registró el convenio «{$instrumento->titulo}».",
        );
    }

    public function nuevoComentario(Instrumento $instrumento, Usuario $autor): void
    {
        // No se repite el texto: puede ser ofensivo y solo lo ven los usuarios del convenio.
        $this->notificar(
            $instrumento,
            $autor,
            'comentario_nuevo',
            'Nuevo comentario',
            "{$this->nombre($autor)} comentó en «{$instrumento->titulo}».",
        );
    }

    public function cambioDeDatos(Instrumento $instrumento, Usuario $autor): void
    {
        $this->notificar(
            $instrumento,
            $autor,
            'convenio_modificado',
            'Cambios en un convenio',
            "{$this->nombre($autor)} modificó los datos de «{$instrumento->titulo}».",
        );
    }

    private function notificar(
        Instrumento $instrumento,
        Usuario $autor,
        string $tipo,
        string $titulo,
        string $mensaje,
    ): void {
        foreach ($this->destinatarios($instrumento, $autor) as $destinatario) {
            $notificacion = Notificacion::create([
                'id_usuario' => $destinatario->id,
                'id_instrumento' => $instrumento->id,
                'tipo' => $tipo,
                'mensaje' => $mensaje,
            ]);

            if (! $destinatario->push_token) {
                continue; // sin celular registrado: solo queda en la pantalla Notificaciones
            }

            try {
                EnviarPushExpo::dispatch($destinatario->id, $titulo, $mensaje, [
                    'tipo' => $tipo,
                    'id_instrumento' => $instrumento->id, // la app abre este convenio al tocar
                    'notificacion_id' => $notificacion->id,
                ]);
            } catch (Throwable $error) {
                // Si falla el push, el aviso igual quedó guardado.
                Log::error('No se pudo encolar el push de una notificación de convenio.', [
                    'usuario_id' => $destinatario->id,
                    'tipo' => $tipo,
                    'error' => $error->getMessage(),
                ]);
            }
        }
    }

    /**
     * Usuarios con perfil activo en la unidad del convenio (o global),
     * sin el autor de la acción, suspendidos ni perfiles de consulta.
     *
     * @return Collection<int, Usuario>
     */
    private function destinatarios(Instrumento $instrumento, Usuario $autor): Collection
    {
        return Usuario::query()
            ->where('id', '!=', $autor->id)
            ->whereHas('perfiles', function ($query) use ($instrumento) {
                $query->activos()->where(function ($alcance) use ($instrumento) {
                    $alcance->whereNull('id_institucion')
                        ->orWhere('id_institucion', $instrumento->id_institucion);
                });
            })
            ->get()
            ->reject(fn (Usuario $usuario) => $usuario->estaSuspendido() || $usuario->esConsulta())
            ->values();
    }

    private function nombre(Usuario $usuario): string
    {
        return trim("{$usuario->nombre} {$usuario->apellido}");
    }
}
