<?php

namespace App\Models;

use App\Models\Concerns\Auditoria;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notificacion extends Model
{
    use Auditoria;

    protected $table = 'notificacion';

    /**
     * Sin columnas *_by: el trait solo aplica la regla de fechas (updated_at vacío al crear).
     *
     * @var list<string>
     */
    protected array $auditoria = [];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'id_usuario',
        'id_instrumento',
        'tipo',
        'mensaje',
        'leido',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'leido' => 'boolean',
        ];
    }

    public function instrumento(): BelongsTo
    {
        return $this->belongsTo(Instrumento::class, 'id_instrumento');
    }

    public function scopeVisiblesPara(Builder $query, Usuario $usuario): void
    {
        if ($usuario->esConsulta()) {
            $query->whereHas('instrumento', fn (Builder $instrumento) => $instrumento->enEstado('firmado'));
        }
    }
}
