<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IdentidadUsuario extends Model
{
    protected $table = 'identidad_usuario';

    protected $fillable = [
        'id_usuario',
        'ruta_firma',
        'firma_registrada_en',
        'facial_registrado_en',
        'huella_registrada_en',
    ];

    protected $casts = [
        'firma_registrada_en' => 'datetime',
        'facial_registrado_en' => 'datetime',
        'huella_registrada_en' => 'datetime',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario');
    }
}
