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
use Illuminate\Support\Str;

class ArchivoService {

    public function __construct(private MarcaPdfService $marcaPdf) {}

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

    public function crear(Instrumento $instrumento, Usuario $usuario,string $tipoDocumento,UploadedFile $archivo,string $origen = 'web'): Archivo {
        $hashOriginal = hash_file('sha256', $archivo->getRealPath());
        if ($hashOriginal === false) {
            throw new RuntimeException('No se pudo calcular el hash del archivo.');
        }

        $tipoMime = $archivo->getMimeType();
        if (! $tipoMime) {
            throw new RuntimeException('No se pudo determinar el tipo del archivo.');
        }

        // Si viene de la app, la API le escribe la marca en los metadatos
        $selladoEn = now();
        $marcado = $origen === 'app_movil'
            ? $this->marcaPdf->marcar($archivo->getRealPath(), [
                'usuario'           => trim("{$usuario->nombre} {$usuario->apellido}"),
                'email'             => $usuario->email,
                'convenio'          => $instrumento->titulo,
                'codigo'            => $instrumento->codigo,
                'fecha'             => $selladoEn->copy()->timezone('America/Argentina/Buenos_Aires')->format('d/m/Y H:i:s'),
                'origen'            => $origen,
                'hash_original'     => $hashOriginal,
            ])
            : null;

        $carpeta = "instrumentos/{$instrumento->uuid}";
        if ($marcado !== null) {
            $ruta = "{$carpeta}/".Str::uuid().'.pdf';
            if (! Storage::disk('local')->put($ruta, $marcado)) {
                throw new RuntimeException('No se pudo guardar el archivo.');
            }
        } else {
            // Sin marca (subido desde la web, o PDF que FPDI no pudo leer): se guarda tal cual
            $ruta = $archivo->store($carpeta, 'local');
            if (! $ruta) {
                throw new RuntimeException('No se pudo guardar el archivo.');
            }
        }

        // React Native en Android a veces manda "document:123" en lugar del nombre real
        $nombre = basename(urldecode($archivo->getClientOriginalName()));
        if (! str_ends_with(strtolower($nombre), '.pdf')) {
            $nombre = "{$instrumento->codigo}_{$tipoDocumento}.pdf";
        }

        try {
            return DB::transaction(fn () => Archivo::create([
                'id_instrumento'        => $instrumento->id,
                'nombre'                => $nombre,
                'tipo_documento'        => $tipoDocumento,
                'tipo_mime'             => $tipoMime,
                'tamanio_bytes'         => $marcado !== null ? strlen($marcado) : $archivo->getSize(),
                // Hash del archivo que queda guardado (el marcado, si se pudo marcar)
                'hash_sha256'           => $marcado !== null ? hash('sha256', $marcado) : $hashOriginal,
                'hash_original'         => $hashOriginal,
                'ruta'                  => $ruta,
                'origen'                => $origen,
                'sellado_en'            => $marcado !== null ? $selladoEn : null,
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
