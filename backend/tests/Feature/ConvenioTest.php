<?php

namespace Tests\Feature;

use App\Models\Estado;
use App\Models\Firma;
use App\Models\Institucion;
use App\Models\Instrumento;
use App\Models\Perfil;
use App\Models\TipoInstrumento;
use App\Models\Usuario;
use App\Models\UsuarioPerfil;
use Database\Seeders\CatalogoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ConvenioTest extends TestCase
{
    use RefreshDatabase;

    private Institucion $unidad;

    private Usuario $usuario;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(CatalogoSeeder::class);
        $this->unidad = Institucion::factory()->interna()->create();
        $this->usuario = Usuario::factory()->create();
        $this->asignarPerfil($this->usuario, 'gestion', $this->unidad->id);
    }

    public function test_listado_devuelve_paginacion_y_campos_de_fecha(): void
    {
        Instrumento::factory()
            ->count(16)
            ->create(['id_institucion' => $this->unidad->id]);

        $respuesta = $this->actingAs($this->usuario)
            ->getJson('/api/agreements')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [['id', 'fecha_firma', 'vence', 'preaviso']],
                'links',
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);

        $this->assertCount(15, $respuesta->json('data'));
        $this->assertSame(2, $respuesta->json('meta.last_page'));
    }

    public function test_detalle_tiene_formato_resource_y_respeta_el_alcance(): void
    {
        $propio = Instrumento::factory()->create([
            'id_institucion' => $this->unidad->id,
        ]);
        $unidadAjena = Institucion::factory()->interna()->create();
        $ajeno = Instrumento::factory()->create([
            'id_institucion' => $unidadAjena->id,
        ]);

        $this->actingAs($this->usuario)
            ->getJson('/api/agreements/'.$propio->id)
            ->assertOk()
            ->assertJsonStructure(['convenio' => ['id', 'codigo'], 'partes', 'archivos'])
            ->assertJsonMissingPath('ok')
            ->assertJsonMissingPath('data');

        $this->actingAs($this->usuario)
            ->getJson('/api/agreements/'.$ajeno->id)
            ->assertNotFound();
    }

    public function test_detalle_solo_habilita_firma_a_un_usuario_asignado(): void
    {
        $instrumento = Instrumento::factory()
            ->enEstado('aprobado')
            ->create(['id_institucion' => $this->unidad->id]);

        $this->actingAs($this->usuario)
            ->getJson('/api/agreements/'.$instrumento->id)
            ->assertOk()
            ->assertJsonPath('puede_firmar', false);

        Firma::create([
            'id_instrumento' => $instrumento->id,
            'id_usuario' => $this->usuario->id,
        ]);

        $this->actingAs($this->usuario)
            ->getJson('/api/agreements/'.$instrumento->id)
            ->assertOk()
            ->assertJsonPath('puede_firmar', true);
    }

    public function test_gestion_puede_crear_un_convenio_completo_en_borrador(): void
    {
        $tipo = TipoInstrumento::query()->where('categoria', 'especifico')->firstOrFail();

        $this->actingAs($this->usuario)
            ->getJson('/api/agreements/create-options')
            ->assertOk()
            ->assertJsonPath('data.puede_crear', true)
            ->assertJsonFragment(['id' => $this->unidad->id, 'nombre' => $this->unidad->nombre]);

        $respuesta = $this->actingAs($this->usuario)
            ->postJson('/api/agreements', [
                'titulo' => 'Convenio móvil de prueba',
                'id_tipo_instrumento' => $tipo->id,
                'id_institucion' => $this->unidad->id,
                'fecha_inicio' => '2027-01-15',
                'fecha_fin' => '2028-01-15',
                'fecha_preaviso' => '2027-11-15',
                'numero_resolucion' => 'RES-123',
                'referencia_expediente' => 'EXP-456',
                'notas' => 'Notas de prueba',
                'objeto' => 'Objeto del convenio',
                'marco_legal' => 'Marco legal',
                'obligaciones' => 'Obligaciones',
                'condiciones_terminacion' => 'Condiciones de terminación',
                'condiciones_renovacion' => 'Condiciones de renovación',
                'confidencialidad' => 'Confidencialidad',
                'alcance_actividades' => 'Alcance de actividades',
            ])
            ->assertCreated()
            ->assertJsonPath('data.estado', 'borrador')
            ->assertJsonPath('data.titulo', 'Convenio móvil de prueba');

        $id = $respuesta->json('data.id');
        $this->assertDatabaseHas('instrumento', [
            'id' => $id,
            'id_estado' => Estado::where('nombre', 'borrador')->value('id'),
            'id_institucion' => $this->unidad->id,
            'created_by' => $this->usuario->id,
        ]);
        $this->assertDatabaseHas('convenio', [
            'id_instrumento' => $id,
            'objeto' => 'Objeto del convenio',
            'alcance_actividades' => 'Alcance de actividades',
            'created_by' => $this->usuario->id,
        ]);

        $this->actingAs($this->usuario)
            ->getJson('/api/agreements/'.$id)
            ->assertOk()
            ->assertJsonPath('convenio.titulo', 'Convenio móvil de prueba');
    }

    public function test_creador_puede_editar_su_borrador_y_se_incrementa_la_version(): void
    {
        $instrumento = $this->crearBorradorPropio();

        $this->actingAs($this->usuario)
            ->getJson('/api/agreements/'.$instrumento->id)
            ->assertOk()
            ->assertJsonPath('puede_editar', true);

        $this->actingAs($this->usuario)
            ->patchJson('/api/agreements/'.$instrumento->id, $this->datosEdicion($instrumento->version))
            ->assertOk()
            ->assertJsonPath('data.titulo', 'Título actualizado')
            ->assertJsonPath('data.version', $instrumento->version + 1);

        $this->assertDatabaseHas('instrumento', [
            'id' => $instrumento->id,
            'titulo' => 'Título actualizado',
            'version' => $instrumento->version + 1,
            'updated_by' => $this->usuario->id,
        ]);
        $this->assertDatabaseHas('convenio', [
            'id_instrumento' => $instrumento->id,
            'objeto' => 'Objeto actualizado',
            'updated_by' => $this->usuario->id,
        ]);
    }

    public function test_otro_usuario_no_puede_editar_un_borrador_ajeno(): void
    {
        $instrumento = $this->crearBorradorPropio();
        $otroUsuario = Usuario::factory()->create();
        $this->asignarPerfil($otroUsuario, 'gestion', $this->unidad->id);

        $this->actingAs($otroUsuario)
            ->getJson('/api/agreements/'.$instrumento->id)
            ->assertOk()
            ->assertJsonPath('puede_editar', false);

        $this->actingAs($otroUsuario)
            ->patchJson('/api/agreements/'.$instrumento->id, $this->datosEdicion($instrumento->version))
            ->assertForbidden();
    }

    public function test_un_borrador_no_se_puede_editar_con_una_version_anterior(): void
    {
        $instrumento = $this->crearBorradorPropio();

        $this->actingAs($this->usuario)
            ->patchJson('/api/agreements/'.$instrumento->id, $this->datosEdicion($instrumento->version + 1))
            ->assertStatus(409);

        $this->assertDatabaseHas('instrumento', [
            'id' => $instrumento->id,
            'titulo' => $instrumento->titulo,
            'version' => $instrumento->version,
        ]);
    }

    public function test_el_creador_no_puede_editar_un_convenio_fuera_de_borrador(): void
    {
        $instrumento = Instrumento::factory()
            ->enEstado('revision')
            ->create([
                'id_institucion' => $this->unidad->id,
                'created_by' => $this->usuario->id,
            ])
            ->refresh();

        $this->actingAs($this->usuario)
            ->patchJson('/api/agreements/'.$instrumento->id, $this->datosEdicion($instrumento->version))
            ->assertForbidden();
    }

    public function test_revision_no_puede_crear_convenios(): void
    {
        $usuarioRevision = Usuario::factory()->create();
        $this->asignarPerfil($usuarioRevision, 'revision', $this->unidad->id);

        $this->actingAs($usuarioRevision)
            ->getJson('/api/agreements/create-options')
            ->assertOk()
            ->assertJsonPath('data.puede_crear', false);

        $this->actingAs($usuarioRevision)
            ->postJson('/api/agreements', [
                'titulo' => 'No autorizado',
                'id_tipo_instrumento' => 1,
                'id_institucion' => $this->unidad->id,
            ])
            ->assertForbidden();
    }

    public function test_no_se_puede_crear_un_convenio_en_una_unidad_ajena(): void
    {
        $unidadAjena = Institucion::factory()->interna()->create();

        $this->actingAs($this->usuario)
            ->postJson('/api/agreements', [
                'titulo' => 'Unidad ajena',
                'id_tipo_instrumento' => 1,
                'id_institucion' => $unidadAjena->id,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('id_institucion');
    }

    public function test_consulta_publica_solo_expone_convenios_firmados(): void
    {
        $firmado = Instrumento::factory()->vigente()->create([
            'id_institucion' => $this->unidad->id,
        ]);
        $borrador = Instrumento::factory()->create(['id_institucion' => $this->unidad->id]);

        $listado = $this->getJson('/api/public/agreements')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [['id', 'codigo', 'titulo', 'estado']],
                'links',
                'meta',
            ])
            ->assertJsonPath('data.0.id', $firmado->id);
        $this->assertCount(1, $listado->json('data'));

        $this->getJson('/api/public/agreements/'.$firmado->id)
            ->assertOk()
            ->assertJsonStructure(['convenio' => ['id', 'codigo', 'version'], 'partes', 'archivos'])
            ->assertJsonMissingPath('ok')
            ->assertJsonMissingPath('data');

        $this->getJson('/api/public/agreements/'.$borrador->id)->assertNotFound();
    }

    public function test_perfil_revision_puede_listar_solo_instrumentos_de_su_institucion(): void
    {
        $unidadAjena = Institucion::factory()->interna()->create();
        $propio = Instrumento::factory()->enEstado('revision')->create([
            'id_institucion' => $this->unidad->id,
        ]);
        Instrumento::factory()->enEstado('revision')->create([
            'id_institucion' => $unidadAjena->id,
        ]);

        UsuarioPerfil::create([
            'id_usuario' => $this->usuario->id,
            'id_perfil' => Perfil::where('nombre', 'revision')->value('id'),
            'id_institucion' => $this->unidad->id,
        ]);

        $respuesta = $this->actingAs($this->usuario)
            ->getJson('/api/agreements/review')
            ->assertOk();

        $this->assertSame(
            [$propio->id],
            collect($respuesta->json('data'))->pluck('id')->all(),
        );
    }

    private function asignarPerfil(Usuario $usuario, string $perfil, ?int $idInstitucion): void
    {
        UsuarioPerfil::create([
            'id_usuario' => $usuario->id,
            'id_perfil' => Perfil::where('nombre', $perfil)->value('id'),
            'id_institucion' => $idInstitucion,
        ]);
    }

    private function crearBorradorPropio(): Instrumento
    {
        $instrumento = Instrumento::factory()->create([
            'id_institucion' => $this->unidad->id,
            'created_by' => $this->usuario->id,
        ]);

        DB::table('convenio')->insert([
            'id_instrumento' => $instrumento->id,
            'objeto' => 'Objeto inicial',
            'created_at' => now(),
            'created_by' => $this->usuario->id,
        ]);

        return $instrumento->refresh();
    }

    /**
     * @return array<string, mixed>
     */
    private function datosEdicion(int $version): array
    {
        return [
            'version' => $version,
            'titulo' => 'Título actualizado',
            'id_tipo_instrumento' => TipoInstrumento::query()->value('id'),
            'id_institucion' => $this->unidad->id,
            'objeto' => 'Objeto actualizado',
        ];
    }
}
