<?php

namespace Tests\Feature;

use App\Models\Firma;
use App\Models\Institucion;
use App\Models\Instrumento;
use App\Models\Notificacion;
use App\Models\Perfil;
use App\Models\Usuario;
use App\Models\UsuarioInstrumento;
use App\Models\UsuarioPerfil;
use Database\Seeders\CatalogoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HomeTest extends TestCase
{
    use RefreshDatabase;

    private Institucion $unidad;

    protected function setUp(): void
    {
        parent::setUp();

        // Dentro de la transacción del test, así no depende del orden de los tests.
        $this->seed(CatalogoSeeder::class);
        $this->travelTo('2026-10-27 12:00:00');
        $this->unidad = Institucion::factory()->interna()->create(['nombre' => 'Secretaría Legal y Técnica']);
    }

    /**
     * Usuario con perfil de gestión en la unidad indicada (null = alcance global).
     */
    private function usuarioEn(?Institucion $unidad): Usuario
    {
        $usuario = Usuario::factory()->create();

        UsuarioPerfil::create([
            'id_usuario' => $usuario->id,
            'id_perfil' => Perfil::where('nombre', 'gestion')->value('id'),
            'id_institucion' => $unidad?->id,
        ]);

        return $usuario;
    }

    private function instrumento(array $atributos = [], ?string $estado = null): Instrumento
    {
        $factory = Instrumento::factory();

        if ($estado) {
            $factory = $factory->enEstado($estado);
        }

        return $factory->create($atributos + ['id_institucion' => $this->unidad->id]);
    }

    private function home(Usuario $usuario): array
    {
        return $this->actingAs($usuario)->getJson('/api/home')->assertOk()->json();
    }

    public function test_home_requiere_token(): void
    {
        $this->getJson('/api/home')->assertUnauthorized();
    }

    public function test_encabezado_y_notificaciones_sin_leer(): void
    {
        $usuario = $this->usuarioEn($this->unidad);
        $usuario->update(['nombre' => 'Laura', 'apellido' => 'Iriarte']);

        Notificacion::create(['id_usuario' => $usuario->id, 'tipo' => 'aviso', 'mensaje' => 'Uno']);
        Notificacion::create(['id_usuario' => $usuario->id, 'tipo' => 'aviso', 'mensaje' => 'Dos']);
        Notificacion::create(['id_usuario' => $usuario->id, 'tipo' => 'aviso', 'mensaje' => 'Leída', 'leido' => true]);

        $home = $this->home($usuario);

        $this->assertSame(['nombre' => 'Laura', 'apellido' => 'Iriarte', 'iniciales' => 'LI', 'unidad' => 'Secretaría Legal y Técnica'], $home['usuario']);
        $this->assertSame(2, $home['notificaciones_sin_leer']);
    }

    public function test_resumen_aplica_las_definiciones(): void
    {
        // Vigente, firmado este año.
        $this->instrumento(['fecha_firma' => '2026-08-01', 'fecha_inicio' => '2026-08-01', 'fecha_fin' => '2027-08-01'], 'firmado');
        // Vigente y vence en 10 días; firmado hace más de un año.
        $this->instrumento(['fecha_firma' => '2025-01-10', 'fecha_inicio' => '2025-01-10', 'fecha_fin' => '2026-11-06'], 'firmado');
        // Vigente sin vencimiento registrado.
        $this->instrumento(['fecha_firma' => '2026-07-01', 'fecha_inicio' => '2026-07-01'], 'firmado');
        // Vencido.
        $this->instrumento(['fecha_firma' => '2026-04-01', 'fecha_inicio' => '2026-04-01', 'fecha_fin' => '2026-10-20'], 'firmado');
        // Rescindido: cuenta como firmado en el año, pero no como vigente.
        $this->instrumento(['fecha_firma' => '2026-09-01', 'fecha_inicio' => '2026-09-01', 'fecha_fin' => '2027-09-01'], 'rescindido');
        // En trámite.
        $this->instrumento([], 'borrador');
        $this->instrumento([], 'revision');
        $this->instrumento([], 'aprobado');
        // Archivado: no cuenta en nada.
        $this->instrumento([], 'archivado');

        $resumen = $this->home($this->usuarioEn($this->unidad))['resumen'];

        $this->assertSame([
            'firmados_ultimo_anio' => 4,
            'vigentes' => 3,
            'en_tramite' => 3,
            'vencen_30_dias' => 1,
        ], $resumen);
    }

    public function test_solo_cuenta_instrumentos_de_su_unidad(): void
    {
        $otraUnidad = Institucion::factory()->interna()->create();
        $this->instrumento([], 'borrador');
        $this->instrumento(['id_institucion' => $otraUnidad->id], 'borrador');

        $this->assertSame(1, $this->home($this->usuarioEn($this->unidad))['resumen']['en_tramite']);
        $this->assertSame(2, $this->home($this->usuarioEn(null))['resumen']['en_tramite']);
    }

    public function test_pendientes_son_firmas_propias_de_instrumentos_aprobados(): void
    {
        $usuario = $this->usuarioEn($this->unidad);
        $firmar = fn (Instrumento $i, Usuario $u, string $creada, ?string $firmada = null) => (new Firma)->forceFill([
            'id_instrumento' => $i->id,
            'id_usuario' => $u->id,
            'firmado_en' => $firmada,
            'created_at' => $creada,
        ])->save();

        $firmar($this->instrumento(['codigo' => 'A-1'], 'aprobado'), $usuario, '2026-10-24 12:00:00');
        $firmar($this->instrumento(['codigo' => 'A-2'], 'aprobado'), $usuario, '2026-10-27 10:00:00');
        $firmar($this->instrumento(['codigo' => 'A-3'], 'aprobado'), $usuario, '2026-10-26 12:00:00');
        $firmar($this->instrumento(['codigo' => 'A-4'], 'aprobado'), $usuario, '2026-10-20 12:00:00');
        // No cuentan: borrador, ya firmada y asignada a otro usuario.
        $firmar($this->instrumento([], 'borrador'), $usuario, '2026-10-27 11:00:00');
        $firmar($this->instrumento([], 'aprobado'), $usuario, '2026-10-27 11:00:00', '2026-10-27 11:30:00');
        $firmar($this->instrumento([], 'aprobado'), Usuario::factory()->create(), '2026-10-27 11:00:00');

        $pendientes = $this->home($usuario)['pendientes'];

        $this->assertSame(4, $pendientes['total']);
        $this->assertSame(['A-2', 'A-3', 'A-1'], array_column($pendientes['items'], 'codigo'));
    }

    public function test_ultimos_movimientos_sin_repetir_y_ordenados(): void
    {
        $usuario = $this->usuarioEn($this->unidad);
        $registrar = fn (Instrumento $i, string $fecha) => (new UsuarioInstrumento)->forceFill([
            'id_usuario' => $usuario->id,
            'id_instrumento' => $i->id,
            'accion' => 'edicion',
            'created_at' => $fecha,
        ])->save();

        for ($dia = 1; $dia <= 11; $dia++) {
            $registrar($this->instrumento(['codigo' => "M-{$dia}"]), sprintf('2026-10-%02d 12:00:00', $dia));
        }

        // Dos movimientos del mismo instrumento: aparece una vez, con el más reciente.
        $repetido = $this->instrumento(['codigo' => 'M-REP'], 'aprobado');
        $registrar($repetido, '2026-10-12 09:00:00');
        $registrar($repetido, '2026-10-26 09:00:00');

        // De otra unidad: no aparece.
        $ajeno = Instrumento::factory()->create(['codigo' => 'AJENO']);
        $registrar($ajeno, '2026-10-27 09:00:00');

        $movimientos = $this->home($usuario)['ultimos_movimientos'];

        $this->assertCount(10, $movimientos);
        $this->assertSame(['M-REP', 'M-11', 'M-10'], array_column(array_slice($movimientos, 0, 3), 'codigo'));
        $this->assertSame('aprobado', $movimientos[0]['estado']);
        $this->assertNotContains('AJENO', array_column($movimientos, 'codigo'));
    }
}
