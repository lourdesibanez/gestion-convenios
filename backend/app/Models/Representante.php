<?php

namespace App\Models;

use App\Models\Concerns\Auditoria;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Representante extends Model
{
    use HasFactory, Auditoria, SoftDeletes;

    protected $table = 'representante';

    protected $fillable = [
        'nombre',
        'apellido',
        'tipo_documento',
        'numero_documento',
        'correo_electronico',
        'telefono',
    ];

    public function instituciones(): HasMany
    {
        return $this->hasMany(Institucion::class, 'id_representante');
    }
}
