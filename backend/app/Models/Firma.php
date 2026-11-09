<?php

namespace App\Models;

use App\Models\Concerns\Auditoria;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Firma extends Model
{
    use Auditoria, SoftDeletes;

    protected $table = 'firma';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'id_instrumento',
        'id_usuario',
        'firmado_en',
        'latitud',
        'longitud',
        'ruta_imagen_firma',
        'hash_documento',
        'token_verificacion',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'firmado_en' => 'datetime',
        ];
    }

    public function instrumento(): BelongsTo
    {
        return $this->belongsTo(Instrumento::class, 'id_instrumento');
    }

    /**
     * Firmas sin hacer de instrumentos ya aprobados (listos para firmar).
     */
    public function scopePendientes(Builder $query): void
    {
        $query->whereNull('firmado_en')
            ->whereHas('instrumento', fn ($q) => $q->enEstado('aprobado'));
    }
}
