<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use setasign\Fpdi\Fpdi;
use Throwable;

class MarcaPdfService
{
    /**
     * Copia el PDF sin cambiar su contenido y le escribe la marca en los metadatos
     * (se ve en "Propiedades del documento" de cualquier lector).
     * Devuelve el PDF marcado, o null si FPDI no puede leerlo.
     *
     * @param array{
     *     usuario: string,
     *     email: string,
     *     convenio: string,
     *     codigo: string,
     *     fecha: string,
     *     origen: string,
     *     hash_original: string
     * } $datos
     */
    public function marcar(string $rutaPdf, array $datos): ?string
    {
        try {
            $pdf = new Fpdi();
            $paginas = $pdf->setSourceFile($rutaPdf);

            // Copia cada página tal cual, con su tamaño y orientación
            for ($numero = 1; $numero <= $paginas; $numero++) {
                $plantilla = $pdf->importPage($numero);
                $tamano = $pdf->getTemplateSize($plantilla);
                $pdf->AddPage($tamano['orientation'], [$tamano['width'], $tamano['height']]);
                $pdf->useTemplate($plantilla);
            }

            // La marca: metadatos estándar del PDF (true = textos en UTF-8)
            $pdf->SetTitle($datos['convenio'], true);
            $pdf->SetAuthor("{$datos['usuario']} <{$datos['email']}>", true);
            $pdf->SetSubject(
                "Documento del convenio {$datos['codigo']} subido desde la app el {$datos['fecha']}",
                true,
            );
            $pdf->SetKeywords(implode('; ', [
                "origen={$datos['origen']}",
                "convenio={$datos['codigo']}",
                "usuario={$datos['email']}",
                "fecha={$datos['fecha']}",
                "hash_original={$datos['hash_original']}",
            ]), true);
            $pdf->SetCreator('Gestión de Convenios - API', true);

            return $pdf->Output('S');
        } catch (Throwable $error) {
            // La versión gratuita de FPDI no lee algunos PDF comprimidos (1.5+)
            Log::warning('No se pudo marcar el PDF.', ['error' => $error->getMessage()]);

            return null;
        }
    }
}
