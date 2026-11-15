<?php

namespace Tests\Feature;

use App\Jobs\EnviarPushExpo;
use App\Models\Firma;
use App\Models\Archivo;
use App\Models\Institucion;
use App\Models\Instrumento;
use App\Models\Notificacion;
use App\Models\Perfil;
use App\Models\Usuario;
use App\Models\UsuarioPerfil;
use App\Services\NotificacionFirmaService;
use App\Services\FirmaService;
use App\Services\PdfFirmadoService;
use Database\Seeders\CatalogoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Queue;
use Mockery\MockInterface;
use Tests\TestCase;

class NotificacionFirmaServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(CatalogoSeeder::class);
    }

    public function test_cada_firma_notifica_al_creador_y_a_todos_los_firmantes_incluyendo_al_actual(): void
    {
        Queue::fake();

        $institucion = Institucion::factory()->interna()->create();
        $creador = $this->usuarioConPush('ExponentPushToken[creador]');
        $firmanteAnterior = $this->usuarioConPush('ExponentPushToken[anterior]');
        $firmanteActual = $this->usuarioConPush('ExponentPushToken[actual]');
        $consulta = $this->usuarioConsulta($institucion);
        $instrumento = Instrumento::factory()->enEstado('aprobado')->create([
            'created_by' => $creador->id,
            'id_institucion' => $institucion->id,
        ]);
        $this->asignarFirma($instrumento, $firmanteAnterior);
        $this->asignarFirma($instrumento, $firmanteActual);

        $servicio = app(NotificacionFirmaService::class);
        $pushes = $servicio->registrarFirma($instrumento, $firmanteActual, false);
        $servicio->despacharPushes($pushes);

        $this->assertEqualsCanonicalizing(
            [$creador->id, $firmanteAnterior->id, $firmanteActual->id],
            Notificacion::query()->pluck('id_usuario')->all(),
        );
        $this->assertSame(
            ['firma_registrada'],
            Notificacion::query()->distinct()->pluck('tipo')->all(),
        );
        $this->assertDatabaseMissing('notificacion', [
            'id_usuario' => $consulta->id,
            'id_instrumento' => $instrumento->id,
        ]);
        Queue::assertPushed(EnviarPushExpo::class, 3);
    }

    public function test_consulta_recibe_solo_el_aviso_final_al_completarse_las_firmas(): void
    {
        Queue::fake();

        $institucion = Institucion::factory()->interna()->create();
        $creador = $this->usuarioConPush('ExponentPushToken[creador-final]');
        $firmante = $this->usuarioConPush('ExponentPushToken[firmante-final]');
        $consulta = $this->usuarioConsulta($institucion);
        $instrumento = Instrumento::factory()->enEstado('firmado')->create([
            'created_by' => $creador->id,
            'id_institucion' => $institucion->id,
        ]);
        $this->asignarFirma($instrumento, $firmante);

        $servicio = app(NotificacionFirmaService::class);
        $pushes = $servicio->registrarFirma($instrumento, $firmante, true);
        $servicio->despacharPushes($pushes);

        $this->assertDatabaseHas('notificacion', [
            'id_usuario' => $consulta->id,
            'id_instrumento' => $instrumento->id,
            'tipo' => 'convenio_firmado',
        ]);
        $this->actingAs($consulta)
            ->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.tipo', 'convenio_firmado');
        $this->assertSame(
            ['convenio_firmado', 'firma_registrada'],
            Notificacion::query()->distinct()->orderBy('tipo')->pluck('tipo')->all(),
        );
        Queue::assertPushed(EnviarPushExpo::class, 3);
    }

    public function test_firma_registrada_crea_notificaciones_y_encola_push_despues_de_confirmar(): void
    {
        Queue::fake();
        Storage::fake('local');

        $institucion = Institucion::factory()->interna()->create();
        $creador = $this->usuarioConPush('ExponentPushToken[creador-integracion]');
        $firmanteActual = $this->usuarioConPush('ExponentPushToken[actual-integracion]');
        $otroFirmante = $this->usuarioConPush('ExponentPushToken[otro-integracion]');
        $instrumento = Instrumento::factory()->enEstado('aprobado')->create([
            'created_by' => $creador->id,
            'id_institucion' => $institucion->id,
        ]);
        $rutaAprobado = "instrumentos/{$instrumento->uuid}/aprobado.pdf";
        Storage::disk('local')->put($rutaAprobado, '%PDF-aprobado');
        Archivo::create([
            'id_instrumento' => $instrumento->id,
            'nombre' => 'aprobado.pdf',
            'tipo_documento' => 'convenio_aprobado',
            'tipo_mime' => 'application/pdf',
            'tamanio_bytes' => 13,
            'hash_sha256' => hash('sha256', '%PDF-aprobado'),
            'ruta' => $rutaAprobado,
        ]);
        $this->asignarFirma($instrumento, $firmanteActual);
        $this->asignarFirma($instrumento, $otroFirmante);

        $this->mock(PdfFirmadoService::class, function (MockInterface $mock): void {
            $mock->shouldReceive('agregarPaginaFirma')->once()->andReturn('%PDF-firmado');
        });

        $resultado = app(FirmaService::class)->registrar($firmanteActual, $instrumento->id, [
            'firma' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j60YAAAAASUVORK5CYII=',
            'latitud' => '-36.6201',
            'longitud' => '-64.2900',
        ]);

        $this->assertFalse($resultado['convenio_completo']);
        $this->assertDatabaseCount('notificacion', 3);
        Queue::assertPushed(EnviarPushExpo::class, 3);
    }

    private function usuarioConPush(string $token): Usuario
    {
        $usuario = Usuario::factory()->create();
        $usuario->forceFill(['push_token' => $token])->save();

        return $usuario;
    }

    private function usuarioConsulta(Institucion $institucion): Usuario
    {
        $usuario = $this->usuarioConPush('ExponentPushToken[consulta]');
        UsuarioPerfil::create([
            'id_usuario' => $usuario->id,
            'id_perfil' => Perfil::where('nombre', 'consulta')->value('id'),
            'id_institucion' => $institucion->id,
        ]);

        return $usuario;
    }

    private function asignarFirma(Instrumento $instrumento, Usuario $usuario): void
    {
        Firma::create([
            'id_instrumento' => $instrumento->id,
            'id_usuario' => $usuario->id,
        ]);
    }
}
