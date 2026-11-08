<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ConvenioController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = DB::table('instrumento as i')
                ->join('tipo_instrumento as t', 't.id', '=', 'i.id_tipo_instrumento')
                ->join('institucion as u', 'u.id', '=', 'i.id_institucion')
                ->join('estado as e', 'e.id', '=', 'i.id_estado')
                ->whereNull('i.deleted_at')
                ->select(
                    'i.id',
                    'i.codigo',
                    'i.titulo',
                    't.nombre as tipo',
                    'u.nombre as unidad',
                    'e.nombre as estado',
                    'i.fecha_fin as vencimiento'
                )
                ->orderByDesc('i.created_at');

            // Filtros opcionales: ?estado=firmado&tipo=2&unidad=3&q=pasantías
            if ($request->filled('estado')) {
                $query->where('e.nombre', $request->estado);
            }
            if ($request->filled('tipo')) {
                $query->where('i.id_tipo_instrumento', $request->tipo);
            }
            if ($request->filled('unidad')) {
                $query->where('i.id_institucion', $request->unidad);
            }
            if ($request->filled('q')) {
                $q = '%' . $request->q . '%';
                $query->where(function ($w) use ($q) {
                    $w->where('i.titulo', 'like', $q)
                      ->orWhere('i.codigo', 'like', $q);
                });
            }

            return response()->json([
                'ok' => true,
                'data' => $query->get()
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'ok' => false,
                'mensaje' => 'Error al obtener los convenios',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    
/** Obtenr un convenio en específico */

    public function show($id)
    {
        try {
            // 1. Datos principales + texto del convenio (LEFT JOIN: puede no tener fila en `convenio`)
            $convenio = DB::table('instrumento as i')
                ->join('tipo_instrumento as t', 't.id', '=', 'i.id_tipo_instrumento')
                ->join('institucion as u', 'u.id', '=', 'i.id_institucion')
                ->join('estado as e', 'e.id', '=', 'i.id_estado')
                ->leftJoin('convenio as c', 'c.id_instrumento', '=', 'i.id')
                ->where('i.id', $id)
                ->whereNull('i.deleted_at')
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
                    'c.alcance_actividades'
                )
                ->first();

            if (!$convenio) {
                return response()->json([
                    'ok' => false,
                    'mensaje' => 'Convenio no encontrado'
                ], 404);
            }

            // 2. Instituciones firmantes
            $partes = DB::table('parte_firmante as p')
                ->join('institucion as inst', 'inst.id', '=', 'p.id_institucion')
                ->where('p.id_instrumento', $id)
                ->select('inst.id', 'inst.nombre', 'inst.identificacion_fiscal', 'inst.es_interna', 'p.fecha_firma')
                ->get();

            // 3. Representantes y su rol en el convenio
            $representantes = DB::table('representante_instrumento as ri')
                ->join('representante as r', 'r.id', '=', 'ri.id_representante')
                ->where('ri.id_instrumento', $id)
                ->whereNull('ri.deleted_at')
                ->select(
                    'ri.id as id_representante_instrumento',
                    'r.nombre',
                    'r.apellido',
                    'r.correo_electronico',
                    'r.telefono',
                    'ri.rol',
                    'ri.fecha_inicio',
                    'ri.fecha_fin'
                )
                ->get();

            // 4. Archivos adjuntos (sin los eliminados)
            $archivos = DB::table('archivo')
                ->where('id_instrumento', $id)
                ->whereNull('deleted_at')
                ->select('id', 'nombre', 'tipo_documento', 'tipo_mime', 'tamanio_bytes', 'created_at')
                ->get();

            // 5. Historial de estados
            $historial = DB::table('historial_estado as h')
                ->leftJoin('estado as ea', 'ea.id', '=', 'h.id_estado_anterior')
                ->join('estado as en', 'en.id', '=', 'h.id_estado_nuevo')
                ->join('usuario as us', 'us.id', '=', 'h.id_usuario')
                ->where('h.id_instrumento', $id)
                ->orderByDesc('h.created_at')
                ->select(
                    'ea.nombre as estado_anterior',
                    'en.nombre as estado_nuevo',
                    DB::raw("CONCAT(us.nombre, ' ', us.apellido) as usuario"),
                    'h.fundamento',
                    'h.created_at'
                )
                ->get();

            // 6. Observaciones
            $observaciones = DB::table('observacion as o')
                ->join('usuario as us', 'us.id', '=', 'o.id_usuario')
                ->where('o.id_instrumento', $id)
                ->orderByDesc('o.created_at')
                ->select(
                    'o.id',
                    'o.contenido',
                    'o.estado',
                    'o.respuesta',
                    'o.fecha_respuesta',
                    DB::raw("CONCAT(us.nombre, ' ', us.apellido) as usuario"),
                    'o.created_at'
                )
                ->get();

            // 7. Convenios vinculados (adendas, renovaciones, etc.), en ambos sentidos
            $vinculos = DB::table('instrumento_vinculo as v')
                ->join('instrumento as io', 'io.id', '=', 'v.id_instrumento_origen')
                ->join('instrumento as id', 'id.id', '=', 'v.id_instrumento_destino')
                ->where('v.id_instrumento_origen', $id)
                ->orWhere('v.id_instrumento_destino', $id)
                ->select(
                    'v.tipo_vinculo',
                    'io.id as origen_id', 'io.codigo as origen_codigo', 'io.titulo as origen_titulo',
                    'id.id as destino_id', 'id.codigo as destino_codigo', 'id.titulo as destino_titulo'
                )
                ->get();

            return response()->json([
                'ok' => true,
                'data' => [
                    'convenio'       => $convenio,
                    'partes'         => $partes,
                    'representantes' => $representantes,
                    'archivos'       => $archivos,
                    'historial'      => $historial,
                    'observaciones'  => $observaciones,
                    'vinculos'       => $vinculos,
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'ok' => false,
                'mensaje' => 'Error al obtener el convenio',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }


    //Convenios en Revisión
    public function revision()
    {
        $items = DB::table('instrumento as i')
            ->join('tipo_instrumento as t', 't.id', '=', 'i.id_tipo_instrumento')
            ->join('institucion as u', 'u.id', '=', 'i.id_institucion')
            ->join('estado as e', 'e.id', '=', 'i.id_estado')
            ->where('e.nombre', 'revision')
            ->whereNull('i.deleted_at')
            ->select(
                'i.id',
                'i.codigo',
                'i.titulo',
                't.nombre as tipo',
                'u.nombre as unidad',
                'e.nombre as estado',
                'i.fecha_fin as vence',
                DB::raw("(SELECT COUNT(*) FROM observacion o
                        WHERE o.id_instrumento = i.id AND o.estado <> 'respondida')
                        as observaciones_pendientes")
            )
            ->get();

        return response()->json(['ok' => true, 'data' => $items]);
    }
    
        public function instituciones()
    {
        $items = DB::table('institucion as inst')
            ->select(
                'inst.id',
                'inst.nombre',
                'inst.identificacion_fiscal',
                'inst.es_interna',
                DB::raw('(SELECT COUNT(*) FROM parte_firmante p
                        WHERE p.id_institucion = inst.id) as total_convenios')
            )
            ->orderBy('inst.nombre')
            ->get();

        return response()->json(['ok' => true, 'data' => $items]);
    }

    public function representantes()
    {
        $items = DB::table('representante as r')
            ->select(
                'r.id',
                'r.nombre',
                'r.apellido',
                'r.correo_electronico',
                'r.telefono',
                DB::raw('(SELECT COUNT(*) FROM representante_instrumento ri
                        WHERE ri.id_representante = r.id
                        AND ri.deleted_at IS NULL) as total_convenios')
            )
            ->orderBy('r.apellido')
            ->get();

        return response()->json(['ok' => true, 'data' => $items]);
    }
}


