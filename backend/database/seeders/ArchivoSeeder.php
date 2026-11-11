<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class ArchivoSeeder extends SeederIdempotente
{
    public function run(): void
    {
        // [instrumento, nombre, tipo, bytes/hash de muestra (se recalculan), subido, autor, borrado]
        $archivos = [
            [1, 'CM-2026-0001_borrador_v1.docx', 'borrador', 556956, 'd9ca84d28540f60da1c766ce3c7947d9b192b496604acdad145590e6b0ad6441', '2026-06-14 10:00:00', 1, '2026-06-29 10:00:00'],
            [1, 'CM-2026-0001_convenio_firmado.pdf', 'convenio_firmado', 194902, '65803b2941a2a830b2266512eba5da92b0f62deee5982ac5875d9b024c070d42', '2026-07-04 11:00:00', 1, null],
            [1, 'CM-2026-0001_resolucion.pdf', 'resolucion', 1243556, 'd9cb66a0256cf5c0d19185cc0608941012885a4aa7ca618e0c5323c819457e21', '2026-07-04 12:00:00', 1, null],
            [2, 'CM-2025-0031_borrador_v1.docx', 'borrador', 1117150, '72471ffa013dc796a3125f32f774686ea1a8a83867bd1dd99234050db973b9e6', '2025-09-07 10:00:00', 1, '2025-09-22 10:00:00'],
            [2, 'CM-2025-0031_convenio_firmado.pdf', 'convenio_firmado', 1026213, '99ce327aaff7f0d7b31e16367f089039f2d798c7a5ab70df82fe2e023886def4', '2025-09-27 11:00:00', 1, null],
            [2, 'CM-2025-0031_resolucion.pdf', 'resolucion', 675264, 'b3356d497ebe6174d26b04bc73374c8a2203dc829801b54a756942b454444110', '2025-09-27 12:00:00', 1, null],
            [3, 'CE-2026-0090_borrador_v1.docx', 'borrador', 519895, 'd8257ed0dc8674b27c2ec6f270fd9a95d5090e0511521970ee79775eaad3f6b7', '2026-08-13 10:00:00', 1, '2026-08-28 10:00:00'],
            [3, 'CE-2026-0090_convenio_firmado.pdf', 'convenio_firmado', 2377433, 'cbb13aea067e1bdc028771e0a7692e0e5ebd715f405e03b21a6ee4b1f0caeb8f', '2026-09-02 11:00:00', 1, null],
            [4, 'CE-2026-0101_borrador_v1.docx', 'borrador', 454647, 'ece4b1ebc72255f0c077aff3692ca26142363387727f1a0300012fe876222276', '2026-09-12 10:00:00', 1, '2026-09-27 10:00:00'],
            [4, 'CE-2026-0101_convenio_firmado.pdf', 'convenio_firmado', 1859668, '586d67e93ece9e1ef26b606c081105d0e6c104f69a012fe6926103bab1b3f9ca', '2026-10-02 11:00:00', 1, null],
            [4, 'CE-2026-0101_plan_de_pasantia.pdf', 'anexo', 223306, '33bd5daf471a6c71db01d92c39065463ee9c8bf39bf0d406aec5b3a1e08d8641', '2026-10-02 12:30:00', 1, null],
            [5, 'CE-2026-0077_borrador_v1.docx', 'borrador', 214978, '1c2da7a05666647e650079b9e8de6391314e0b1625c59ecb9703d5c07a5becb7', '2026-03-26 10:00:00', 1, '2026-04-10 10:00:00'],
            [5, 'CE-2026-0077_convenio_firmado.pdf', 'convenio_firmado', 482986, 'ef185e889a42b7c5ab5ddd059d342671bcc7b354e5ade3fc601ce4897db31e56', '2026-04-15 11:00:00', 1, null],
            [5, 'CE-2026-0077_resolucion.pdf', 'resolucion', 1007034, '8b65dc19013e311a3cc1fc553712eda7a45ad7c373d7ce88fae6383777ba418c', '2026-04-15 12:00:00', 1, null],
            [6, 'AD-2026-0012_borrador_v1.docx', 'borrador', 1065850, '1e002d3be5b3210f4e28950868ff11e3b0cc492ade30a3301c40f0476e011dfd', '2026-10-02 10:00:00', 1, '2026-10-17 10:00:00'],
            [6, 'AD-2026-0012_convenio_firmado.pdf', 'convenio_firmado', 2209613, '21c6958b53a2ea615e228fa144d6221e1b5b77a8fc061715501f9f65df54890c', '2026-10-22 11:00:00', 1, null],
            [7, 'CE-2025-0050_borrador_v1.docx', 'borrador', 201299, 'e64ee15acbb552ae9de0fedac11bd003e09de500b2ef3e42744b89fcadbd48c6', '2025-12-16 10:00:00', 1, '2025-12-31 10:00:00'],
            [7, 'CE-2025-0050_convenio_firmado.pdf', 'convenio_firmado', 923985, 'ee53f40a7cd52ca7a590f34eecbcaeeee3e2abafd8124aeb249d262c717c7aa9', '2026-01-05 11:00:00', 1, null],
            [8, 'CE-2026-0060_borrador_v1.docx', 'borrador', 2375650, '4fde3921795f80660b5ad4a359e9e4b25d4cef6387ed9eb948295de742608194', '2026-07-14 10:00:00', 1, '2026-07-29 10:00:00'],
            [8, 'CE-2026-0060_convenio_firmado.pdf', 'convenio_firmado', 1849593, 'af5803b864d2c4214f580c845b8225707ee22e51f5586f82a7495c44c9340c8b', '2026-08-03 11:00:00', 1, null],
            [8, 'CE-2026-0060_plan_de_pasantia.pdf', 'anexo', 1014594, '53bc9599a5967d858a7c515ea43a8be9f881ccb86a890a1b7307ba0c4b0bba68', '2026-08-03 12:30:00', 1, null],
            [8, 'CE-2026-0060_acta_rescision.pdf', 'acta_rescision', 1974119, '1e72dcc909e9a702d627affd00fdcc51c7b74d13f59920ad2eb8924e9a40d841', '2026-09-20 11:30:00', 1, null],
            [9, 'CE-2026-0142_texto_aprobado.pdf', 'convenio_aprobado', 1256816, '859cdf543e2bcd4c9606c973b00555cb7fae876cb4ba2017371974f941f71184', '2026-10-31 20:00:00', 1, null],
            [10, 'AD-2026-0021_texto_aprobado.pdf', 'convenio_aprobado', 117257, 'c4968715328e491469d44c5706f2cddaf8728ddcc3f340dcf772b883a82201a9', '2026-10-31 20:00:00', 1, null],
            [11, 'CM-2026-0040_texto_aprobado.pdf', 'convenio_aprobado', 759659, '2c6e3f88c90e29792aea0a5a6fc0e13bea9c58f3731845b9fa730f54213632af', '2026-10-31 20:00:00', 1, null],
            [12, 'CE-2026-0150_borrador_v1.docx', 'borrador', 1862573, '37416cfe57066bdcf44bb2770ea8cdc605826a998e1ce9caaa4031c17a84799b', '2026-10-27 10:30:00', 1, '2026-10-31 07:00:00'],
            [12, 'CE-2026-0150_borrador_v2.docx', 'borrador', 1517114, '77c877780a437965de0ff49b9e663b7ef1f09809c69996caaea83a04df8952e4', '2026-10-31 07:00:00', 1, null],
            [13, 'CE-2026-0155_borrador_v1.docx', 'borrador', 1255476, 'd1618d8d0045c4ef0869daf4bc604d0249f6f48157b60fdbb51e66706bd341c8', '2026-10-31 22:30:00', 1, null],
            [14, 'CE-2024-0010_borrador_v1.docx', 'borrador', 742128, '626f5c3c46ba4728303c009c1267570b8c10e4823fa1ba7bc53ef161694e94d5', '2024-11-11 10:00:00', 1, '2024-11-26 10:00:00'],
            [14, 'CE-2024-0010_convenio_firmado.pdf', 'convenio_firmado', 993091, '46af54af9fbe67b6ae39380c6755074fb2d192c8a193bcebb1e62863f8a9db94', '2024-12-01 11:00:00', 1, null],
            [14, 'CE-2024-0010_resolucion.pdf', 'resolucion', 1501779, '5dab8c4fe9de27ffc12062b73130b4a4c431dc99d9a65df9ceb86b45fc70a2c6', '2024-12-01 12:00:00', 1, null],
            [15, 'CE-2026-0200_borrador_v1.docx', 'borrador', 518700, '748196ffdd24095df198a8ba2c5cb9733f819c2c7597618aad2ded867dd9ba84', '2026-09-27 10:00:00', 8, '2026-10-12 10:00:00'],
            [15, 'CE-2026-0200_convenio_firmado.pdf', 'convenio_firmado', 479004, '87d214635b266f3dc11c723639eb9dbd73332d393cb380b5b4cae6d4468159a7', '2026-10-17 11:00:00', 8, null],
            [15, 'CE-2026-0200_resolucion.pdf', 'resolucion', 1683530, '21950a44c333b042154f7166a015a1d490a2d200fd57bf5ac58a08a2baf59a06', '2026-10-17 12:00:00', 8, null],
            [15, 'CE-2026-0200_plan_de_pasantia.pdf', 'anexo', 495657, '2c8af733a722a226e97d755ab8220cea9ce43ec8f4744e69f4efa9cc98c497cd', '2026-10-17 12:30:00', 8, null],
            [16, 'CE-2026-0201_borrador_v1.docx', 'borrador', 1595668, '67259f3a3069cb3294b1b8c0a28b7a1b33401a1a3baf3031c6b280228ae30d42', '2026-10-30 14:10:00', 7, null],
        ];

        $filas = [];
        foreach ($archivos as $i => [$instrumento, $nombre, $tipo, $bytes, $hash, $subido, $autor, $borrado]) {
            $instrumentoDB = DB::table('instrumento')
                ->where('id', $instrumento)
                ->first(['codigo', 'uuid']);

            if (! $instrumentoDB) {
                throw new RuntimeException("No existe el instrumento {$instrumento}.");
            }

            if (strtolower(pathinfo($nombre, PATHINFO_EXTENSION)) === 'docx') {
                $nombre = pathinfo($nombre, PATHINFO_FILENAME).'.pdf';
            }
            $contenido = $this->crearPdfFicticio($instrumentoDB->codigo, $nombre, $tipo);
            $ruta = "instrumentos/{$instrumentoDB->uuid}/{$nombre}";

            if (! Storage::disk('local')->put($ruta, $contenido)) {
                throw new RuntimeException("No se pudo guardar el documento ficticio {$nombre}.");
            }

            $filas[] = [
                $i + 1,
                $instrumento,
                $nombre,
                $tipo,
                'application/pdf',
                strlen($contenido),
                hash('sha256', $contenido),
                $ruta,
                $subido,
                $autor,
                $borrado,
                $borrado ? $autor : null,
            ];
        }

        $this->guardar('archivo', ['id'], [
            'id', 'id_instrumento', 'nombre', 'tipo_documento', 'tipo_mime', 'tamanio_bytes', 'hash_sha256',
            'ruta', 'created_at', 'created_by', 'deleted_at', 'deleted_by',
        ], $filas);
    }

    private function crearPdfFicticio(string $codigo, string $nombre, string $tipo): string
    {
        $lineas = [
            'DOCUMENTO FICTICIO - SOLO PRUEBAS',
            'SIN VALIDEZ LEGAL',
            "Convenio: {$codigo}",
            "Archivo: {$nombre}",
            "Tipo de documento: {$tipo}",
        ];

        $texto = "BT\n/F1 17 Tf\n50 760 Td\n";
        foreach ($lineas as $indice => $linea) {
            if ($indice > 0) {
                $texto .= "0 -32 Td\n";
                $texto .= "/F1 12 Tf\n";
            }

            $linea = str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $linea);
            $texto .= "({$linea}) Tj\n";
        }
        $texto .= 'ET';

        $objetos = [
            '<< /Type /Catalog /Pages 2 0 R >>',
            '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
            '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
            '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
            '<< /Length '.strlen($texto)." >>\nstream\n{$texto}\nendstream",
        ];

        $pdf = "%PDF-1.4\n";
        $offsets = [0];
        foreach ($objetos as $indice => $objeto) {
            $offsets[] = strlen($pdf);
            $numero = $indice + 1;
            $pdf .= "{$numero} 0 obj\n{$objeto}\nendobj\n";
        }

        $inicioXref = strlen($pdf);
        $pdf .= "xref\n0 ".(count($objetos) + 1)."\n";
        $pdf .= "0000000000 65535 f \n";
        foreach (array_slice($offsets, 1) as $offset) {
            $pdf .= sprintf("%010d 00000 n \n", $offset);
        }

        return $pdf
            ."trailer\n<< /Size ".(count($objetos) + 1)." /Root 1 0 R >>\n"
            ."startxref\n{$inicioXref}\n%%EOF";
    }
}
