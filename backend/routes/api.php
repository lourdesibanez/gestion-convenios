<?php

use App\Http\Controllers\ArchivoController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ConvenioController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\InstitucionController;
use App\Http\Controllers\ParteFirmanteController;
use App\Http\Controllers\RepresentanteController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    // throttle:5,1 - 5 intentos por cada 1 minuto
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:5,1,login');
    Route::post('verify-code', [AuthController::class, 'verificarCodigo'])->middleware('throttle:5,1,verify-code');
    Route::post('resend-code', [AuthController::class, 'reenviarCodigo'])->middleware('throttle:5,1,resend-code');
    Route::post('forgot-password', [AuthController::class, 'olvideContrasena'])->middleware('throttle:5,1,forgot-password');
    Route::post('reset-password', [AuthController::class, 'restablecerContrasena'])->middleware('throttle:5,1,reset-password');

    // Login de un solo paso, solo para la web (sin código de verificación)
    Route::post('web/login', [AuthController::class, 'loginWeb']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

// ---------- Públicas (cualquiera puede consultar) ----------
Route::get('convenios', [ConvenioController::class, 'index']);
Route::get('publico/convenios/{id}', [ConvenioController::class, 'showPublico']);

// ---------- Solo con token (administración) ----------
Route::middleware('auth:sanctum')->group(function () {
    Route::get('home', HomeController::class);

    Route::get('convenios/{id}', [ConvenioController::class, 'show']);
    Route::get('revision', [ConvenioController::class, 'revision']);
    Route::get('instituciones', [ConvenioController::class, 'instituciones']);
    Route::get('representantes', [ConvenioController::class, 'representantes']);

    Route::apiResource('people', RepresentanteController::class);
    Route::apiResource('units', InstitucionController::class);
    Route::apiResource('parties', ParteFirmanteController::class);
    Route::apiResource('documents', ArchivoController::class);
});