<?php

namespace App\Services;

use App\Models\Firma;
use App\Models\Instrumento;
use App\Models\Usuario;
use App\Models\UsuarioInstrumento;
use Illuminate\Support\Carbon;

/**
 * Datos de la pantalla de inicio, siempre dentro del alcance del usuario.
 */
class HomeService
{
    public const DIAS_PROXIMO_VENCIMIENTO = 30;

    public const MAX_PENDIENTES = 3;

    public const MAX_MOVIMIENTOS = 10;

    public function datosPara(Usuario $usuario): array
    {
        return [
            'usuario' => $this->encabezado($usuario),
            'notificaciones_sin_leer' => $usuario->notificaciones()->where('leido', false)->count(),
            'resumen' => $this->resumen($usuario),
            'pendientes' => $this->pendientes($usuario),
            'ultimos_movimientos' => $this->ultimosMovimientos($usuario),
        ];
    }

    private function encabezado(Usuario $usuario): array
    {
        $perfil = $usuario->perfiles()->activos()->with('institucion')->oldest('id')->first();

        return [
            'nombre' => $usuario->nombre,
            'apellido' => $usuario->apellido,
            'iniciales' => mb_strtoupper(mb_substr($usuario->nombre, 0, 1).mb_substr($usuario->apellido, 0, 1)),
            'unidad' => $perfil?->institucion?->nombre ?? 'Alcance global',
        ];
    }

    private function resumen(Usuario $usuario): array
    {
        $visibles = fn () => Instrumento::visiblePara($usuario);
        $hoy = today();

        return [
            'firmados_ultimo_anio' => $visibles()
                ->where('fecha_firma', '>=', $hoy->copy()->subYear()->toDateString())
                ->count(),
            'vigentes' => $visibles()->vigentes()->count(),
            'en_tramite' => $visibles()->enEstado('borrador', 'revision', 'aprobado')->count(),
            'vencen_30_dias' => $visibles()->vigentes()
                ->whereBetween('fecha_fin', [$hoy->toDateString(), $hoy->copy()->addDays(self::DIAS_PROXIMO_VENCIMIENTO)->toDateString()])
                ->count(),
        ];
    }

    /**
     * Firmas asignadas al usuario, de la más reciente a la más antigua.
     * Ser firmante asignado da acceso al instrumento aunque no sea de su unidad.
     */
    private function pendientes(Usuario $usuario): array
    {
        $pendientes = $usuario->firmas()->pendientes();

        $items = (clone $pendientes)
            ->with('instrumento.tipo')
            ->latest()
            ->limit(self::MAX_PENDIENTES)
            ->get()
            ->map(fn (Firma $firma) => [
                'uuid' => $firma->instrumento->uuid,
                'codigo' => $firma->instrumento->codigo,
                'titulo' => $firma->instrumento->titulo,
                'tipo' => $firma->instrumento->tipo->nombre,
                'asignado_en' => $firma->created_at,
            ]);

        return [
            'total' => $pendientes->count(),
            'items' => $items,
        ];
    }

    /**
     * Instrumentos con acciones registradas, del movimiento más reciente al más antiguo.
     */
    private function ultimosMovimientos(Usuario $usuario): array
    {
        $ultimos = UsuarioInstrumento::query()
            ->selectRaw('id_instrumento, max(created_at) as fecha')
            ->whereIn('id_instrumento', Instrumento::visiblePara($usuario)->select('id'))
            ->groupBy('id_instrumento')
            ->orderByDesc('fecha')
            ->limit(self::MAX_MOVIMIENTOS)
            ->get();

        $instrumentos = Instrumento::with('estado')
            ->whereIn('id', $ultimos->pluck('id_instrumento'))
            ->get()
            ->keyBy('id');

        return $ultimos->map(function ($movimiento) use ($instrumentos) {
            $instrumento = $instrumentos[$movimiento->id_instrumento];

            return [
                'uuid' => $instrumento->uuid,
                'codigo' => $instrumento->codigo,
                'titulo' => $instrumento->titulo,
                'estado' => $instrumento->estado->nombre,
                'fecha' => Carbon::parse($movimiento->fecha),
            ];
        })->all();
    }
}
