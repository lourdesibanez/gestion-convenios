<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Observacion extends Model
{
    protected $table = 'observacion';

    protected $fillable = [
        'id_instrumento',
        'id_usuario',
        'contenido',
        'estado',
        'respuesta',
        'respondido_por',
        'fecha_respuesta',
        'fecha_resolucion',
    ];

    protected function casts(): array
    {
        return [
            'fecha_respuesta' => 'datetime',
            'fecha_resolucion' => 'datetime',
        ];
    }

    public function instrumento(): BelongsTo
    {
        return $this->belongsTo(Instrumento::class, 'id_instrumento');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }

    public function respondidoPor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'respondido_por');
    }
}