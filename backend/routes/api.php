<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ConvenioController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    //throttle:5,1 - 5 intentos por cada 1 minuto
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:5,1,login');
    Route::post('verify-code', [AuthController::class, 'verificarCodigo'])->middleware('throttle:5,1,verify-code');
    Route::post('resend-code', [AuthController::class, 'reenviarCodigo'])->middleware('throttle:5,1,resend-code');
    Route::post('forgot-password', [AuthController::class, 'olvideContrasena'])->middleware('throttle:5,1,forgot-password');
    Route::post('reset-password', [AuthController::class, 'restablecerContrasena'])->middleware('throttle:5,1,reset-password');


    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
   
        
    });

    
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('home', HomeController::class);
    Route::apiResource('people', RepresentanteController::class);
    Route::apiResource('units', InstitucionController::class);
    Route::apiResource('parties', ParteFirmanteController::class);
    Route::apiResource('documents', ArchivoController::class);
});



// por ahora va a estar publica astsa que se haga el login
Route::get('convenios', [ConvenioController::class, 'index']);
Route::get('convenios/{id}', [ConvenioController::class, 'show']);