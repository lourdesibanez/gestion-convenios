<?php

namespace App\Services;

use App\Models\Archivo;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Storage;

class ArchivoService
{
    public function listarTodos(): Collection
    {
        return Archivo::with('instrumento')->latest('id')->get();
    }

    public function obtenerPorId(int $id): Archivo
    {
        return Archivo::with('instrumento')->findOrFail($id);
    }

    public function crear(array $datos): Archivo
    {
        return Archivo::create($datos);
    }

    public function actualizar(Archivo $archivo, array $datos): Archivo
    {
        $archivo->update($datos);
        return $archivo;
    }

    public function eliminar(Archivo $archivo): void
    {
        // Opcional: Si quieres eliminar el archivo físico del storage al borrar el registro
        // if (Storage::disk('local')->exists($archivo->ruta)) {
        //     Storage::disk('local')->delete($archivo->ruta);
        // }
        
        $archivo->delete();
    }
}