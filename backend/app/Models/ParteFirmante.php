<?php

namespace App\Models;

use App\Models\Concerns\Auditoria;
use Illuminate\Database\Eloquent\Model;

class ParteFirmante extends Model
{
    use Auditoria;

    protected $table = 'parte_firmante';

    protected $fillable = [
        'id_institucion',
        'id_instrumento',
        'fecha_firma'
    ];

    protected function casts(): array
    {
        return [
            'fecha_firma' => 'date',
        ];
    }

    public function institucion()
    {
        return $this->belongsTo(Institucion::class, 'id_institucion');
    }

    public function instrumento()
    {
        return $this->belongsTo(Instrumento::class, 'id_instrumento');
    }
}