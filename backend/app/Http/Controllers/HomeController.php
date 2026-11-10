<?php

namespace App\Http\Controllers;

use App\Http\Resources\HomeResource;
use App\Services\HomeService;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function obtenerDatos(Request $request, HomeService $home): HomeResource
    {
        abort_unless($request->user()->tienePermiso('reporte.ver'), 403,'No tenés permiso para ver estadísticas.');

        return new HomeResource($home->obtenerDatos($request->user()));
    }
}
