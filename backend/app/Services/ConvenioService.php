<?php

namespace App\Services;

use App\Models\Instrumento;
use App\Models\Usuario;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ConvenioService
{
    /**
     * @param array{estado?: string, tipo?: int, unidad?: int, q?: string} $filtros
     */
    public function listar(Usuario $usuario, array $filtros): LengthAwarePaginator
    {
        $query = DB::table('instrumento as i')
            ->join('tipo_instrumento as t', 't.id', '=', 'i.id_tipo_instrumento')
            ->join('institucion as u', 'u.id', '=', 'i.id_institucion')
            ->join('estado as e', 'e.id', '=', 'i.id_estado')
            ->whereIn('i.id', Instrumento::visiblePara($usuario)->select('id'))
            ->select(
                'i.id',
                'i.codigo',
                'i.titulo',
                't.nombre as tipo',
                'u.nombre as unidad',
                'e.nombre as estado',
                'i.fecha_fin as vence',
                'i.fecha_firma',
                'i.fecha_preaviso as preaviso',
            )
            ->orderByDesc('i.created_at')
            ->orderByDesc('i.id');

        if (isset($filtros['estado'])) {
            $query->where('e.nombre', $filtros['estado']);
        }
        if (isset($filtros['tipo'])) {
            $query->where('i.id_tipo_instrumento', $filtros['tipo']);
        }
        if (isset($filtros['unidad'])) {
            $query->where('i.id_institucion', $filtros['unidad']);
        }
        if (isset($filtros['q'])) {
            $busqueda = '%'.$filtros['q'].'%';
            $query->where(fn ($consulta) => $consulta
                ->where('i.titulo', 'like', $busqueda)
                ->orWhere('i.codigo', 'like', $busqueda));
        }

        return $query->paginate(15);
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

        $archivos = DB::table('archivo')
            ->where('id_instrumento', $instrumento->id)
            ->whereNull('deleted_at')
            ->select('id', 'nombre', 'tipo_documento', 'tipo_mime', 'tamanio_bytes', 'created_at')
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
            ->whereIn('i.id', Instrumento::visiblePara($usuario)->select('id'))
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
                    ->where('o.estado', '<>', 'respondida'),
                'observaciones_pendientes',
            )
            ->orderByDesc('i.created_at')
            ->orderByDesc('i.id')
            ->paginate(15);
    }
}
