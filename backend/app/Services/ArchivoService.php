<?php

namespace App\Services;

use App\Models\Archivo;
use App\Models\Instrumento;
use App\Models\Usuario;
use App\Models\UsuarioInstrumento;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class ArchivoService
{
    public function listar(Usuario $usuario): LengthAwarePaginator
    {
        return Archivo::with('instrumento')
            ->whereHas('instrumento', fn ($query) => $query->visiblePara($usuario))
            ->latest('id')
            ->paginate(15);
    }

    public function obtenerDetalle(Usuario $usuario, int $id): Archivo
    {
        return Archivo::with('instrumento')
            ->whereHas('instrumento', fn ($query) => $query->visiblePara($usuario))
            ->findOrFail($id);
    }

    public function obtenerInstrumentoVisible(Usuario $usuario, int $id): Instrumento
    {
        return Instrumento::query()->visiblePara($usuario)->findOrFail($id);
    }

    public function crear(Instrumento $instrumento, string $tipoDocumento, UploadedFile $archivo): Archivo
    {
        $ruta = $archivo->store("instrumentos/{$instrumento->uuid}", 'local');
        if (! $ruta) {
            throw new RuntimeException('No se pudo guardar el archivo.');
        }

        $hash = hash_file('sha256', $archivo->getRealPath());
        if ($hash === false) {
            Storage::disk('local')->delete($ruta);
            throw new RuntimeException('No se pudo calcular el hash del archivo.');
        }

        $tipoMime = $archivo->getMimeType();
        if (! $tipoMime) {
            Storage::disk('local')->delete($ruta);
            throw new RuntimeException('No se pudo determinar el tipo del archivo.');
        }

        try {
            return DB::transaction(fn () => Archivo::create([
                'id_instrumento' => $instrumento->id,
                'nombre' => basename($archivo->getClientOriginalName()),
                'tipo_documento' => $tipoDocumento,
                'tipo_mime' => $tipoMime,
                'tamanio_bytes' => $archivo->getSize(),
                'hash_sha256' => $hash,
                'ruta' => $ruta,
            ]));
        } catch (Throwable $error) {
            Storage::disk('local')->delete($ruta);
            throw $error;
        }
    }

    public function eliminar(Archivo $archivo): void
    {
        $archivo->delete();
    }

    public function descargar(Archivo $archivo, Usuario $usuario): StreamedResponse
    {
        $ruta = $this->obtenerRuta($archivo);
        $this->registrarDescarga($archivo, $usuario);

        return Storage::disk('local')->download(
            $ruta,
            $archivo->nombre,
            ['Content-Type' => 'application/pdf'],
        );
    }

    private function registrarDescarga(Archivo $archivo, Usuario $usuario): void
    {
        UsuarioInstrumento::create([
            'id_usuario' => $usuario->id,
            'id_instrumento' => $archivo->id_instrumento,
            'accion' => 'descarga_documento',
            'detalle' => $archivo->nombre,
        ]);
    }

    private function obtenerRuta(Archivo $archivo): string
    {
        if (! Storage::disk('local')->exists($archivo->ruta)) {
            throw (new ModelNotFoundException())->setModel(Archivo::class, [$archivo->id]);
        }

        return $archivo->ruta;
    }

    public function visualizar(Archivo $archivo, Usuario $usuario): StreamedResponse
    {
        $ruta = $this->obtenerRuta($archivo);
        $this->registrarDescarga($archivo, $usuario);

        return Storage::disk('local')->response(
            $ruta,
            $archivo->nombre,
            [
                'Content-Type' => $archivo->tipo_mime,
                'X-Content-Type-Options' => 'nosniff',
            ],
            'inline',
        );
    }
}
