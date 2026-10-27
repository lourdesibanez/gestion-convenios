<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Estado extends Model
{
    use SoftDeletes;

    protected $table = 'estado';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nombre',
    ];

    /**
     * Ids de los estados pedidos, por nombre.
     *
     * @param  list<string>  $nombres
     * @return list<int>
     */
    public static function ids(array $nombres): array
    {
        return static::whereIn('nombre', $nombres)->pluck('id')->all();
    }
}
