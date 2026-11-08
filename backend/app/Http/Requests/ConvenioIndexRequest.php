<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ConvenioIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'estado' => ['sometimes', 'string', 'max:100', Rule::exists('estado', 'nombre')],
            'tipo' => ['sometimes', 'integer', Rule::exists('tipo_instrumento', 'id')],
            'unidad' => ['sometimes', 'integer', Rule::exists('institucion', 'id')],
            'q' => ['sometimes', 'string', 'max:100'],
        ];
    }
}
