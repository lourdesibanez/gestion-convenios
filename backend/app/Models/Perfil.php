<?php

namespace App\Models;

use App\Models\Concerns\Auditoria;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Perfil extends Model
{
    use Auditoria, SoftDeletes;

    protected $table = 'perfil';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nombre',
    ];
}
