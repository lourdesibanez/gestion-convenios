<?php

namespace Tests\Feature;

use App\Models\Institucion;
use App\Models\Perfil;
use App\Models\Usuario;
use App\Models\UsuarioPerfil;
use Database\Seeders\CatalogoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InstitucionTest extends TestCase
{
    use RefreshDatabase;

    public function test_usuario_gestion_lista_todas_las_instituciones_pero_solo_ve_detalle_de_su_alcance(): void
    {
        $this->seed(CatalogoSeeder::class);
        $institucionPropia = Institucion::factory()->interna()->create();
        $institucionAjena = Institucion::factory()->create();
        $institucionesAdicionales = Institucion::factory()->count(15)->create();

        $usuario = Usuario::factory()->create();
        UsuarioPerfil::create([
            'id_usuario' => $usuario->id,
            'id_perfil' => Perfil::where('nombre', 'gestion')->value('id'),
            'id_institucion' => $institucionPropia->id,
        ]);

        $primeraPagina = $this->actingAs($usuario)
            ->getJson('/api/units?page=1')
            ->assertOk()
            ->assertJsonPath('meta.total', 17)
            ->assertJsonPath('meta.last_page', 2);
        $segundaPagina = $this->getJson('/api/units?page=2')
            ->assertOk();

        $idsListados = collect($primeraPagina->json('data'))
            ->merge($segundaPagina->json('data'))
            ->pluck('id')
            ->all();

        $this->assertCount(17, $idsListados);
        $this->assertContains($institucionAjena->id, $idsListados);
        $this->assertContains($institucionPropia->id, $idsListados);
        $this->assertEqualsCanonicalizing(
            [$institucionPropia->id, $institucionAjena->id, ...$institucionesAdicionales->pluck('id')->all()],
            $idsListados,
        );

        $this->getJson('/api/units/'.$institucionPropia->id)->assertOk();
        $this->getJson('/api/units/'.$institucionAjena->id)->assertNotFound();
    }
}
