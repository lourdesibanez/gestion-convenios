<?php

namespace App\Services;

use App\Models\IdentidadUsuario;
use App\Models\Usuario;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class IdentidadService
{
    /** Identidad del usuario; si todavía no registró nada, una vacía (sin guardar). */
    public function obtener(Usuario $usuario): IdentidadUsuario
    {
        return IdentidadUsuario::firstOrNew(['id_usuario' => $usuario->id]);
    }

    /** Guarda (o reemplaza) la imagen de la firma del usuario. */
    public function guardarFirma(Usuario $usuario, string $firmaBase64): IdentidadUsuario
    {
        $imagen = $this->decodificarPng($firmaBase64);
        $disco = Storage::disk('local');
        $ruta = "identidades/{$usuario->id}/firma.png";

        if (! $disco->put($ruta, $imagen)) {
            throw new RuntimeException('No se pudo guardar la firma.');
        }

        $identidad = $this->obtener($usuario);
        $identidad->fill([
            'ruta_firma' => $ruta,
            'firma_registrada_en' => now(),
        ])->save();

        return $identidad;
    }

    /** Registra que el usuario validó su rostro o su huella en el celular. */
    public function registrarBiometria(Usuario $usuario, string $tipo): IdentidadUsuario
    {
        $columna = $tipo === 'facial' ? 'facial_registrado_en' : 'huella_registrada_en';

        $identidad = $this->obtener($usuario);
        $identidad->fill([$columna => now()])->save();

        return $identidad;
    }

    /** La firma como data URL, para mostrarla en la app. Null si no hay. */
    public function firmaComoDataUrl(IdentidadUsuario $identidad): ?string
    {
        if (! $identidad->ruta_firma || ! Storage::disk('local')->exists($identidad->ruta_firma)) {
            return null;
        }

        return 'data:image/png;base64,' . base64_encode(Storage::disk('local')->get($identidad->ruta_firma));
    }

    /** Valida que el texto sea un PNG real (no solo que empiece con el prefijo). */
    private function decodificarPng(string $firmaBase64): string
    {
        $prefijo = 'data:image/png;base64,';
        $imagen = base64_decode(substr($firmaBase64, strlen($prefijo)), true);
        $info = $imagen === false ? false : getimagesizefromstring($imagen);

        if ($imagen === false || $info === false || ($info['mime'] ?? null) !== 'image/png') {
            throw ValidationException::withMessages([
                'firma' => ['La imagen de firma no es un PNG válido.'],
            ]);
        }

        return $imagen;
    }
}
