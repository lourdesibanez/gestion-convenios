<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class ConveniosPendientesPdfSeeder extends Seeder
{
    public function run(): void
    {
        $disco = Storage::disk('local');

        $documentos = [
            [
                'id_instrumento' => 11,
                'titulo' => 'Convenio Marco de Cooperación Académica · UNLPam e INTA',
                'archivo' => 'unlpam-inta.pdf',
            ],
            [
                'id_instrumento' => 9,
                'titulo' => 'Convenio Específico de Prácticas Profesionalizantes · UNLPam y Ministerio de Educación',
                'archivo' => 'unlpam-ministerio.pdf',
            ],
        ];

        $registros = [];

        foreach ($documentos as $documento) {
            $instrumento = DB::table('instrumento')
                ->where('id', $documento['id_instrumento'])
                ->first(['id', 'uuid']);

            if (! $instrumento) {
                throw new RuntimeException(
                    "No existe el instrumento {$documento['id_instrumento']}."
                );
            }

            $origen = $documento['archivo'];
            $destino = "instrumentos/{$instrumento->uuid}/{$documento['archivo']}";

            if ($disco->exists($origen)) {
                $disco->makeDirectory("instrumentos/{$instrumento->uuid}");

                if (! $disco->copy($origen, $destino)) {
                    throw new RuntimeException("No se pudo copiar {$origen} a {$destino}.");
                }
            } elseif (! $disco->exists($destino)) {
                throw new RuntimeException(
                    "No se encontró {$origen} en storage/app/private."
                );
            }

            $rutaFisica = $disco->path($destino);
            $hash = hash_file('sha256', $rutaFisica);
            $tamanio = filesize($rutaFisica);

            if ($hash === false || $tamanio === false) {
                throw new RuntimeException("No se pudieron leer los datos de {$destino}.");
            }

            $registros[] = [
                ...$documento,
                'ruta' => $destino,
                'hash_sha256' => $hash,
                'tamanio_bytes' => $tamanio,
            ];
        }

        DB::transaction(function () use ($registros): void {
            foreach ($registros as $registro) {
                DB::table('instrumento')
                    ->where('id', $registro['id_instrumento'])
                    ->update(['titulo' => $registro['titulo']]);

                DB::table('archivo')->updateOrInsert(
                    [
                        'id_instrumento' => $registro['id_instrumento'],
                        'nombre' => $registro['archivo'],
                        'tipo_documento' => 'convenio_aprobado',
                    ],
                    [
                        'tipo_mime' => 'application/pdf',
                        'tamanio_bytes' => $registro['tamanio_bytes'],
                        'hash_sha256' => $registro['hash_sha256'],
                        'ruta' => $registro['ruta'],
                        'created_at' => now(),
                        'created_by' => 1,
                        'deleted_at' => null,
                        'deleted_by' => null,
                    ],
                );
            }
        });
    }
}
