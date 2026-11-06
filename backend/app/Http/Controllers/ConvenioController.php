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
                'mensaje' => 'Error al obtener los convenios'
            ], 500);
        }
    }
}