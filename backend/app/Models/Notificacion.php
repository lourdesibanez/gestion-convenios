<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notificacion extends Model
{
    protected $table = 'notificacion';

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
}
