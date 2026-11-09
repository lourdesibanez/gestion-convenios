<?php

namespace App\Http\Controllers;

use App\Http\Requests\InstitucionRequest;
use App\Http\Resources\InstitucionResource;
use App\Models\Institucion;
use App\Services\InstitucionWebService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class InstitucionWebController extends Controller
{
    public function __construct(private InstitucionWebService $instituciones) {}

    public function listar(Request $request): AnonymousResourceCollection
    {
        $instituciones = $this->instituciones->listar();

        return InstitucionResource::collection($instituciones);
    }
}
