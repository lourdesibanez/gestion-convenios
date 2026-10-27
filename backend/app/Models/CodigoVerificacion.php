<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CodigoVerificacion extends Model
{
    protected $table = 'codigo_verificacion';

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
        'hash',
        'canal',
        'expira_en',
        'usado_en',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'hash',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'expira_en' => 'datetime',
            'usado_en' => 'datetime',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

    public function estaVigente(): bool
    {
        return $this->usado_en === null && $this->expira_en->isFuture();
    }
}
