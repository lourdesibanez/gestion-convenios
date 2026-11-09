<?php

namespace App\Services;

use App\Models\Representante;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class RepresentanteWebService
{
    public function listar(): LengthAwarePaginator
    {
        return Representante::query()
            ->select('representante.*')
            ->selectSub(
                DB::table('representante_instrumento')
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('id_representante', 'representante.id')
                    ->whereNull('deleted_at'),
                'total_convenios',
            )
            ->latest('id')
            ->paginate(15);
    }
}