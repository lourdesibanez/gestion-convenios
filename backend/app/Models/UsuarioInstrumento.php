<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Registro de acciones (auditoría) de un usuario sobre un instrumento.
 * Es la fuente de "Últimos movimientos".
 */
class UsuarioInstrumento extends Model
{
    protected $table = 'usuario_instrumento';

    /**
     * La tabla solo registra la fecha de alta.
     */
    const UPDATED_AT = null;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'id_usuario',
        'id_instrumento',
        'accion',
        'detalle',
    ];

    public function instrumento(): BelongsTo
    {
        return $this->belongsTo(Instrumento::class, 'id_instrumento');
    }
}
