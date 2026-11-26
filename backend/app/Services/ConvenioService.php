<?php

namespace App\Services;

use App\Models\Estado;
use App\Models\Institucion;
use App\Models\Instrumento;
use App\Models\TipoInstrumento;
use App\Models\Usuario;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Query\Builder;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ConvenioService
{
    private const ESTADOS_PUBLICOS = ['firmado'];

    public function __construct(private NotificacionService $notificaciones) {}

    /**
     * @return array{
     *     puede_crear: bool,
     *     tipos: Collection<int, TipoInstrumento>,
     *     instituciones: Collection<int, Institucion>
     * }
     */

    public function __construct(private NotificacionConvenioService $notificaciones) {}

    public function opcionesCreacion(Usuario $usuario): array
    {
        // Solo las unidades donde puede crear (permisos por rol y unidad).
        $institucionesPermitidas = $usuario->institucionesConPermiso('instrumento.crear');
        $instituciones = Institucion::query()
            ->where('es_interna', true)
            ->when(
                $institucionesPermitidas !== null,
                fn ($query) => $query->whereIn('id', $institucionesPermitidas),
            )
            ->orderBy('nombre')
            ->get(['id', 'nombre']);

        return [
            'puede_crear' => $usuario->tienePermiso('instrumento.crear'),
            'tipos' => TipoInstrumento::query()
                ->orderBy('nombre')
                ->get(['id', 'nombre']),
            'instituciones' => $instituciones,
        ];
    }

    /**
     * @param  array<string, mixed>  $datos
     */
    public function crear(Usuario $usuario, array $datos): Instrumento
    {
        $instrumento = DB::transaction(function () use ($usuario, $datos): Instrumento {
            $instrumento = Instrumento::create([
                'codigo' => 'BORRADOR-'.Str::uuid(),
                'titulo' => $datos['titulo'],
                'id_tipo_instrumento' => $datos['id_tipo_instrumento'],
                'id_institucion' => $datos['id_institucion'],
                'id_estado' => Estado::where('nombre', 'borrador')->value('id'),
                'fecha_inicio' => $datos['fecha_inicio'] ?? null,
                'fecha_fin' => $datos['fecha_fin'] ?? null,
                'fecha_preaviso' => $datos['fecha_preaviso'] ?? null,
                'numero_resolucion' => $datos['numero_resolucion'] ?? null,
                'referencia_expediente' => $datos['referencia_expediente'] ?? null,
                'notas' => $datos['notas'] ?? null,
            ]);

            DB::table('convenio')->insert([
                'id_instrumento' => $instrumento->id,
                'objeto' => $datos['objeto'] ?? null,
                'marco_legal' => $datos['marco_legal'] ?? null,
                'obligaciones' => $datos['obligaciones'] ?? null,
                'condiciones_terminacion' => $datos['condiciones_terminacion'] ?? null,
                'condiciones_renovacion' => $datos['condiciones_renovacion'] ?? null,
                'confidencialidad' => $datos['confidencialidad'] ?? null,
                'alcance_actividades' => $datos['alcance_actividades'] ?? null,
                'created_at' => now(),
                'created_by' => $usuario->id,
            ]);

            // Se avisa recién cuando quedó guardado
            $this->notificaciones->nuevoConvenio($instrumento, $usuario);

            return $instrumento->load(['tipo', 'institucion', 'estado']);
        });
    }

    /**
     * @param  array<string, mixed>  $datos
     */
    public function actualizar(Usuario $usuario, Instrumento $instrumento, array $datos): Instrumento
    {
        $actualizado = DB::transaction(function () use ($usuario, $instrumento, $datos): Instrumento {
            $actualizado = DB::table('instrumento')
                ->where('id', $instrumento->id)
                ->whereNull('deleted_at')
                ->where('created_by', $usuario->id)
                ->where('id_estado', Estado::where('nombre', 'borrador')->value('id'))
                ->where('version', $datos['version'])
                ->update([
                    'titulo' => $datos['titulo'],
                    'id_tipo_instrumento' => $datos['id_tipo_instrumento'],
                    'id_institucion' => $datos['id_institucion'],
                    'fecha_inicio' => $datos['fecha_inicio'] ?? null,
                    'fecha_fin' => $datos['fecha_fin'] ?? null,
                    'fecha_preaviso' => $datos['fecha_preaviso'] ?? null,
                    'numero_resolucion' => $datos['numero_resolucion'] ?? null,
                    'referencia_expediente' => $datos['referencia_expediente'] ?? null,
                    'notas' => $datos['notas'] ?? null,
                    'version' => DB::raw('version + 1'),
                    'updated_by' => $usuario->id,
                    'updated_at' => now(),
                ]);

            if ($actualizado !== 1) {
                abort(409, 'El convenio cambió desde que lo abriste. Recargalo e intentá nuevamente.');
            }

            $detalleExiste = DB::table('convenio')
                ->where('id_instrumento', $instrumento->id)
                ->exists();
            if (! $detalleExiste) {
                abort(409, 'No se encontró el detalle del convenio para actualizar.');
            }

            DB::table('convenio')
                ->where('id_instrumento', $instrumento->id)
                ->update([
                    'objeto' => $datos['objeto'] ?? null,
                    'marco_legal' => $datos['marco_legal'] ?? null,
                    'obligaciones' => $datos['obligaciones'] ?? null,
                    'condiciones_terminacion' => $datos['condiciones_terminacion'] ?? null,
                    'condiciones_renovacion' => $datos['condiciones_renovacion'] ?? null,
                    'confidencialidad' => $datos['confidencialidad'] ?? null,
                    'alcance_actividades' => $datos['alcance_actividades'] ?? null,
                    'updated_by' => $usuario->id,
                    'updated_at' => now(),
                ]);
            $instrumento->refresh()->load(['tipo', 'institucion', 'estado']);

            $this->notificaciones->borradorEditado($instrumento, $usuario);

            $this->notificaciones->cambioDeDatos($actualizado, $usuario);
            return $actualizado->refresh()->load(['tipo', 'institucion', 'estado']);
        });
    }

    public function enviarARevision(Usuario $usuario, Instrumento $instrumento): Instrumento
    {
        return DB::transaction(function () use ($usuario, $instrumento): Instrumento {
            $idBorrador = Estado::query()->where('nombre', 'borrador')->firstOrFail()->id;
            $idRevision = Estado::query()->where('nombre', 'revision')->firstOrFail()->id;

            $actualizado = DB::table('instrumento')
                ->where('id', $instrumento->id)
                ->whereNull('deleted_at')
                ->where('created_by', $usuario->id)
                ->where('id_estado', $idBorrador)
                ->update([
                    'id_estado' => $idRevision,
                    'version' => DB::raw('version + 1'),
                    'updated_by' => $usuario->id,
                    'updated_at' => now(),
                ]);

            if ($actualizado !== 1) {
                abort(409, 'El convenio ya no está en borrador. Recargalo e intentá nuevamente.');
            }

            DB::table('historial_estado')->insert([
                'id_instrumento' => $instrumento->id,
                'id_estado_anterior' => $idBorrador,
                'id_estado_nuevo' => $idRevision,
                'id_usuario' => $usuario->id,
                'created_at' => now(),
            ]);

            DB::table('usuario_instrumento')->insert([
                'id_usuario' => $usuario->id,
                'id_instrumento' => $instrumento->id,
                'accion' => 'envio_revision',
                'created_at' => now(),
            ]);

            $instrumento->refresh()->load(['tipo', 'institucion', 'estado']);

            $this->notificaciones->revisionPendiente($instrumento, $usuario);

            return $instrumento;
        });
    }

    public function eliminarBorrador(Usuario $usuario, Instrumento $instrumento): void
    {
        DB::transaction(function () use ($usuario, $instrumento): void {
            $idBorrador = Estado::query()->where('nombre', 'borrador')->firstOrFail()->id;
            $borrador = Instrumento::query()
                ->whereKey($instrumento->id)
                ->where('created_by', $usuario->id)
                ->where('id_estado', $idBorrador)
                ->lockForUpdate()
                ->first();

            if (! $borrador) {
                abort(409, 'El convenio ya no está en borrador. Recargalo e intentá nuevamente.');
            }

            $borrador->delete();
            $this->notificaciones->borradorEliminado($borrador, $usuario);
        });
    }

    public function listar(Usuario $usuario, array $filtros): LengthAwarePaginator {
        // Primero identificamos todos los instrumentos que coinciden con la búsqueda.
        $idsCoincidentes = (clone $this->consultaListado($filtros, $usuario))
            ->pluck('i.id')
            ->map(fn ($id) => (int) $id)
            ->all();

        if ($idsCoincidentes === []) {
            return new Paginator(
                [],
                0,
                $filtros['per_page'] ?? 15,
                Paginator::resolveCurrentPage('page'),
                [
                    'path' => Paginator::resolveCurrentPath(),
                    'query' => request()->query(),
                ],
            );
        }

        // Los vínculos se leen como: origen = hijo, destino = padre.
        $idsVisibles = Instrumento::query()
            ->visiblePara($usuario)
            ->select('id');

        $relaciones = DB::table('instrumento_vinculo as v')
            ->whereIn('v.id_instrumento_origen', clone $idsVisibles)
            ->whereIn('v.id_instrumento_destino', clone $idsVisibles)
            ->orderBy('v.id_instrumento_destino')
            ->orderBy('v.id_instrumento_origen')
            ->get([
                'v.id_instrumento_origen as hijo_id',
                'v.id_instrumento_destino as padre_id',
            ]);

        $padresPorHijo = [];

        foreach ($relaciones as $relacion) {
            $padresPorHijo[(int) $relacion->hijo_id][] = (int) $relacion->padre_id;
        }

        // Agrupamos las coincidencias por su raíz visible para no duplicar hijos.
        $raices = [];

        foreach ($idsCoincidentes as $id) {
            $this->agregarRaices($id, $padresPorHijo, [], $raices);
        }

        $idsRaiz = array_keys($raices);

        //Ordenar las raíces por sus propios datos
        $consultaRaices = $this->consultaListado([], $usuario)
            ->whereIn('i.id', $idsRaiz)
            ->reorder();

        switch ($filtros['orden'] ?? 'recientes') {
            case 'antiguos':
                $consultaRaices->orderBy('i.fecha_firma')
                    ->orderBy('i.id');
                break;

            case 'titulo':
                $consultaRaices->orderBy('i.titulo')
                    ->orderBy('i.id');
                break;

            default:
                $consultaRaices->orderByDesc('i.fecha_firma')
                    ->orderByDesc('i.id');
                break;
        }

        $idsRaiz = $consultaRaices->pluck('i.id')
            ->map(fn ($id) => (int) $id)
            ->all();

        $porPagina = $filtros['per_page'] ?? 15;
        $pagina = Paginator::resolveCurrentPage('page');
        $idsPagina = array_slice($idsRaiz, ($pagina - 1) * $porPagina, $porPagina);

        $arboles = collect($idsPagina)
            ->map(fn (int $id) => $this->obtenerArbol($usuario, $id));

        return new Paginator(
            $arboles,
            count($idsRaiz),
            $porPagina,
            $pagina,
            [
                'path' => Paginator::resolveCurrentPath(),
                'query' => request()->query(),
            ],
        );
    }



    private function agregarRaices(int $id, array $padresPorHijo, array $ruta, array &$raices): void {
        // Previene ciclos en los vínculos.
        if (isset($ruta[$id])) {
            $raices[$id] = true;

            return;
        }

        $ruta[$id] = true;
        $padres = $padresPorHijo[$id] ?? [];

        if ($padres === []) {
            $raices[$id] = true;

            return;
        }

        foreach ($padres as $padreId) {
            $this->agregarRaices($padreId, $padresPorHijo, $ruta, $raices);
        }
    }

    /**
     * @param  array{q?: string}  $filtros
     */
    public function listarPublicos(array $filtros): LengthAwarePaginator
    {
        return $this->consultaListado($filtros)->paginate(15);
    }

    /**
     * @return array<string, mixed>
     */
    public function obtenerDetallePublico(int $id): array
    {
        $convenio = DB::table('instrumento as i')
            ->join('tipo_instrumento as t', 't.id', '=', 'i.id_tipo_instrumento')
            ->join('institucion as u', 'u.id', '=', 'i.id_institucion')
            ->join('estado as e', 'e.id', '=', 'i.id_estado')
            ->leftJoin('convenio as c', 'c.id_instrumento', '=', 'i.id')
            ->where('i.id', $id)
            ->whereNull('i.deleted_at')
            ->whereIn('e.nombre', self::ESTADOS_PUBLICOS)
            ->select(
                'i.id',
                'i.uuid',
                'i.codigo',
                'i.titulo',
                't.nombre as tipo',
                't.categoria',
                't.ambito',
                'u.id as id_unidad',
                'u.nombre as unidad',
                'e.nombre as estado',
                'i.fecha_inicio',
                'i.fecha_fin as vencimiento',
                'i.fecha_firma',
                'i.numero_resolucion',
                'i.version',
                'c.objeto',
                'c.marco_legal',
                'c.obligaciones',
                'c.condiciones_terminacion',
                'c.condiciones_renovacion',
                'c.confidencialidad',
                'c.alcance_actividades',
            )
            ->firstOrFail();

        $partes = DB::table('parte_firmante as p')
            ->join('institucion as inst', 'inst.id', '=', 'p.id_institucion')
            ->where('p.id_instrumento', $id)
            ->select('inst.id', 'inst.nombre', 'inst.identificacion_fiscal', 'inst.es_interna', 'p.fecha_firma')
            ->get();

        $archivos = DB::table('archivo')
            ->where('id_instrumento', $id)
            ->whereNull('deleted_at')
            ->select('id', 'nombre', 'tipo_documento', 'tipo_mime', 'tamanio_bytes', 'created_at')
            ->get();

        $vinculos = DB::table('instrumento_vinculo as v')
            ->join('instrumento as io', 'io.id', '=', 'v.id_instrumento_origen')
            ->join('instrumento as id', 'id.id', '=', 'v.id_instrumento_destino')
            ->join('estado as eo', 'eo.id', '=', 'io.id_estado')
            ->join('estado as ed', 'ed.id', '=', 'id.id_estado')
            ->where(fn ($query) => $query
                ->where('v.id_instrumento_origen', $id)
                ->orWhere('v.id_instrumento_destino', $id))
            ->whereIn('eo.nombre', self::ESTADOS_PUBLICOS)
            ->whereIn('ed.nombre', self::ESTADOS_PUBLICOS)
            ->whereNull('io.deleted_at')
            ->whereNull('id.deleted_at')
            ->select(
                'v.tipo_vinculo',
                'io.id as origen_id',
                'io.codigo as origen_codigo',
                'io.titulo as origen_titulo',
                'id.id as destino_id',
                'id.codigo as destino_codigo',
                'id.titulo as destino_titulo',
            )
            ->get();

        return [
            'convenio' => $convenio,
            'partes' => $partes,
            'representantes' => collect(),
            'archivos' => $archivos,
            'historial' => collect(),
            'observaciones' => collect(),
            'vinculos' => $vinculos,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function obtenerDetalle(Usuario $usuario, int $id): array
    {
        $instrumento = Instrumento::query()->visiblePara($usuario)->findOrFail($id);

        $convenio = DB::table('instrumento as i')
            ->join('tipo_instrumento as t', 't.id', '=', 'i.id_tipo_instrumento')
            ->join('institucion as u', 'u.id', '=', 'i.id_institucion')
            ->join('estado as e', 'e.id', '=', 'i.id_estado')
            ->leftJoin('convenio as c', 'c.id_instrumento', '=', 'i.id')
            ->where('i.id', $instrumento->id)
            ->select(
                'i.id',
                'i.uuid',
                'i.codigo',
                'i.titulo',
                'i.id_tipo_instrumento',
                't.nombre as tipo',
                't.categoria',
                't.ambito',
                'u.id as id_unidad',
                'u.nombre as unidad',
                'e.nombre as estado',
                'i.fecha_inicio',
                'i.fecha_fin as vencimiento',
                'i.fecha_firma',
                'i.fecha_preaviso',
                'i.numero_resolucion',
                'i.referencia_expediente',
                'i.notas',
                'i.version',
                'c.objeto',
                'c.marco_legal',
                'c.obligaciones',
                'c.condiciones_terminacion',
                'c.condiciones_renovacion',
                'c.confidencialidad',
                'c.alcance_actividades',
            )
            ->firstOrFail();

        $partes = DB::table('parte_firmante as p')
            ->join('institucion as inst', 'inst.id', '=', 'p.id_institucion')
            ->where('p.id_instrumento', $instrumento->id)
            ->select('inst.id', 'inst.nombre', 'inst.identificacion_fiscal', 'inst.es_interna', 'p.fecha_firma')
            ->get();

        $representantes = DB::table('representante_instrumento as ri')
            ->join('representante as r', 'r.id', '=', 'ri.id_representante')
            ->where('ri.id_instrumento', $instrumento->id)
            ->whereNull('ri.deleted_at')
            ->select(
                'ri.id as id_representante_instrumento',
                'r.nombre',
                'r.apellido',
                'r.correo_electronico',
                'r.telefono',
                'ri.rol',
                'ri.fecha_inicio',
                'ri.fecha_fin',
            )
            ->get();

        // Archivos con la marca: quién lo subió (created_by) y cuándo la API lo selló
        $archivos = DB::table('archivo as a')
            ->leftJoin('usuario as u', 'u.id', '=', 'a.created_by')
            ->where('a.id_instrumento', $instrumento->id)
            ->whereNull('a.deleted_at')
            ->select(
                'a.id',
                'a.nombre',
                'a.tipo_documento',
                'a.tipo_mime',
                'a.tamanio_bytes',
                'a.created_at',
                'a.origen',
                'a.sellado_en',
                DB::raw("TRIM(CONCAT(COALESCE(u.nombre, ''), ' ', COALESCE(u.apellido, ''))) as sellado_por"),
            )
            ->get();

        $historial = DB::table('historial_estado as h')
            ->leftJoin('estado as ea', 'ea.id', '=', 'h.id_estado_anterior')
            ->join('estado as en', 'en.id', '=', 'h.id_estado_nuevo')
            ->join('usuario as us', 'us.id', '=', 'h.id_usuario')
            ->where('h.id_instrumento', $instrumento->id)
            ->orderByDesc('h.created_at')
            ->select(
                'ea.nombre as estado_anterior',
                'en.nombre as estado_nuevo',
                'us.nombre as nombre_usuario',
                'us.apellido as apellido_usuario',
                'h.fundamento',
                'h.created_at',
            )
            ->get();

        $observaciones = DB::table('observacion as o')
            ->join('usuario as us', 'us.id', '=', 'o.id_usuario')
            ->where('o.id_instrumento', $instrumento->id)
            ->orderByDesc('o.created_at')
            ->select(
                'o.id',
                'o.contenido',
                'o.estado',
                'o.respuesta',
                'o.fecha_respuesta',
                'us.nombre as nombre_usuario',
                'us.apellido as apellido_usuario',
                'o.created_at',
            )
            ->get();

        $idsVisibles = Instrumento::visiblePara($usuario)->select('id');
        $vinculos = DB::table('instrumento_vinculo as v')
            ->join('instrumento as io', 'io.id', '=', 'v.id_instrumento_origen')
            ->join('instrumento as id', 'id.id', '=', 'v.id_instrumento_destino')
            ->where(fn ($query) => $query
                ->where('v.id_instrumento_origen', $instrumento->id)
                ->orWhere('v.id_instrumento_destino', $instrumento->id))
            ->whereIn('io.id', $idsVisibles)
            ->whereIn('id.id', $idsVisibles)
            ->whereNull('io.deleted_at')
            ->whereNull('id.deleted_at')
            ->select(
                'v.tipo_vinculo',
                'io.id as origen_id',
                'io.codigo as origen_codigo',
                'io.titulo as origen_titulo',
                'id.id as destino_id',
                'id.codigo as destino_codigo',
                'id.titulo as destino_titulo',
            )
            ->get();

        return [
            'instrumento_model' => $instrumento,
            'puede_firmar' => $usuario->tienePermiso('instrumento.firmar')
                && $usuario->firmas()
                    ->pendientes()
                    ->where('id_instrumento', $instrumento->id)
                    ->exists(),
            'convenio' => $convenio,
            'partes' => $partes,
            'representantes' => $representantes,
            'archivos' => $archivos,
            'historial' => $historial,
            'observaciones' => $observaciones,
            'vinculos' => $vinculos,
        ];
    }

    public function listarEnRevision(Usuario $usuario): LengthAwarePaginator
    {
        return DB::table('instrumento as i')
            ->join('tipo_instrumento as t', 't.id', '=', 'i.id_tipo_instrumento')
            ->join('institucion as u', 'u.id', '=', 'i.id_institucion')
            ->join('estado as e', 'e.id', '=', 'i.id_estado')
            ->where('e.nombre', 'revision')
            // Solo de las unidades donde el usuario puede aprobar.
            ->whereIn('i.id', Instrumento::visiblePara($usuario, 'instrumento.aprobar')->select('id'))
            ->select(
                'i.id',
                'i.codigo',
                'i.titulo',
                't.nombre as tipo',
                'u.nombre as unidad',
                'e.nombre as estado',
                'i.fecha_fin as vence',
            )
            ->selectSub(
                DB::table('observacion as o')
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('o.id_instrumento', 'i.id')
                    ->whereIn('o.estado', ['pendiente', 'respondida']),
                'observaciones_pendientes',
            )
            ->orderByDesc('i.created_at')
            ->orderByDesc('i.id')
            ->paginate(15);
    }

    private function consultaListado(array $filtros, ?Usuario $usuario = null): Builder {
        $query = DB::table('instrumento as i')
            ->join('tipo_instrumento as t', 't.id', '=', 'i.id_tipo_instrumento')
            ->join('institucion as u', 'u.id', '=', 'i.id_institucion')
            ->join('estado as e', 'e.id', '=', 'i.id_estado')
            ->select(
                'i.id',
                'i.codigo',
                'i.titulo',
                'i.id_tipo_instrumento as id_tipo',
                't.nombre as tipo',
                't.categoria as categoria_tipo',
                't.ambito',
                'i.id_institucion as id_unidad',
                'u.nombre as unidad',
                'e.nombre as estado',
                'i.fecha_fin as vence',
                'i.fecha_firma',
            );

        if ($usuario) {
            $query->whereIn('i.id', Instrumento::visiblePara($usuario)->select('id'))
                ->addSelect('i.fecha_preaviso as preaviso')
                ->selectSub(
                    DB::table('instrumento_vinculo as v')
                        ->join('instrumento as hijo', 'hijo.id', '=', 'v.id_instrumento_origen')
                        ->whereColumn('v.id_instrumento_destino', 'i.id')
                        ->whereNull('hijo.deleted_at')
                        ->whereIn(
                            'hijo.id',
                            Instrumento::query()->visiblePara($usuario)->select('id')
                        )
                        ->selectRaw('COUNT(DISTINCT hijo.id)'),
                    'hijos_count'
                )
                ->selectSub(
                    DB::table('archivo as a')
                        ->whereColumn('a.id_instrumento', 'i.id')
                        ->whereNull('a.deleted_at')
                        ->selectRaw('COUNT(*)'),
                    'documentos_count'
                );
        } else {
            $query->whereNull('i.deleted_at')
                ->whereIn('e.nombre', self::ESTADOS_PUBLICOS);
        }

        if (!empty($filtros['tipo'])) {
            $query->where('i.id_tipo_instrumento', $filtros['tipo']);
        }

        if (!empty($filtros['unidad'])) {
            $query->where('i.id_institucion', $filtros['unidad']);
        }
        
        if (!empty($filtros['estado'])) {
            $query->where('e.nombre', $filtros['estado']);
        }
        
        if (!empty($filtros['anio'])) {
            $inicio = sprintf('%04d-01-01', $filtros['anio']);
            $fin = sprintf('%04d-12-31', $filtros['anio']);

            $query->whereBetween('i.fecha_firma', [$inicio, $fin]);
        }

        if (!empty($filtros['q'])) {
            $busqueda = '%' . trim($filtros['q']) . '%';

            $query->where(function ($consulta) use ($busqueda) {
                $consulta->where('i.titulo', 'like', $busqueda)
                    ->orWhere('i.codigo', 'like', $busqueda)
                    ->orWhere('t.nombre', 'like', $busqueda)
                    ->orWhere('u.nombre', 'like', $busqueda);
            });
        }



        switch ($filtros['orden'] ?? 'recientes') {
            case 'antiguos':
                $query->orderBy('i.fecha_firma')
                    ->orderBy('i.id');
                break;

            case 'titulo':
                $query->orderBy('i.titulo')
                    ->orderBy('i.id');
                break;

            default:
                $query->orderByDesc('i.fecha_firma')
                    ->orderByDesc('i.id');
                break;
        }

        return $query;
    }

    public function obtenerArbol(Usuario $usuario, int $id): array {
        $instrumento = Instrumento::query()
            ->visiblePara($usuario)
            ->findOrFail($id);

        $visitados = [];

        return $this->construirNodoArbol($usuario, $instrumento->id, $visitados);
    }

    private function construirNodoArbol(Usuario $usuario, int $id, array &$visitados ): array {
        $visitados[$id] = true;

        $convenio = DB::table('instrumento as i')
            ->join('tipo_instrumento as t', 't.id', '=', 'i.id_tipo_instrumento')
            ->join('institucion as u', 'u.id', '=', 'i.id_institucion')
            ->join('estado as e', 'e.id', '=', 'i.id_estado')
            ->where('i.id', $id)
            ->whereNull('i.deleted_at')
            ->select(
                'i.id',
                'i.codigo',
                'i.titulo',
                't.nombre as tipo',
                't.ambito',
                't.categoria',
                'u.nombre as unidad',
                'e.nombre as estado',
                'i.numero_resolucion',
                'i.fecha_firma',
                'i.fecha_fin as vence',
            )
            ->firstOrFail();

        $archivos = DB::table('archivo')
            ->where('id_instrumento', $id)
            ->whereNull('deleted_at')
            ->orderBy('created_at')
            ->get([
                'id',
                'nombre',
                'tipo_documento',
                'tipo_mime',
                'tamanio_bytes',
            ])
            ->map(function ($archivo): array {
                $fila = (array) $archivo;
                $fila['descarga_url'] = route('documents.download', $fila['id']);

                return $fila;
            })
            ->all();

        $relaciones = DB::table('instrumento_vinculo as v')
            ->join('instrumento as hijo', 'hijo.id', '=', 'v.id_instrumento_origen')
            ->where('v.id_instrumento_destino', $id)
            ->whereNull('hijo.deleted_at')
            ->whereIn(
                'hijo.id',
                Instrumento::query()->visiblePara($usuario)->select('id')
            )
            ->orderBy('hijo.id')
            ->get([
                'v.tipo_vinculo',
                'hijo.id as id_hijo',
            ]);

        $hijos = [];
        $cantidadDescendientes = 0;
        $cantidadDocumentos = count($archivos);

        foreach ($relaciones as $relacion) {
            $idHijo = (int) $relacion->id_hijo;

            // Evita ciclos y que un instrumento vinculado aparezca más de una vez.
            if (isset($visitados[$idHijo])) {
                continue;
            }

            $nodoHijo = $this->construirNodoArbol($usuario, $idHijo, $visitados);

            $cantidadDescendientes += 1 + $nodoHijo['hijos_count'];
            $cantidadDocumentos += $nodoHijo['documentos_count'];

            $hijos[] = [
                'tipo_vinculo' => $relacion->tipo_vinculo,
                'convenio' => $nodoHijo,
            ];
        }

        return [
            'id' => $convenio->id,
            'codigo' => $convenio->codigo,
            'titulo' => $convenio->titulo,
            'tipo' => $convenio->tipo,
            'ambito' => $convenio->ambito,
            'categoria' => $convenio->categoria,
            'unidad' => $convenio->unidad,
            'estado' => $convenio->estado,
            'numero_resolucion' => $convenio->numero_resolucion,
            'fecha_firma' => $convenio->fecha_firma,
            'vence' => $convenio->vence,
            'hijos_count' => $cantidadDescendientes,
            'documentos_count' => $cantidadDocumentos,
            'archivos' => $archivos,
            'hijos' => $hijos,
        ];
    }

    public function aprobarRevision(
        Usuario $usuario,
        Instrumento $instrumento,
        int $version,
        ?string $fundamento = null
    ): Instrumento {
        return DB::transaction(function () use (
            $usuario,
            $instrumento,
            $version,
            $fundamento
        ): Instrumento {
            $actual = Instrumento::query()
                ->whereKey($instrumento->id)
                ->lockForUpdate()
                ->firstOrFail();

            $idRevision = Estado::where('nombre', 'revision')->value('id');
            $idAprobado = Estado::where('nombre', 'aprobado')->value('id');

            if (!$idRevision || !$idAprobado) {
                abort(500, 'No están configurados los estados necesarios.');
            }

            if (
                (int) $actual->id_estado !== (int) $idRevision
                || (int) $actual->version !== $version
            ) {
                abort(409, 'El convenio cambió desde que abriste la revisión. Recargalo e intentá nuevamente.');
            }

            $hayObservacionesSinResolver = DB::table('observacion')
                ->where('id_instrumento', $actual->id)
                ->where('estado', '<>', 'resuelta')
                ->exists();

            if ($hayObservacionesSinResolver) {
                abort(409, 'No se puede aprobar el convenio porque tiene observaciones sin resolver.');
            }

            $actualizado = DB::table('instrumento')
                ->where('id', $actual->id)
                ->where('id_estado', $idRevision)
                ->where('version', $version)
                ->update([
                    'id_estado' => $idAprobado,
                    'version' => DB::raw('version + 1'),
                    'updated_by' => $usuario->id,
                    'updated_at' => now(),
                ]);

            if ($actualizado !== 1) {
                abort(409, 'El convenio cambió durante la aprobación. Recargalo e intentá nuevamente.');
            }

            DB::table('historial_estado')->insert([
                'id_instrumento' => $actual->id,
                'id_estado_anterior' => $idRevision,
                'id_estado_nuevo' => $idAprobado,
                'id_usuario' => $usuario->id,
                'fundamento' => $fundamento,
                'created_at' => now(),
            ]);

            $aprobado = Instrumento::with(['tipo', 'institucion', 'estado'])->findOrFail($actual->id);

            $this->notificaciones->estadoCambiado($aprobado, $usuario, 'lo aprobó');

            return $aprobado;
        });
    }

    public function devolverParaCorreccion(
        Usuario $usuario,
        Instrumento $instrumento,
        int $version,
        string $fundamento
    ): Instrumento {
        return DB::transaction(function () use (
            $usuario,
            $instrumento,
            $version,
            $fundamento
        ): Instrumento {
            $actual = Instrumento::query()
                ->whereKey($instrumento->id)
                ->lockForUpdate()
                ->firstOrFail();

            $idRevision = Estado::where('nombre', 'revision')->value('id');
            $idBorrador = Estado::where('nombre', 'borrador')->value('id');

            if (!$idRevision || !$idBorrador) {
                abort(500, 'No están configurados los estados necesarios.');
            }

            if (
                (int) $actual->id_estado !== (int) $idRevision
                || (int) $actual->version !== $version
            ) {
                abort(409, 'El convenio cambió desde que abriste la revisión. Recargalo e intentá nuevamente.');
            }

            $tieneObservacionesPendientes = DB::table('observacion')
                ->where('id_instrumento', $actual->id)
                ->where('estado', 'pendiente')
                ->exists();

            if (!$tieneObservacionesPendientes) {
                abort(409, 'Registrá al menos una observación pendiente antes de devolver el convenio.');
            }

            $actualizado = DB::table('instrumento')
                ->where('id', $actual->id)
                ->where('id_estado', $idRevision)
                ->where('version', $version)
                ->update([
                    'id_estado' => $idBorrador,
                    'version' => DB::raw('version + 1'),
                    'updated_by' => $usuario->id,
                    'updated_at' => now(),
                ]);

            if ($actualizado !== 1) {
                abort(409, 'El convenio cambió durante la devolución. Recargalo e intentá nuevamente.');
            }

            DB::table('historial_estado')->insert([
                'id_instrumento' => $actual->id,
                'id_estado_anterior' => $idRevision,
                'id_estado_nuevo' => $idBorrador,
                'id_usuario' => $usuario->id,
                'fundamento' => $fundamento,
                'created_at' => now(),
            ]);

           $devuelto = Instrumento::with(['tipo', 'institucion', 'estado'])->findOrFail($actual->id);

            $this->notificaciones->estadoCambiado($devuelto, $usuario, 'lo devolvió para corrección');

            return $devuelto;
        });
    }
}
