<?php

namespace App\Models;

use Database\Factories\InstitucionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Institucion extends Model
{
    /** @use HasFactory<InstitucionFactory> */
    use HasFactory, SoftDeletes;

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
            'suspended_at' => 'datetime',
        ];
    }
}
