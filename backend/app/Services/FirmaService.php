<?php

namespace App\Services;

use App\Models\Archivo;
use App\Models\Firma;
use App\Models\Usuario;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use App\Models\Estado;
use App\Models\Instrumento;
use App\Models\UsuarioInstrumento;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Throwable;

class FirmaService
{
    private const POR_PAGINA = 10;

    public function __construct(
        private PdfFirmadoService $pdfFirmado,
    ) {}

    public function registrar(Usuario $usuario, int $id_instrumento, array $datos): array {
        $disco = Storage::disk('local');
        $rutasCreadas = [];

        try {
            return DB::transaction(function () use (
                $usuario,
                $id_instrumento,
                $datos,
                $disco,
                &$rutasCreadas,
            ): array {
                $instrumento = Instrumento::query()
                    ->with('estado')
                    ->lockForUpdate()
                    ->findOrFail($id_instrumento);

                if ($instrumento->estado->nombre !== 'aprobado') {
                    abort(409, 'El convenio ya no está disponible para firmar.');
                }

                $firma = Firma::query()
                    ->where('id_instrumento', $id_instrumento)
                    ->where('id_usuario', $usuario->id)
                    ->whereNull('firmado_en')
                    ->lockForUpdate()
                    ->firstOrFail();

                $documentoAnterior = Archivo::query()
                    ->where('id_instrumento', $id_instrumento)
                    ->where('tipo_documento', 'convenio_firmado')
                    ->latest('id')
                    ->first();

                if (! $documentoAnterior) {
                    $documentoAnterior = Archivo::query()
                        ->where('id_instrumento', $id_instrumento)
                        ->where('tipo_documento', 'convenio_aprobado')
                        ->where('tipo_mime', 'application/pdf')
                        ->latest('id')
                        ->firstOrFail();
                }

                if (! $disco->exists($documentoAnterior->ruta)) {
                    throw new RuntimeException('No se encontró el PDF que se debe firmar.');
                }

                $prefijo = 'data:image/png;base64,';
                $imagenBase64 = substr($datos['firma'], strlen($prefijo));
                $imagen = base64_decode($imagenBase64, true);
                $informacionImagen = $imagen === false
                    ? false
                    : getimagesizefromstring($imagen);

                if (
                    $imagen === false
                    || $informacionImagen === false
                    || ($informacionImagen['mime'] ?? null) !== 'image/png'
                ) {
                    throw ValidationException::withMessages([
                        'firma' => ['La imagen de firma no es un PNG válido.'],
                    ]);
                }

                $directorio = "instrumentos/{$instrumento->uuid}";
                $sufijo = (string) Str::uuid();
                $rutaImagen = "{$directorio}/firmas/{$sufijo}.png";
                $rutaPdf = "{$directorio}/firmados/{$sufijo}.pdf";

                if (! $disco->put($rutaImagen, $imagen)) {
                    throw new RuntimeException('No se pudo guardar la imagen de firma.');
                }
                $rutasCreadas[] = $rutaImagen;

                $firmadoEn = now();
                $nombreFirmante = trim($usuario->nombre . ' ' . $usuario->apellido);
                $contenidoPdf = $this->pdfFirmado->agregarPaginaFirma(
                    $disco->path($documentoAnterior->ruta),
                    $disco->path($rutaImagen),
                    [
                        'titulo' => $instrumento->titulo,
                        'codigo' => $instrumento->codigo,
                        'firmante' => $nombreFirmante,
                        'firmado_en' => $firmadoEn->format('d/m/Y H:i:s'),
                        'latitud' => $datos['latitud'],
                        'longitud' => $datos['longitud'],
                    ],
                );

                if (! $disco->put($rutaPdf, $contenidoPdf)) {
                    throw new RuntimeException('No se pudo guardar el PDF firmado.');
                }
                $rutasCreadas[] = $rutaPdf;

                $hashPdf = hash('sha256', $contenidoPdf);

                $firma->forceFill([
                    'firmado_en' => $firmadoEn,
                    'latitud' => $datos['latitud'],
                    'longitud' => $datos['longitud'],
                    'ruta_imagen_firma' => $rutaImagen,
                    'hash_documento' => $hashPdf,
                ])->save();

                $nombrePdf = "{$instrumento->codigo}_firmado_{$sufijo}.pdf";

                Archivo::create([
                    'id_instrumento' => $instrumento->id,
                    'nombre' => $nombrePdf,
                    'tipo_documento' => 'convenio_firmado',
                    'tipo_mime' => 'application/pdf',
                    'tamanio_bytes' => strlen($contenidoPdf),
                    'hash_sha256' => $hashPdf,
                    'ruta' => $rutaPdf,
                ]);

                UsuarioInstrumento::create([
                    'id_usuario' => $usuario->id,
                    'id_instrumento' => $instrumento->id,
                    'accion' => 'firma_registrada',
                    'detalle' => $nombrePdf,
                ]);

                $quedanFirmasPendientes = Firma::query()
                    ->where('id_instrumento', $instrumento->id)
                    ->whereNull('firmado_en')
                    ->exists();

                if (! $quedanFirmasPendientes) {
                    $idEstadoFirmado = Estado::query()
                        ->where('nombre', 'firmado')
                        ->value('id');

                    if (! $idEstadoFirmado) {
                        throw new RuntimeException('No está configurado el estado firmado.');
                    }

                    $estadoAnterior = $instrumento->id_estado;

                    $instrumento->forceFill([
                        'id_estado' => $idEstadoFirmado,
                        'fecha_firma' => $firmadoEn->toDateString(),
                    ])->save();

                    DB::table('historial_estado')->insert([
                        'id_instrumento' => $instrumento->id,
                        'id_estado_anterior' => $estadoAnterior,
                        'id_estado_nuevo' => $idEstadoFirmado,
                        'id_usuario' => $usuario->id,
                        'fundamento' => 'Se completaron todas las firmas asignadas.',
                        'created_at' => $firmadoEn,
                    ]);
                }

                return [
                    'mensaje' => 'La firma se registró correctamente.',
                    'firmado_en' => $firmadoEn->toIso8601String(),
                    'latitud' => $firma->latitud,
                    'longitud' => $firma->longitud,
                    'hash_documento' => $hashPdf,
                    'documento' => $nombrePdf,
                    'convenio_completo' => ! $quedanFirmasPendientes,
                ];
            });
        } catch (Throwable $error) {
            if ($rutasCreadas !== []) {
                $disco->delete($rutasCreadas);
            }

            throw $error;
        }
    }
    public function listarPendientes(Usuario $usuario): LengthAwarePaginator
    {
        return $usuario->firmas()
            ->pendientes()
            ->with('instrumento.tipo')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(self::POR_PAGINA)
            ->through(fn (Firma $firma): array => [
                'uuid'              => $firma->instrumento->uuid,
                'id_instrumento'    => $firma->instrumento->id,
                'codigo'            => $firma->instrumento->codigo,
                'titulo'            => $firma->instrumento->titulo,
                'tipo'              => $firma->instrumento->tipo->nombre,
                'asignado_en'       => $firma->created_at,
            ]);
    }

    public function obtenerDocumentoPendiente(Usuario $usuario, int $id_instrumento): Archivo
    {
        $usuario->firmas()
            ->pendientes()
            ->where('id_instrumento', $id_instrumento)
            ->firstOrFail();

        return Archivo::query()
            ->where('id_instrumento', $id_instrumento)
            ->where('tipo_documento', 'convenio_aprobado')
            ->where('tipo_mime', 'application/pdf')
            ->latest('id')
            ->firstOrFail();
    }
}
