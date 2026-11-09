<?php

use App\Http\Controllers\ArchivoController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ConvenioController;
use App\Http\Controllers\ConvenioWebController;

use App\Http\Controllers\HomeController;
use App\Http\Controllers\InstitucionController;
use App\Http\Controllers\InstitucionWebController;
use App\Http\Controllers\ParteFirmanteController;
use App\Http\Controllers\RepresentanteController;
use App\Http\Controllers\RepresentanteWebController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'iniciarSesion'])->middleware('throttle:5,1,login');
    Route::post('verify-code', [AuthController::class, 'verificarCodigo'])->middleware('throttle:5,1,verify-code');
    Route::post('resend-code', [AuthController::class, 'reenviarCodigo'])->middleware('throttle:5,1,resend-code');
    Route::post('forgot-password', [AuthController::class, 'solicitarRestablecimientoContrasena'])->middleware('throttle:5,1,forgot-password');
    Route::post('reset-password', [AuthController::class, 'restablecerContrasena'])->middleware('throttle:5,1,reset-password');
    Route::post('web/login', [AuthController::class, 'iniciarSesionWeb'])->middleware('throttle:5,1,web-login');
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'obtenerUsuarioAutenticado']);
        Route::post('logout', [AuthController::class, 'cerrarSesion']);
        Route::post('push-token', [AuthController::class, 'guardarTokenPush']);
    });
});

// ---------- Públicas (cualquiera puede consultar) ----------
Route::get('convenios', [ConvenioWebController::class, 'listarPublicos']);
Route::get('publico/convenios/{id}', [ConvenioWebController::class, 'obtenerDetallesPublico']);

// ---------- Solo con token (administración) ----------
Route::middleware('auth:sanctum')->group(function () {
    Route::get('home', [HomeController::class, 'obtenerDatos']);

    Route::get('people', [RepresentanteController::class, 'listar'])->name('people.index');
    Route::post('people', [RepresentanteController::class, 'crear'])->name('people.store');
    Route::get('people/{id}', [RepresentanteController::class, 'obtenerDetalle'])->name('people.show');
    Route::match(['put', 'patch'], 'people/{id}', [RepresentanteController::class, 'actualizar'])->name('people.update');
    Route::delete('people/{id}', [RepresentanteController::class, 'eliminar'])->name('people.destroy');

    Route::get('units', [InstitucionController::class, 'listar'])->name('units.index');
    Route::post('units', [InstitucionController::class, 'crear'])->name('units.store');
    Route::get('units/{id}', [InstitucionController::class, 'obtenerDetalle'])->name('units.show');
    Route::match(['put', 'patch'], 'units/{id}', [InstitucionController::class, 'actualizar'])->name('units.update');
    Route::delete('units/{id}', [InstitucionController::class, 'eliminar'])->name('units.destroy');

    Route::get('parties', [ParteFirmanteController::class, 'listar'])->name('parties.index');
    Route::post('parties', [ParteFirmanteController::class, 'crear'])->name('parties.store');
    Route::get('parties/{id}', [ParteFirmanteController::class, 'obtenerDetalle'])->name('parties.show');
    Route::match(['put', 'patch'], 'parties/{id}', [ParteFirmanteController::class, 'actualizar'])->name('parties.update');
    Route::delete('parties/{id}', [ParteFirmanteController::class, 'eliminar'])->name('parties.destroy');

    Route::get('documents', [ArchivoController::class, 'listar'])->name('documents.index');
    Route::post('documents', [ArchivoController::class, 'crear'])->name('documents.store');
    Route::get('documents/{id}', [ArchivoController::class, 'obtenerDetalle'])->name('documents.show');
    Route::delete('documents/{id}', [ArchivoController::class, 'eliminar'])->name('documents.destroy');
    Route::get('documents/{id}/download', [ArchivoController::class, 'descargar'])
        ->name('documents.download');

    Route::get('agreements', [ConvenioController::class, 'listar'])->name('agreements.index');
    Route::get('agreements/review', [ConvenioController::class, 'listarEnRevision'])->name('agreements.review');
    Route::get('agreements/{id}', [ConvenioController::class, 'obtenerDetalle'])->name('agreements.show');
    //WEB
    Route::get('agreementsWeb', [ConvenioWebController::class, 'listarPrivado'])->name('agreements.index');
    Route::get('agreementsWeb/review', [ConvenioWebController::class, 'listarEnRevision'])->name('agreements.review');
    Route::get('agreementsWeb/{id}', [ConvenioWebController::class, 'obtenerDetallePrivado'])->name('agreements.show');
    Route::get('unitsWeb', [InstitucionWebController::class, 'listar'])->name('units.index');
    Route::get('peopleWeb', [RepresentanteWebController::class, 'listar'])->name('people.index');

});
