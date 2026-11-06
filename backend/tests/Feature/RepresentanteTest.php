<?php

namespace Tests\Feature;

use App\Models\Representante;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RepresentanteTest extends TestCase
{
    use RefreshDatabase;

    private Usuario $usuario;

    protected function setUp(): void
    {
        parent::setUp();
        // Asumiendo que usas un factory para el usuario autenticado
        $this->usuario = Usuario::factory()->create(); 
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
            'numero_documento' => '11111111'
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
}