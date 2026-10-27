<?php

namespace App\Models;

use App\Models\Concerns\Auditoria;
use App\Models\Concerns\Suspendible;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Perfil de un usuario con su alcance: una institución interna o, si es null, global.
 */
class UsuarioPerfil extends Model
{
    use Auditoria, Suspendible;

    protected $table = 'usuario_perfil';

    /**
     * Sin borrado lógico: se suspende o se borra.
     *
     * @var list<string>
     */
    protected array $auditoria = ['created_by', 'updated_by'];

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

    public function perfil(): BelongsTo
    {
        return $this->belongsTo(Perfil::class, 'id_perfil');
    }

    public function institucion(): BelongsTo
    {
        return $this->belongsTo(Institucion::class, 'id_institucion');
    }
}
