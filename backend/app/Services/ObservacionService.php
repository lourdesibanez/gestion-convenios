<?php

namespace App\Services;

use App\Models\Instrumento;
use App\Models\Observacion;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ObservacionService
{
 
    public function __construct(private NotificacionService $notificaciones) {}

    public function listar(Instrumento $instrumento): Collection
    {
        return Observacion::query()
            ->with([
                'usuario:id,nombre,apellido',
                'respondidoPor:id,nombre,apellido',
            ])
            ->where('id_instrumento', $instrumento->id)
            ->orderBy('created_at')
            ->orderBy('id')
            ->get();
    }

    public function obtenerVisible(Usuario $usuario, int $id): Observacion
    {
        return Observacion::query()
            ->with([
                'usuario:id,nombre,apellido',
                'respondidoPor:id,nombre,apellido',
                'instrumento.estado',
            ])
            ->whereHas('instrumento', fn ($query) => $query->visiblePara($usuario))
            ->findOrFail($id);
    }

    public function crear(
        Instrumento $instrumento,
        Usuario $usuario,
        string $contenido
    ): Observacion {
        return DB::transaction(function () use (
            $instrumento,
            $usuario,
            $contenido
        ): Observacion {
            $bloqueado = Instrumento::query()
                ->whereKey($instrumento->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($bloqueado->estado?->nombre !== 'revision') {
                abort(409, 'Solo se pueden registrar observaciones durante la revisión.');
            }

            $observacion = Observacion::create([
                'id_instrumento' => $bloqueado->id,
                'id_usuario' => $usuario->id,
                'contenido' => $contenido,
                'estado' => 'pendiente',
            ]);

            $this->notificaciones->observacionNueva($bloqueado, $usuario);

            return $observacion->load([
                'usuario:id,nombre,apellido',
                'respondidoPor:id,nombre,apellido',
            ]);
        });
    }

    public function responder(
        Observacion $observacion,
        Usuario $usuario,
        string $respuesta
    ): Observacion {
        return DB::transaction(function () use (
            $observacion,
            $usuario,
            $respuesta
        ): Observacion {
            $instrumento = Instrumento::query()
                ->whereKey($observacion->id_instrumento)
                ->lockForUpdate()
                ->firstOrFail();

            $actual = Observacion::query()
                ->whereKey($observacion->id)
                ->lockForUpdate()
                ->firstOrFail();

            if (
                $instrumento->estado?->nombre !== 'borrador'
                || (int) $instrumento->created_by !== (int) $usuario->id
                || $actual->estado !== 'pendiente'
            ) {
                abort(409, 'La observación ya no puede responderse en el estado actual del convenio.');
            }

            $actual->update([
                'respuesta' => $respuesta,
                'respondido_por' => $usuario->id,
                'fecha_respuesta' => now(),
                'estado' => 'respondida',
            ]);

            $this->notificaciones->observacionRespondida($instrumento, $actual, $usuario);

            return $actual->load([
                'usuario:id,nombre,apellido',
                'respondidoPor:id,nombre,apellido',
            ]);
        });
    }

    public function resolver(
        Observacion $observacion
    ): Observacion {
        return DB::transaction(function () use ($observacion): Observacion {
            $instrumento = Instrumento::query()
                ->whereKey($observacion->id_instrumento)
                ->lockForUpdate()
                ->firstOrFail();

            $actual = Observacion::query()
                ->whereKey($observacion->id)
                ->lockForUpdate()
                ->firstOrFail();

            if (
                $instrumento->estado?->nombre !== 'revision'
                || $actual->estado !== 'respondida'
            ) {
                abort(409, 'Solo se pueden resolver observaciones respondidas durante la revisión.');
            }

            $actual->update([
                'estado' => 'resuelta',
                'fecha_resolucion' => now(),
            ]);

            return $actual->load([
                'usuario:id,nombre,apellido',
                'respondidoPor:id,nombre,apellido',
            ]);
        });
    }
}