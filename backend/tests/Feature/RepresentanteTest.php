<?php

namespace Tests\Feature;

use App\Models\Institucion;
use App\Models\Perfil;
use App\Models\Representante;
use App\Models\Usuario;
use App\Models\UsuarioPerfil;
use Database\Seeders\CatalogoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RepresentanteTest extends TestCase
{
    use RefreshDatabase;

    private Usuario $usuario;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(CatalogoSeeder::class);
        $this->usuario = Usuario::factory()->create();
        UsuarioPerfil::create([
            'id_usuario' => $this->usuario->id,
            'id_perfil' => Perfil::where('nombre', 'administracion')->value('id'),
            'id_institucion' => null,
        ]);
    }

    public function test_puede_crear_representante(): void
    {
        $datos = [
            'nombre' => 'Juan',
            'apellido' => 'Pérez',
            'tipo_documento' => 'DNI',
            'numero_documento' => '12345678',
            'correo_electronico' => 'juan@example.com',
            'telefono' => '555-1234',
        ];

        $this->actingAs($this->usuario)
            ->postJson('/api/people', $datos)
            ->assertCreated()
            ->assertJsonFragment(['nombre' => 'Juan', 'numero_documento' => '12345678']);

        $this->assertDatabaseHas('representante', ['numero_documento' => '12345678']);
    }

    public function test_rechaza_creacion_con_documento_duplicado(): void
    {
        Representante::factory()->create([
            'tipo_documento' => 'DNI',
            'numero_documento' => '11111111',
        ]);

        $datos = [
            'nombre' => 'Carlos',
            'apellido' => 'Gómez',
            'tipo_documento' => 'DNI',
            'numero_documento' => '11111111', // Duplicado
        ];

        $this->actingAs($this->usuario)
            ->postJson('/api/people', $datos)
            ->assertStatus(422)
            ->assertJsonStructure(['message']);
    }

    public function test_listado_paginado_devuelve_quince_elementos(): void
    {
        Representante::factory()->count(16)->create();

        $respuesta = $this->actingAs($this->usuario)
            ->getJson('/api/people')
            ->assertOk()
            ->assertJsonStructure(['data', 'links', 'meta' => ['current_page', 'last_page', 'per_page', 'total']]);

        $this->assertCount(15, $respuesta->json('data'));
        $this->assertSame(2, $respuesta->json('meta.last_page'));
    }

    public function test_usuario_con_perfil_gestion_puede_listar_representantes(): void
    {
        $usuario = Usuario::factory()->create();
        $institucion = Institucion::factory()->interna()->create();
        Representante::factory()->count(16)->create();
        UsuarioPerfil::create([
            'id_usuario' => $usuario->id,
            'id_perfil' => Perfil::where('nombre', 'gestion')->value('id'),
            'id_institucion' => $institucion->id,
        ]);

        $this->actingAs($usuario)
            ->getJson('/api/people?page=1')
            ->assertOk()
            ->assertJsonPath('meta.total', 16)
            ->assertJsonPath('meta.last_page', 2);
    }

    public function test_revision_puede_consultar_personas_pero_no_crearlas_y_consulta_no_puede_listar(): void
    {
        $revision = Usuario::factory()->create();
        UsuarioPerfil::create([
            'id_usuario' => $revision->id,
            'id_perfil' => Perfil::where('nombre', 'revision')->value('id'),
            'id_institucion' => null,
        ]);

        $this->actingAs($revision)->getJson('/api/people')->assertOk();
        $this->postJson('/api/people', [
            'nombre' => 'Juan',
            'apellido' => 'Pérez',
            'tipo_documento' => 'DNI',
            'numero_documento' => '12345678',
            'correo_electronico' => 'juan@example.com',
            'telefono' => '555-1234',
        ])->assertForbidden();

        $consulta = Usuario::factory()->create();
        UsuarioPerfil::create([
            'id_usuario' => $consulta->id,
            'id_perfil' => Perfil::where('nombre', 'consulta')->value('id'),
            'id_institucion' => null,
        ]);

        $this->actingAs($consulta)->getJson('/api/people')->assertForbidden();
    }
}
