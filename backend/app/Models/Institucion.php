<?php

namespace App\Models;

use App\Models\Concerns\Auditoria;
use App\Models\Concerns\Suspendible;
use Database\Factories\InstitucionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Institucion extends Model
{
    /** @use HasFactory<InstitucionFactory> */
    use HasFactory, Auditoria, SoftDeletes, Suspendible;

    protected $table = 'institucion';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nombre',
        'identificacion_fiscal',
        'domicilio',
        'id_representante',
        'es_interna',
        'latitud',
        'longitud',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'es_interna' => 'boolean',
        ];
    }

    public function representante()
    {
        return $this->belongsTo(Representante::class, 'id_representante');
    }
}
