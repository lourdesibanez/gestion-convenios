<?php

namespace App\Http\Controllers;

use App\Services\HomeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function __invoke(Request $request, HomeService $home): JsonResponse
    {
        return response()->json($home->datosPara($request->user()));
    }
}
