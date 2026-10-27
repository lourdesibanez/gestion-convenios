<?php

namespace App\Models;

use Database\Factories\InstrumentoFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Instrumento extends Model
{
    /** @use HasFactory<InstrumentoFactory> */
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'instrumento';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'codigo',
        'titulo',
        'id_tipo_instrumento',
        'id_institucion',
        'id_estado',
        'fecha_inicio',
        'fecha_fin',
        'fecha_firma',
        'fecha_preaviso',
        'numero_resolucion',
        'referencia_expediente',
        'notas',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'fecha_inicio' => 'date',
            'fecha_fin' => 'date',
            'fecha_firma' => 'date',
            'fecha_preaviso' => 'date',
        ];
    }

    /**
     * La clave primaria sigue siendo autoincremental; el uuid es la referencia del QR.
     *
     * @return list<string>
     */
    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    public function estado(): BelongsTo
    {
        return $this->belongsTo(Estado::class, 'id_estado');
    }

    public function tipo(): BelongsTo
    {
        return $this->belongsTo(TipoInstrumento::class, 'id_tipo_instrumento');
    }

    /**
     * Unidad responsable.
     */
    public function institucion(): BelongsTo
    {
        return $this->belongsTo(Institucion::class, 'id_institucion');
    }

    /**
     * Solo los instrumentos de las unidades del usuario (todos si tiene alcance global).
     */
    public function scopeVisiblePara(Builder $query, Usuario $usuario): void
    {
        $instituciones = $usuario->institucionesVisibles();

        if ($instituciones !== null) {
            $query->whereIn('id_institucion', $instituciones);
        }
    }

    public function scopeEnEstado(Builder $query, string ...$estados): void
    {
        $query->whereIn('id_estado', Estado::ids($estados));
    }

    /**
     * Firmados, ya iniciados y sin vencer (sin fecha_fin = sin vencimiento registrado).
     */
    public function scopeVigentes(Builder $query): void
    {
        $hoy = today()->toDateString();

        $query->enEstado('firmado')
            ->where(fn ($q) => $q->whereNull('fecha_inicio')->orWhere('fecha_inicio', '<=', $hoy))
            ->where(fn ($q) => $q->whereNull('fecha_fin')->orWhere('fecha_fin', '>=', $hoy));
    }
}
