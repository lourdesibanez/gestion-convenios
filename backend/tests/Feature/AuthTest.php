<?php

namespace Tests\Feature;

use App\Models\Perfil;
use App\Models\Usuario;
use App\Models\UsuarioPerfil;
use Database\Seeders\CatalogoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['app.debug' => true]);
    }

    private function iniciarLogin(Usuario $usuario): array
    {
        $desafio = $this->postJson('/api/auth/login', [
            'email' => $usuario->email,
            'password' => 'password',
        ])->assertOk()->assertJsonStructure(['codigo_debug'])->json();

        $this->assertSame($this->codigoDelUltimoCorreo(), $desafio['codigo_debug']);

        return $desafio;
    }

    private function codigoDelUltimoCorreo(): string
    {
        $mensaje = Mail::mailer()->getSymfonyTransport()->messages()->last()->getOriginalMessage();
        $texto = $mensaje->getTextBody();
        preg_match('/\b(\d{6})\b/', $texto, $coincidencias);

        $this->assertArrayHasKey(1, $coincidencias);

        return $coincidencias[1];
    }

    public function test_login_con_contrasena_incorrecta_falla(): void
    {
        $usuario = Usuario::factory()->create();

        $this->postJson('/api/auth/login', [
            'email' => $usuario->email,
            'password' => 'incorrecta',
        ])->assertStatus(422)->assertJsonValidationErrors('email');
    }

    public function test_login_devuelve_datos_para_la_pantalla_de_verificacion(): void
    {
        $usuario = Usuario::factory()->create(['email' => 'lourdes@unlpam.edu.ar']);

        $this->postJson('/api/auth/login', [
            'email' => $usuario->email,
            'password' => 'password',
        ])->assertOk()->assertJson([
            'canal' => 'mail',
            'destino' => 'l•••••@unlpam.edu.ar',
            'canales_disponibles' => ['mail'],
            'reenviar_en_segundos' => 60,
        ])->assertJsonStructure(['codigo_debug']);
    }

    public function test_codigo_de_restauracion_se_muestra_en_modo_debug(): void
    {
        $usuario = Usuario::factory()->create();

        $this->postJson('/api/auth/forgot-password', [
            'email' => $usuario->email,
        ])->assertOk()
            ->assertJsonStructure(['message', 'expira_en_minutos', 'codigo_debug']);
    }

    public function test_codigo_debug_no_se_expone_con_debug_desactivado(): void
    {
        config(['app.debug' => false]);
        $usuario = Usuario::factory()->create();

        $this->postJson('/api/auth/login', [
            'email' => $usuario->email,
            'password' => 'password',
        ])->assertOk()->assertJsonPath('codigo_debug', null);
    }

    public function test_canales_disponibles_segun_datos_del_usuario(): void
    {
        $usuario = Usuario::factory()->create(['telefono' => '2954123678']);
        $usuario->forceFill(['push_token' => 'ExponentPushToken[abc]'])->save();

        $this->assertSame(['mail', 'sms', 'push'], $this->iniciarLogin($usuario)['canales_disponibles']);
    }

    public function test_no_se_puede_reenviar_antes_de_la_espera(): void
    {
        $desafio = $this->iniciarLogin(Usuario::factory()->create());

        $this->postJson('/api/auth/resend-code', [
            'id_desafio' => $desafio['id_desafio'],
            'canal' => 'mail',
        ])->assertStatus(429)->assertJsonStructure(['message', 'segundos_restantes']);
    }

    public function test_reenvio_por_sms_anula_el_codigo_anterior(): void
    {
        $usuario = Usuario::factory()->create(['telefono' => '2954123678']);
        $anterior = $this->iniciarLogin($usuario);
        $this->travel(61)->seconds();

        $nuevo = $this->postJson('/api/auth/resend-code', [
            'id_desafio' => $anterior['id_desafio'],
            'canal' => 'sms',
        ])->assertOk()->assertJson(['canal' => 'sms', 'destino' => '•••• 678'])->json();

        $this->postJson('/api/auth/verify-code', [
            'id_desafio' => $anterior['id_desafio'],
            'codigo' => $anterior['codigo_debug'],
            'dispositivo' => 'celular',
        ])->assertStatus(422);

        $this->postJson('/api/auth/verify-code', [
            'id_desafio' => $nuevo['id_desafio'],
            'codigo' => $nuevo['codigo_debug'],
            'dispositivo' => 'celular',
        ])->assertOk()->assertJsonStructure(['token']);
    }

    public function test_reenvio_por_canal_no_disponible_es_rechazado(): void
    {
        $desafio = $this->iniciarLogin(Usuario::factory()->create());

        $this->travel(61)->seconds();

        $this->postJson('/api/auth/resend-code', [
            'id_desafio' => $desafio['id_desafio'],
            'canal' => 'sms',
        ])->assertStatus(422)->assertJsonValidationErrors('canal');
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

    public function test_auth_me_devuelve_el_tipo_de_perfil_activo(): void
    {
        $this->seed(CatalogoSeeder::class);
        $usuario = Usuario::factory()->create();
        UsuarioPerfil::create([
            'id_usuario' => $usuario->id,
            'id_perfil' => Perfil::where('nombre', 'consulta')->value('id'),
            'id_institucion' => null,
        ]);

        $this->actingAs($usuario)
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('tipo_perfil', 'consulta');
    }

    public function test_codigo_incorrecto_no_entrega_token(): void
    {
        $desafio = $this->iniciarLogin(Usuario::factory()->create());

        $this->postJson('/api/auth/verify-code', [
            'id_desafio' => $desafio['id_desafio'],
            'codigo' => '000000',
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
