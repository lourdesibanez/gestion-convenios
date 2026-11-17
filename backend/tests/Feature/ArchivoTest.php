<?php

namespace Tests\Feature;

use App\Models\Archivo;
use App\Models\Institucion;
use App\Models\Instrumento;
use App\Models\Perfil;
use App\Models\Usuario;
use App\Models\UsuarioPerfil;
use Database\Seeders\CatalogoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ArchivoTest extends TestCase
{
    use RefreshDatabase;

    private Usuario $usuario;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(CatalogoSeeder::class);
        $this->usuario = Usuario::factory()->create();
        $this->asignarPerfil($this->usuario, 'administracion', null);
    }

    public function test_subida_y_descarga_privada_de_pdf(): void
    {
        Storage::fake('local');
        $instrumento = Instrumento::factory()->create();
        $contenido = "%PDF-1.4\nDocumento de prueba\n";

        $respuesta = $this->actingAs($this->usuario)->post('/api/documents', [
            'id_instrumento' => $instrumento->id,
            'tipo_documento' => 'convenio',
            'archivo' => UploadedFile::fake()->createWithContent('contrato.pdf', $contenido),
        ], ['Accept' => 'application/json']);

        $respuesta->assertCreated()->assertJsonMissingPath('ruta');
        $archivo = Archivo::findOrFail($respuesta->json('id'));
        $this->assertSame(hash('sha256', $contenido), $archivo->hash_sha256);
        Storage::disk('local')->assertExists($archivo->ruta);

        $this->actingAs($this->usuario)
            ->get('/api/documents/'.$archivo->id.'/download')
            ->assertOk()
            ->assertHeader('content-type', 'application/pdf');

        $this->assertDatabaseHas('usuario_instrumento', [
            'id_usuario' => $this->usuario->id,
            'id_instrumento' => $instrumento->id,
            'accion' => 'descarga_documento',
        ]);
    }

    public function test_archivo_fuera_del_alcance_no_se_puede_descargar(): void
    {
        Storage::fake('local');
        $unidadPropia = Institucion::factory()->interna()->create();
        $unidadAjena = Institucion::factory()->interna()->create();
        $instrumentoAjeno = Instrumento::factory()->create([
            'id_institucion' => $unidadAjena->id,
        ]);
        $archivo = Archivo::create([
            'id_instrumento' => $instrumentoAjeno->id,
            'nombre' => 'contrato.pdf',
            'tipo_documento' => 'convenio',
            'tipo_mime' => 'application/pdf',
            'tamanio_bytes' => 1,
            'hash_sha256' => hash('sha256', 'x'),
            'ruta' => 'contrato.pdf',
        ]);
        Storage::disk('local')->put($archivo->ruta, 'x');
        $usuarioAcotado = Usuario::factory()->create();
        $this->asignarPerfil($usuarioAcotado, 'gestion', $unidadPropia->id);

        $this->actingAs($usuarioAcotado)
            ->getJson('/api/documents/'.$archivo->id.'/download')
            ->assertNotFound();
    }

    public function test_perfil_consulta_no_puede_subir_archivos(): void
    {
        Storage::fake('local');
        $instrumento = Instrumento::factory()->create();
        $consulta = Usuario::factory()->create();
        $this->asignarPerfil($consulta, 'consulta', null);

        $this->actingAs($consulta)
            ->getJson('/api/agreements/'.$instrumento->id)
            ->assertOk()
            ->assertJsonPath('puede_subir_archivo', false);

        $this->actingAs($consulta)
            ->post('/api/documents', [
                'id_instrumento' => $instrumento->id,
                'tipo_documento' => 'convenio',
                'archivo' => UploadedFile::fake()->createWithContent(
                    'contrato.pdf',
                    "%PDF-1.4\nDocumento de prueba\n",
                ),
            ], ['Accept' => 'application/json'])
            ->assertForbidden();

        $this->assertDatabaseMissing('archivo', [
            'id_instrumento' => $instrumento->id,
        ]);
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
