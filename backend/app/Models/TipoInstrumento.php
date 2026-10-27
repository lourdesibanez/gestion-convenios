<?php

namespace App\Models;

use App\Models\Concerns\Auditoria;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TipoInstrumento extends Model
{
    use Auditoria, SoftDeletes;

    protected $table = 'tipo_instrumento';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nombre',
        'ambito',
        'categoria',
    ];
}
