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
            'tipo' => [
                'sometimes',
                'nullable',
                'integer',
                Rule::exists('tipo_instrumento', 'id')->whereNull('deleted_at'),
            ],
            'unidad'    => ['sometimes', 'nullable', 'integer', Rule::exists('institucion', 'id')],
            'anio'      => ['sometimes', 'nullable', 'integer', 'min:1900', 'max:2100'],
            'q'         => ['sometimes', 'nullable', 'string', 'max:100'],
            'orden'     => ['sometimes', 'nullable', 'in:recientes,antiguos,titulo'],
            'per_page'  => ['sometimes', 'integer', 'min:1', 'max:50'],
            'estado' => ['nullable', 'string', 'in:borrador,revision,aprobado,firmado'],
        ];
    }
}
