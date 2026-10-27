<?php

namespace Database\Seeders;

use App\Models\Estado;
use App\Models\Firma;
use App\Models\Institucion;
use App\Models\Instrumento;
use App\Models\Notificacion;
use App\Models\Perfil;
use App\Models\TipoInstrumento;
use App\Models\Usuario;
use App\Models\UsuarioInstrumento;
use App\Models\UsuarioPerfil;
use Illuminate\Database\Seeder;

/**
 * Datos ficticios para probar las pantallas. Solo se corre en entorno local.
 */
class DemoSeeder extends Seeder
{
    public function run(Usuario $usuario): void
    {
        $unlpam = $this->institucion('Universidad Nacional de La Pampa (demo)', '30-00000001-0', true);
        $legal = $this->institucion('Secretaría Legal y Técnica', '30-00000002-0', true, -36.6200000, -64.2900000);
        $agronomia = $this->institucion('Facultad de Agronomía', '30-00000003-0', true, -36.5500000, -64.3000000);
        $this->institucion('Facultad de Ingeniería', '30-00000004-0', true, -35.6600000, -63.7600000);
        foreach (['Acme S.A.', 'Municipalidad de Ejemplo', 'Fundación Demo', 'Colegio de Ingenieros Ficticio'] as $i => $nombre) {
            $this->institucion($nombre, '30-1000000'.$i.'-9', false);
        }

        UsuarioPerfil::create([
            'id_usuario' => $usuario->id,
            'id_perfil' => Perfil::where('nombre', 'gestion')->value('id'),
            'id_institucion' => $legal->id,
        ]);

        // [código, título, tipo, estado, días desde la firma, días hasta el fin]
        $instrumentos = [
            ['CM-2026-0001', 'Marco de colaboración · Municipalidad de Ejemplo', 'Convenio marco de colaboración', 'firmado', 120, 900],
            ['CM-2025-0031', 'Marco de pasantías · Acme S.A.', 'Convenio marco de pasantía', 'firmado', 400, 330],
            ['CE-2026-0090', 'Específico de colaboración · Fundación Demo', 'Convenio específico de colaboración', 'firmado', 60, 20],
            ['CE-2026-0101', 'Específico de pasantías · Acme S.A.', 'Convenio específico de pasantía', 'firmado', 30, 200],
            ['CE-2026-0077', 'Específico de colaboración · Colegio de Ingenieros', 'Convenio específico de colaboración', 'firmado', 200, null],
            ['AD-2026-0012', 'Adenda I · Marco Municipalidad de Ejemplo', 'Adenda', 'firmado', 10, 900],
            ['CE-2025-0050', 'Específico de colaboración · Municipalidad de Ejemplo', 'Convenio específico de colaboración', 'firmado', 300, -15],
            ['CE-2026-0060', 'Específico de pasantías · Fundación Demo', 'Convenio específico de pasantía', 'rescindido', 90, 300],
            ['CE-2026-0142', 'Específico de pasantías · Colegio de Ingenieros', 'Convenio específico de pasantía', 'aprobado', null, null],
            ['AD-2026-0021', 'Adenda I · Colegio de Ingenieros', 'Adenda', 'aprobado', null, null],
            ['CM-2026-0040', 'Renovación marco · Fundación Demo', 'Convenio marco de colaboración', 'aprobado', null, null],
            ['CE-2026-0150', 'Específico de colaboración · Acme S.A.', 'Convenio específico de colaboración', 'revision', null, null],
            ['CE-2026-0155', 'Específico de pasantías · Municipalidad de Ejemplo', 'Convenio específico de pasantía', 'borrador', null, null],
            ['CE-2024-0010', 'Específico de colaboración · Fundación Demo (2024)', 'Convenio específico de colaboración', 'archivado', 700, -300],
        ];

        $creados = [];
        foreach ($instrumentos as [$codigo, $titulo, $tipo, $estado, $diasFirma, $diasFin]) {
            $creados[$codigo] = $this->instrumento($codigo, $titulo, $tipo, $estado, $diasFirma, $diasFin, $legal);
        }

        // De otra unidad: el usuario de prueba no los ve.
        $this->instrumento('CE-2026-0200', 'Específico de pasantías · Agronomía', 'Convenio específico de pasantía', 'firmado', 15, 365, $agronomia);
        $this->instrumento('CE-2026-0201', 'Específico de colaboración · Agronomía', 'Convenio específico de colaboración', 'borrador', null, null, $unlpam);

        // Mis pendientes.
        foreach (['CE-2026-0142' => 2, 'AD-2026-0021' => 24, 'CM-2026-0040' => 72] as $codigo => $horas) {
            (new Firma)->forceFill([
                'id_instrumento' => $creados[$codigo]->id,
                'id_usuario' => $usuario->id,
                'created_at' => now()->subHours($horas),
                'updated_at' => now()->subHours($horas),
            ])->save();
        }

        // Últimos movimientos: [código, acción, horas atrás].
        $movimientos = [
            ['CE-2026-0142', 'aprobacion', 2],
            ['CE-2026-0155', 'creacion', 5],
            ['CE-2026-0150', 'envio_revision', 20],
            ['AD-2026-0021', 'aprobacion', 24],
            ['CM-2026-0040', 'aprobacion', 72],
            ['AD-2026-0012', 'firma', 240],
            ['CE-2026-0101', 'firma', 720],
            ['CE-2026-0060', 'rescision', 1000],
        ];
        foreach ($movimientos as [$codigo, $accion, $horas]) {
            (new UsuarioInstrumento)->forceFill([
                'id_usuario' => $usuario->id,
                'id_instrumento' => $creados[$codigo]->id,
                'accion' => $accion,
                'created_at' => now()->subHours($horas),
            ])->save();
        }

        Notificacion::create(['id_usuario' => $usuario->id, 'id_instrumento' => $creados['CE-2026-0142']->id, 'tipo' => 'firma_pendiente', 'mensaje' => 'CE-2026-0142 · Específico de pasantías está listo para firmar.']);
        Notificacion::create(['id_usuario' => $usuario->id, 'id_instrumento' => $creados['CE-2026-0150']->id, 'tipo' => 'revision_asignada', 'mensaje' => 'CE-2026-0150 · Específico de colaboración pendiente de revisión.']);
        Notificacion::create(['id_usuario' => $usuario->id, 'id_instrumento' => $creados['AD-2026-0012']->id, 'tipo' => 'cambio_estado', 'mensaje' => 'AD-2026-0012 · Adenda I fue firmada.', 'leido' => true]);
    }

    private function institucion(string $nombre, string $cuit, bool $interna, ?float $latitud = null, ?float $longitud = null): Institucion
    {
        return Institucion::create([
            'nombre' => $nombre,
            'identificacion_fiscal' => $cuit,
            'es_interna' => $interna,
            'latitud' => $latitud,
            'longitud' => $longitud,
        ]);
    }

    private function instrumento(string $codigo, string $titulo, string $tipo, string $estado, ?int $diasFirma, ?int $diasFin, Institucion $unidad): Instrumento
    {
        return Instrumento::create([
            'codigo' => $codigo,
            'titulo' => $titulo,
            'id_tipo_instrumento' => TipoInstrumento::where('nombre', $tipo)->value('id'),
            'id_institucion' => $unidad->id,
            'id_estado' => Estado::where('nombre', $estado)->value('id'),
            'fecha_firma' => $diasFirma === null ? null : today()->subDays($diasFirma),
            'fecha_inicio' => $diasFirma === null ? null : today()->subDays($diasFirma),
            'fecha_fin' => $diasFin === null ? null : today()->addDays($diasFin),
        ]);
    }
}
