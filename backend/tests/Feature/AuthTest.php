<?php

namespace Tests\Feature;

use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Expone codigo_debug en la respuesta del login.
        config(['app.debug' => true]);
    }

    private function iniciarLogin(Usuario $usuario): array
    {
        return $this->postJson('/api/auth/login', [
            'email' => $usuario->email,
            'password' => 'password',
        ])->assertOk()->json();
    }

    public function test_login_con_contrasena_incorrecta_falla(): void
    {
        $usuario = Usuario::factory()->create();

        $this->postJson('/api/auth/login', [
            'email' => $usuario->email,
            'password' => 'incorrecta',
        ])->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_usuario_suspendido_no_puede_ingresar(): void
    {
        $usuario = Usuario::factory()->suspendido()->create();

        $this->postJson('/api/auth/login', [
            'email' => $usuario->email,
            'password' => 'password',
        ])->assertForbidden();
    }

    public function test_login_completo_con_mfa_entrega_token(): void
    {
        $usuario = Usuario::factory()->create();
        $desafio = $this->iniciarLogin($usuario);

        $this->assertDatabaseHas('codigo_verificacion', ['id_usuario' => $usuario->id, 'usado_en' => null]);

        $token = $this->postJson('/api/auth/verify-code', [
            'id_desafio' => $desafio['id_desafio'],
            'codigo' => $desafio['codigo_debug'],
            'dispositivo' => 'celular',
        ])->assertOk()->json('token');

        $this->withToken($token)->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('email', $usuario->email)
            ->assertJsonMissingPath('contrasena');
    }

    public function test_codigo_incorrecto_no_entrega_token(): void
    {
        $desafio = $this->iniciarLogin(Usuario::factory()->create());
        $codigoIncorrecto = $desafio['codigo_debug'] === '111111' ? '222222' : '111111';

        $this->postJson('/api/auth/verify-code', [
            'id_desafio' => $desafio['id_desafio'],
            'codigo' => $codigoIncorrecto,
            'dispositivo' => 'celular',
        ])->assertStatus(422)->assertJsonValidationErrors('codigo');
    }

    public function test_codigo_no_se_puede_usar_dos_veces(): void
    {
        $desafio = $this->iniciarLogin(Usuario::factory()->create());
        $datos = [
            'id_desafio' => $desafio['id_desafio'],
            'codigo' => $desafio['codigo_debug'],
            'dispositivo' => 'celular',
        ];

        $this->postJson('/api/auth/verify-code', $datos)->assertOk();
        $this->postJson('/api/auth/verify-code', $datos)->assertStatus(422);
    }

    public function test_codigo_vencido_no_entrega_token(): void
    {
        $desafio = $this->iniciarLogin(Usuario::factory()->create());

        $this->travel(11)->minutes();

        $this->postJson('/api/auth/verify-code', [
            'id_desafio' => $desafio['id_desafio'],
            'codigo' => $desafio['codigo_debug'],
            'dispositivo' => 'celular',
        ])->assertStatus(422);
    }

    public function test_logout_revoca_solo_el_token_actual(): void
    {
        $usuario = Usuario::factory()->create();
        $tokenCelular = $usuario->createToken('celular')->plainTextToken;
        $tokenWeb = $usuario->createToken('web')->plainTextToken;

        $this->withToken($tokenCelular)->postJson('/api/auth/logout')->assertNoContent();

        $this->assertDatabaseCount('personal_access_tokens', 1);
        $this->assertDatabaseHas('personal_access_tokens', ['name' => 'web']);

        $this->app['auth']->forgetGuards();
        $this->withToken($tokenWeb)->getJson('/api/auth/me')->assertOk();
    }

    public function test_rutas_protegidas_requieren_token(): void
    {
        $this->getJson('/api/auth/me')->assertUnauthorized();
    }
}
