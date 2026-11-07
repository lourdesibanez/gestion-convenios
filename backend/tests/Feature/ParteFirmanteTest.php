<?php

namespace Tests\Feature;

use App\Models\Institucion;
use App\Models\Instrumento;
use App\Models\ParteFirmante;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ParteFirmanteTest extends TestCase
{
    use RefreshDatabase;

    private Usuario $usuario;

    protected function setUp(): void
    {
        parent::setUp();
        $this->usuario = Usuario::factory()->create();
    }

    public function test_puede_crear_parte_firmante(): void
    {
        $institucion = Institucion::factory()->create();
        $instrumento = Instrumento::factory()->create();

        $datos = [
            'id_institucion' => $institucion->id,
            'id_instrumento' => $instrumento->id,
            'fecha_firma' => '2026-11-06',
        ];

        $this->actingAs($this->usuario)
            ->postJson('/api/parties', $datos)
            ->assertCreated()
            ->assertJsonFragment(['id_institucion' => $institucion->id]);

        $this->assertDatabaseHas('parte_firmante', [
            'id_institucion' => $institucion->id,
            'id_instrumento' => $instrumento->id
        ]);
    }

    public function test_rechaza_vinculo_duplicado(): void
    {
        $vinculo = ParteFirmante::factory()->create();

        $datos = [
            'id_institucion' => $vinculo->id_institucion,
            'id_instrumento' => $vinculo->id_instrumento,
        ];

        $this->actingAs($this->usuario)
            ->postJson('/api/parties', $datos)
            ->assertStatus(422)
            ->assertJsonStructure(['message']);
    }
}