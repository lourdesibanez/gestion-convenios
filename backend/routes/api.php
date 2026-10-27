<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    // 5 intentos por minuto en cada ruta (contadores separados) contra fuerza bruta.
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:5,1,login');
    Route::post('verify-code', [AuthController::class, 'verificarCodigo'])->middleware('throttle:5,1,verify-code');
    Route::post('resend-code', [AuthController::class, 'reenviarCodigo'])->middleware('throttle:5,1,resend-code');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});
