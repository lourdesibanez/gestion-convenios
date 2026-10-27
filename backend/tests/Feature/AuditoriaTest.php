<?php

namespace Tests\Feature;

use App\Models\Institucion;
use App\Models\Perfil;
use App\Models\Usuario;
use App\Models\UsuarioPerfil;
use Database\Seeders\CatalogoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditoriaTest extends TestCase
{
    use RefreshDatabase;

    public function test_al_crear_solo_completa_created(): void
    {
        $autor = Usuario::factory()->create();
        $this->actingAs($autor);

        $institucion = Institucion::factory()->create()->fresh();

        $this->assertNotNull($institucion->created_at);
        $this->assertSame($autor->id, $institucion->created_by);
        $this->assertNull($institucion->updated_at);
        $this->assertNull($institucion->updated_by);
    }

    public function test_al_editar_completa_updated_y_conserva_created(): void
    {
        $autor = Usuario::factory()->create();
        $editor = Usuario::factory()->create();

        $this->actingAs($autor);
        $institucion = Institucion::factory()->create();

        $this->travel(5)->minutes();
        $this->actingAs($editor);
        $institucion->update(['nombre' => 'Nuevo nombre']);

        $institucion->refresh();
        $this->assertSame($autor->id, $institucion->created_by);
        $this->assertSame($editor->id, $institucion->updated_by);
        $this->assertTrue($institucion->updated_at->gt($institucion->created_at));
    }

    public function test_borrar_solo_completa_deleted_y_restaurar_solo_lo_limpia(): void
    {
        $usuario = Usuario::factory()->create();
        $this->actingAs($usuario);
        $institucion = Institucion::factory()->create();

        $institucion->delete();
        $borrada = Institucion::withTrashed()->find($institucion->id);
        $this->assertNotNull($borrada->deleted_at);
        $this->assertSame($usuario->id, $borrada->deleted_by);
        $this->assertNull($borrada->updated_at);
        $this->assertNull($borrada->updated_by);

        $borrada->restore();
        $restaurada = $borrada->fresh();
        $this->assertNull($restaurada->deleted_at);
        $this->assertNull($restaurada->deleted_by);
        $this->assertNull($restaurada->updated_at);
        $this->assertNull($restaurada->updated_by);

        // Después de restaurar, editar vuelve a funcionar normal.
        $restaurada->update(['nombre' => 'Editada']);
        $this->assertSame($usuario->id, $restaurada->fresh()->updated_by);
    }

    public function test_sin_usuario_autenticado_queda_en_null(): void
    {
        $institucion = Institucion::factory()->create();

        $this->assertNull($institucion->created_by);
    }

    public function test_valor_cargado_a_mano_al_crear_se_respeta(): void
    {
        $otro = Usuario::factory()->create();
        $this->actingAs(Usuario::factory()->create());

        $institucion = Institucion::factory()->make();
        $institucion->created_by = $otro->id;
        $institucion->save();

        $this->assertSame($otro->id, $institucion->created_by);
    }

    public function test_modelo_sin_borrado_logico_solo_usa_sus_columnas(): void
    {
        $this->seed(CatalogoSeeder::class);
        $this->actingAs(Usuario::factory()->create());

        $asignacion = UsuarioPerfil::create([
            'id_usuario' => Usuario::factory()->create()->id,
            'id_perfil' => Perfil::value('id'),
        ]);

        $asignacion->delete();

        $this->assertDatabaseMissing('usuario_perfil', ['id' => $asignacion->id]);
    }

    public function test_suspender_y_reactivar(): void
    {
        $admin = Usuario::factory()->create();
        $this->actingAs($admin);
        $institucion = Institucion::factory()->create();

        $institucion->suspender();
        $this->assertTrue($institucion->estaSuspendido());
        $this->assertSame($admin->id, $institucion->suspended_by);
        $this->assertSame(0, Institucion::activos()->whereKey($institucion->id)->count());

        $institucion->reactivar();
        $this->assertFalse($institucion->fresh()->estaSuspendido());
    }

    public function test_suspender_usuario_cierra_sus_sesiones(): void
    {
        $usuario = Usuario::factory()->create();
        $usuario->createToken('celular');
        $usuario->createToken('web');

        $usuario->suspender();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
