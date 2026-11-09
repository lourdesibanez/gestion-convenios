<?php

namespace Tests\Feature;

use App\Models\Institucion;
use App\Models\Instrumento;
use App\Models\Perfil;
use App\Models\Usuario;
use App\Models\UsuarioPerfil;
use Database\Seeders\CatalogoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
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

    private function asignarPerfil(Usuario $usuario, string $perfil, ?int $idInstitucion): void
    {
        UsuarioPerfil::create([
            'id_usuario' => $usuario->id,
            'id_perfil' => Perfil::where('nombre', $perfil)->value('id'),
            'id_institucion' => $idInstitucion,
        ]);
    }
}
