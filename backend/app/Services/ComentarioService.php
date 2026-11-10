<?php

namespace App\Services;

use App\Models\Comentario;
use App\Models\Instrumento;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class ComentarioService
{
    private const PALABRAS_OFENSIVAS = [
        'basura',
        'boludo',
        'boluda',
        'forro',
        'forra',
        'idiota',
        'imbecil',
        'mierda',
        'pelotudo',
        'pelotuda',
        'estupido',
        'estupida',
    ];

    /**
     * @return Collection<int, Comentario>
     */
    public function listar(Instrumento $instrumento): Collection
    {
        return Comentario::query()
            ->with('usuario:id,nombre,apellido')
            ->where('id_instrumento', $instrumento->id)
            ->orderBy('created_at')
            ->orderBy('id')
            ->get();
    }

    public function crear(
        Instrumento $instrumento,
        Usuario $usuario,
        string $texto,
    ): Comentario {
        $comentario = new Comentario([
            'comentario' => $texto,
            'es_ofensivo' => $this->esOfensivo($texto),
        ]);

        $comentario->instrumento()->associate($instrumento);
        $comentario->usuario()->associate($usuario);
        $comentario->save();

        return $comentario->load('usuario:id,nombre,apellido');
    }

    private function esOfensivo(string $texto): bool
    {
        $normalizado = Str::ascii(mb_strtolower($texto));
        $normalizado = preg_replace('/[^a-z0-9]+/u', ' ', $normalizado) ?? $normalizado;
        $normalizado = trim(preg_replace('/\s+/', ' ', $normalizado) ?? $normalizado);

        foreach (self::PALABRAS_OFENSIVAS as $palabra) {
            $palabraNormalizada = Str::ascii(mb_strtolower($palabra));

            if (preg_match(
                '/(?:^| )' . preg_quote($palabraNormalizada, '/') . '(?= |$)/u',
                $normalizado,
            )) {
                return true;
            }
        }

        return false;
    }
}
