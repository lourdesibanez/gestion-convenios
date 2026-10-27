<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Perfil de un usuario con su alcance: una institución interna o, si es null, global.
 */
class UsuarioPerfil extends Model
{
    protected $table = 'usuario_perfil';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'id_usuario',
        'id_perfil',
        'id_institucion',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'suspended_at' => 'datetime',
        ];
    }

    public function perfil(): BelongsTo
    {
        return $this->belongsTo(Perfil::class, 'id_perfil');
    }

    public function institucion(): BelongsTo
    {
        return $this->belongsTo(Institucion::class, 'id_institucion');
    }

    public function scopeActivos(Builder $query): void
    {
        $query->whereNull('suspended_at');
    }
}
