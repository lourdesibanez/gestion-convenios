<?php

namespace App\Models;

use App\Models\Concerns\Auditoria;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Archivo extends Model
{
    use SoftDeletes, Auditoria;

    protected $table = 'archivo';

    protected $fillable = [
        'id_instrumento',
        'nombre',
        'tipo_documento',
        'tipo_mime',
        'tamanio_bytes',
        'hash_sha256',
        'hash_original',
        'ruta',
        'origen',
        'sellado_en',
        'created_by',
        'deleted_by',
    ];

    protected $casts = [
        'sellado_en' => 'datetime',
    ];

    public function instrumento()
    {
        return $this->belongsTo(Instrumento::class, 'id_instrumento');
    }
}
