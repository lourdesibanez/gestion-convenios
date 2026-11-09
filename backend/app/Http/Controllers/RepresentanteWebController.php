<?php

namespace App\Http\Controllers;

use App\Http\Resources\RepresentanteResource;
use App\Services\RepresentanteWebService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class RepresentanteWebController extends Controller
{
    public function __construct(
        private RepresentanteWebService $representantes
    ) {}

    public function listar(Request $request): AnonymousResourceCollection
    {
        $representantes = $this->representantes->listar();

        return RepresentanteResource::collection($representantes);
    }
}