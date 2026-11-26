<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PerfilFotoController extends Controller
{
    private const MAX_BYTES = 2 * 1024 * 1024; // 2 MB ya decodificada
    private const TIPOS = ['image/jpeg' => 'jpg', 'image/png' => 'png'];

    public function guardar(Request $request): JsonResponse
    {
        $request->validate(['foto' => ['required', 'string']]);

        $binario = base64_decode($request->input('foto'), true);

        if ($binario === false || strlen($binario) > self::MAX_BYTES) {
            abort(422, 'La imagen no es válida o supera los 2 MB.');
        }

        // Se verifica el contenido real, no lo que declare el cliente.
        $info = @getimagesizefromstring($binario);
        $extension = self::TIPOS[$info['mime'] ?? ''] ?? null;

        if ($extension === null) {
            abort(422, 'Solo se permiten imágenes JPG o PNG.');
        }

        $usuario = $request->user();
        $ruta = 'fotos-perfil/'.Str::uuid().'.'.$extension;

        Storage::disk('public')->put($ruta, $binario);

        if ($usuario->foto) {
            Storage::disk('public')->delete($usuario->foto);
        }

        $usuario->forceFill(['foto' => $ruta])->save();

        return response()->json(['data' => ['foto_url' => $usuario->foto_url]]);
    }

    public function quitar(Request $request): JsonResponse
    {
        $usuario = $request->user();

        if ($usuario->foto) {
            Storage::disk('public')->delete($usuario->foto);
            $usuario->forceFill(['foto' => null])->save();
        }

        return response()->json(['data' => ['foto_url' => null]]);
    }
}