<?php

namespace App\Services;

use App\Models\Institucion;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class InstitucionWebService
{
    public function listar(): LengthAwarePaginator
    {
        return Institucion::with('representante')
            ->withCount('partesFirmantes as total_convenios')
            ->latest('id')
            ->paginate(15);
    }
}