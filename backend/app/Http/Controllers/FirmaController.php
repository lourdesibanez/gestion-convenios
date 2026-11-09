<?php

namespace App\Http\Controllers;

use App\Services\FirmaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FirmaController extends Controller
{
    public function __construct(private FirmaService $firmas) {}

    public function listarPendientes(Request $request): JsonResponse
    {
        return response()->json(
            $this->firmas->listarPendientes($request->user())
        );
    }
}
