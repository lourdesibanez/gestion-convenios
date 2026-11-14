<?php

namespace Tests\Feature;

use App\Models\Notificacion;
use App\Models\Perfil;
use App\Models\Instrumento;
use App\Models\Usuario;
use App\Models\UsuarioPerfil;
use Database\Seeders\CatalogoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificacionTest extends TestCase
{
    use RefreshDatabase;

    public function test_lista_solo_notificaciones_del_usuario_autenticado(): void
    {
        $usuario = Usuario::factory()->create();
        $otroUsuario = Usuario::factory()->create();
        $propia = Notificacion::create([
            'id_usuario' => $usuario->id,
            'tipo' => 'firma_pendiente',
            'mensaje' => 'Convenio para firmar',
        ]);
        Notificacion::create([
            'id_usuario' => $otroUsuario->id,
            'tipo' => 'aviso',
            'mensaje' => 'Notificación ajena',
        ]);

        $this->actingAs($usuario)
            ->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonPath('data.0.id', $propia->id)
            ->assertJsonPath('data.0.leido', false)
            ->assertJsonPath('unread_count', 1)
            ->assertJsonCount(1, 'data');
    }

    public function test_usuario_puede_marcar_sus_notificaciones_como_leidas(): void
    {
        $usuario = Usuario::factory()->create();
        $notificacion = Notificacion::create([
            'id_usuario' => $usuario->id,
            'tipo' => 'aviso',
            'mensaje' => 'Aviso',
        ]);

        $this->actingAs($usuario)
            ->patchJson("/api/notifications/{$notificacion->id}/read")
            ->assertOk();

        $this->assertTrue($notificacion->fresh()->leido);
    }

    public function test_usuario_no_puede_marcar_notificaciones_ajenas(): void
    {
        $usuario = Usuario::factory()->create();
        $otroUsuario = Usuario::factory()->create();
        $notificacionAjena = Notificacion::create([
            'id_usuario' => $otroUsuario->id,
            'tipo' => 'aviso',
            'mensaje' => 'Aviso',
        ]);

        $this->actingAs($usuario)
            ->patchJson("/api/notifications/{$notificacionAjena->id}/read")
            ->assertNotFound();

        $this->assertFalse($notificacionAjena->fresh()->leido);
    }

    public function test_marcar_todas_leidas_afecta_solo_al_usuario_autenticado(): void
    {
        $usuario = Usuario::factory()->create();
        $otroUsuario = Usuario::factory()->create();
        $propia = Notificacion::create([
            'id_usuario' => $usuario->id,
            'tipo' => 'aviso',
            'mensaje' => 'Aviso propio',
        ]);
        $ajena = Notificacion::create([
            'id_usuario' => $otroUsuario->id,
            'tipo' => 'aviso',
            'mensaje' => 'Aviso ajeno',
        ]);

        $this->actingAs($usuario)
            ->patchJson('/api/notifications/read-all')
            ->assertOk();

        $this->assertTrue($propia->fresh()->leido);
        $this->assertFalse($ajena->fresh()->leido);
    }

    public function test_consulta_ve_y_cuenta_solo_notificaciones_de_convenios_firmados(): void
    {
        $this->seed(CatalogoSeeder::class);
        $usuario = Usuario::factory()->create();
        UsuarioPerfil::create([
            'id_usuario' => $usuario->id,
            'id_perfil' => Perfil::where('nombre', 'consulta')->value('id'),
            'id_institucion' => null,
        ]);
        $firmado = Instrumento::factory()->enEstado('firmado')->create();
        $borrador = Instrumento::factory()->enEstado('borrador')->create();
        $notificacionFirmada = Notificacion::create([
            'id_usuario' => $usuario->id,
            'id_instrumento' => $firmado->id,
            'tipo' => 'cambio_estado',
            'mensaje' => 'El convenio fue firmado.',
        ]);
        $notificacionBorrador = Notificacion::create([
            'id_usuario' => $usuario->id,
            'id_instrumento' => $borrador->id,
            'tipo' => 'revision_asignada',
            'mensaje' => 'El convenio requiere revisión.',
        ]);

        $this->actingAs($usuario)
            ->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $notificacionFirmada->id)
            ->assertJsonPath('unread_count', 1);

        $this->actingAs($usuario)
            ->getJson('/api/home')
            ->assertOk()
            ->assertJsonPath('notificaciones_sin_leer', 1);

        $this->actingAs($usuario)
            ->patchJson("/api/notifications/{$notificacionBorrador->id}/read")
            ->assertNotFound();

        $this->actingAs($usuario)
            ->patchJson('/api/notifications/read-all')
            ->assertOk();

        $this->assertTrue($notificacionFirmada->fresh()->leido);
        $this->assertFalse($notificacionBorrador->fresh()->leido);
    }
}
