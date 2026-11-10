<?php

namespace App\Services;

use RuntimeException;
use setasign\Fpdi\Fpdi;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;

class PdfFirmadoService
{
    /**
     * Conserva el PDF original y agrega una página con los datos de la firma.
     *
     * @param array{
     *     titulo: string,
     *     codigo: string,
     *     firmante: string,
     *     firmado_en: string,
     *     latitud: float|int|string,
     *     longitud: float|int|string,
     *      url_verificacion: string
     * } $datos
     */
    public function agregarPaginaFirma(string $pdfOriginal, string $rutaImagenFirma, array $datos): string {
        $pdf = new Fpdi();
        $cantidadPaginas = $pdf->setSourceFile($pdfOriginal);

        for ($numero = 1; $numero <= $cantidadPaginas; $numero++) {
            $plantilla = $pdf->importPage($numero);
            $tamano = $pdf->getTemplateSize($plantilla);

            $pdf->AddPage(
                $tamano['orientation'],
                [$tamano['width'], $tamano['height']],
            );
            $pdf->useTemplate($plantilla);
        }

        $imagen = getimagesize($rutaImagenFirma);

        if ($imagen === false) {
            throw new RuntimeException('La imagen de firma no es válida.');
        }

        $pdf->AddPage('P', 'A4');
        $pdf->SetMargins(20, 20, 20);
        $pdf->SetY(25);
        $pdf->SetFont('Arial', 'B', 18);
        $pdf->Cell(0, 12, $this->texto('Constancia de firma'), 0, 1, 'C');

        $pdf->Ln(8);
        $pdf->SetFont('Arial', '', 12);
        $pdf->MultiCell(0, 8, $this->texto('Convenio: ' . $datos['titulo']));
        $pdf->MultiCell(0, 8, $this->texto('Código: ' . $datos['codigo']));
        $pdf->MultiCell(0, 8, $this->texto('Firmante: ' . $datos['firmante']));
        $pdf->MultiCell(0, 8, $this->texto('Fecha y hora: ' . $datos['firmado_en']));
        $pdf->MultiCell(
            0,
            8,
            $this->texto("Ubicación: {$datos['latitud']}, {$datos['longitud']}"),
        );

        $anchoImagen = 140.0;
        $altoImagen = $anchoImagen * $imagen[1] / $imagen[0];

        if ($altoImagen > 50) {
            $altoImagen = 50;
            $anchoImagen = $altoImagen * $imagen[0] / $imagen[1];
        }

        $x = (210 - $anchoImagen) / 2;
        $pdf->Image(
            $rutaImagenFirma,
            $x,
            145,
            $anchoImagen,
            $altoImagen,
            'PNG',
        );

        //Agregamos el QR de verificación
        $rutaQr = tempnam(sys_get_temp_dir(), 'qr-');

        if ($rutaQr === false) {
            throw new RuntimeException('No se pudo crear el QR de verificación.');
        }

        try {
            (new PngWriter())
                ->write(QrCode::create($datos['url_verificacion']))
                ->saveToFile($rutaQr);

            $pdf->SetFont('Arial', '', 9);
            $pdf->SetXY(150, 210);
            $pdf->Cell(40, 6, $this->texto('Verificar documento'), 0, 1, 'C');
            $pdf->Image($rutaQr, 155, 218, 35, 35, 'PNG');
        } finally {
            if (is_file($rutaQr)) {
                unlink($rutaQr);
            }
        }

        return $pdf->Output('S');
    }

    private function texto(string $texto): string
    {
        $convertido = iconv('UTF-8', 'Windows-1252//TRANSLIT', $texto);

        if ($convertido === false) {
            throw new RuntimeException('No se pudo preparar el texto del PDF.');
        }

        return $convertido;
    }
}
