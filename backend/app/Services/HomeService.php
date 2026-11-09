<?php

namespace App\Services;

use App\Models\Firma;
use App\Models\Instrumento;
use App\Models\Usuario;
use App\Models\UsuarioInstrumento;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Datos de la pantalla de inicio, siempre dentro del alcance del usuario.
 */
class HomeService
{
    public const DIAS_PROXIMO_VENCIMIENTO = 30;

    public const MAX_PENDIENTES = 3;

    public const MAX_MOVIMIENTOS = 10;

    public function obtenerDatos(Usuario $usuario): array
    {
        return [
            'usuario'                   => $this->construirEncabezado($usuario),
            'notificaciones_sin_leer'   => $usuario->notificaciones()->where('leido', false)->count(),
            'resumen'                   => $this->calcularResumen($usuario),
            'pendientes'                => $this->listarPendientes($usuario),
            'ultimos_movimientos'       => $this->listarUltimosMovimientos($usuario),
            'estados'                   => $this->contarPorEstado($usuario),
            'firmados_por_anio'         => $this->firmadosPorAnio($usuario),
            'proximos_a_vencer'         => $this->proximosAVencer($usuario),
            'distribucion_por_unidad'   => $this->personasPorUnidad($usuario),
        ];
    }

    private function construirEncabezado(Usuario $usuario): array
    {
        $perfil = $usuario->perfiles()->activos()->with('institucion')->oldest('id')->first();

        return [
            'nombre'        => $usuario->nombre,
            'apellido'      => $usuario->apellido,
            'iniciales'     => mb_strtoupper(mb_substr($usuario->nombre, 0, 1).mb_substr($usuario->apellido, 0, 1)),
            'unidad'        => $perfil?->institucion?->nombre ?? 'Alcance global',
        ];
    }

    private function calcularResumen(Usuario $usuario): array
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
    private function listarPendientes(Usuario $usuario): array
    {
        $pendientes = $usuario->firmas()->pendientes();

        $items = (clone $pendientes)
            ->with('instrumento.tipo')
            ->latest()
            ->limit(self::MAX_PENDIENTES)
            ->get()
            ->map(fn (Firma $firma) => [
                'uuid'              => $firma->instrumento->uuid,
                'id_instrumento'    => $firma->instrumento->id,
                'codigo'            => $firma->instrumento->codigo,
                'titulo'            => $firma->instrumento->titulo,
                'tipo'              => $firma->instrumento->tipo->nombre,
                'asignado_en'       => $firma->created_at,
            ]);

        return [
            'total' => $pendientes->count(),
            'items' => $items,
        ];
    }

    /**
     * Instrumentos con acciones registradas, del movimiento más reciente al más antiguo.
     */
    private function listarUltimosMovimientos(Usuario $usuario): array
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

    private function contarPorEstado(Usuario $usuario): array
    {
        $conteos = DB::table('instrumento as i')
            ->join('estado as e', 'e.id', '=', 'i.id_estado')
            ->whereIn('i.id', Instrumento::visiblePara($usuario)->select('id'))
            ->select('e.nombre as estado')
            ->selectRaw('COUNT(*) as total')
            ->groupBy('e.nombre')
            ->pluck('total', 'estado');

        return collect([
            'borrador', 'revision', 'aprobado',
            'firmado', 'rescindido', 'archivado',
        ])->map(fn ($estado) => [
            'estado' => $estado,
            'total' => (int) ($conteos[$estado] ?? 0),
        ])->all();
    }

    private function firmadosPorAnio(Usuario $usuario): array
    {
        $anioActual = (int) now()->format('Y');

        return collect(range($anioActual - 5, $anioActual))
            ->map(fn ($anio) => [
                'anio' => $anio,
                'total' => Instrumento::visiblePara($usuario)
                    ->whereBetween('fecha_firma', ["{$anio}-01-01", "{$anio}-12-31"])
                    ->count(),
            ])
            ->all();
    }

    private function proximosAVencer(Usuario $usuario): array
    {
        return Instrumento::visiblePara($usuario)
            ->vigentes()
            ->whereDate('fecha_fin', '>=', today())
            ->orderBy('fecha_fin')
            ->limit(4)
            ->get(['uuid', 'codigo', 'titulo', 'fecha_fin'])
            ->map(fn (Instrumento $instrumento) => [
                'uuid' => $instrumento->uuid,
                'codigo' => $instrumento->codigo,
                'titulo' => $instrumento->titulo,
                'fecha_fin' => $instrumento->fecha_fin->toDateString(),
                'dias' => today()->diffInDays($instrumento->fecha_fin),
            ])
            ->all();
    }

    private function consultaPersonasVisibles(Usuario $usuario)
    {
        return DB::table('representante_instrumento as ri')
            ->join('instrumento as i', 'i.id', '=', 'ri.id_instrumento')
            ->join('representante as r', 'r.id', '=', 'ri.id_representante')
            ->whereIn('i.id', Instrumento::visiblePara($usuario)->select('id'))
            ->whereNull('ri.deleted_at')
            ->whereNull('r.deleted_at');
    }

    private function personasPorUnidad(Usuario $usuario): array
    {
        return $this->consultaPersonasVisibles($usuario)
            ->join('institucion as u', 'u.id', '=', 'i.id_institucion')
            ->select('u.nombre as unidad')
            ->selectRaw('COUNT(DISTINCT ri.id_representante) as total')
            ->groupBy('u.id', 'u.nombre')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(fn ($fila) => [
                'unidad' => $fila->unidad,
                'total' => (int) $fila->total,
            ])
            ->all();
    }
}
