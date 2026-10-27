<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TipoInstrumento extends Model
{
    use SoftDeletes;

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
