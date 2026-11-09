<?php

namespace App\Models;

use App\Models\Concerns\Auditoria;
use App\Models\Concerns\Suspendible;
use Database\Factories\UsuarioFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    /** @use HasFactory<UsuarioFactory> */
    use HasApiTokens, HasFactory, Notifiable, Auditoria, SoftDeletes, Suspendible;

    protected $table = 'usuario';

    protected static function booted(): void
    {
        // Suspender o dar de baja cierra todas sus sesiones abiertas.
        static::updated(function (Usuario $usuario) {
            if ($usuario->wasChanged('suspended_at') && $usuario->estaSuspendido()) {
                $usuario->tokens()->delete();
            }
        });

        static::deleted(fn (Usuario $usuario) => $usuario->tokens()->delete());
    }

    /**
     * Columna que guarda el hash de la contraseña.
     */
    protected $authPasswordName = 'contrasena';

    /**
     * La tabla no tiene remember_token; vacío desactiva "recordarme".
     */
    protected $rememberTokenName = '';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nombre_usuario',
        'nombre',
        'apellido',
        'email',
        'telefono',
        'contrasena',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'contrasena',
        'push_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'contrasena' => 'hashed',
        ];
    }

    public function codigosVerificacion(): HasMany
    {
        return $this->hasMany(CodigoVerificacion::class, 'id_usuario');
    }

    public function perfiles(): HasMany
    {
        return $this->hasMany(UsuarioPerfil::class, 'id_usuario');
    }

    public function firmas(): HasMany
    {
        return $this->hasMany(Firma::class, 'id_usuario');
    }

    public function notificaciones(): HasMany
    {
        return $this->hasMany(Notificacion::class, 'id_usuario');
    }

    /**
     * Instituciones cuyos instrumentos puede ver, según sus perfiles activos.
     * null = alcance global (algún perfil sin institución).
     *
     * @return list<int>|null
     */
    public function institucionesVisibles(): ?array
    {
        return once(function () {
            $instituciones = $this->perfiles()->activos()->pluck('id_institucion');

            return $instituciones->containsStrict(null)
                ? null
                : $instituciones->unique()->values()->all();
        });
    }

    public function tienePermiso(string $nombre): bool
    {
        if ($this->estaSuspendido()) {
            return false;
        }

        return $this->perfiles()
            ->activos()
            ->whereHas('perfil.permisos', fn ($query) => $query->where('nombre', $nombre))
            ->exists();
    }
}
