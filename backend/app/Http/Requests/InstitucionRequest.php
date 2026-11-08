<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InstitucionRequest extends FormRequest
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
        $requerido = $this->isMethod('POST') ? 'required' : 'sometimes|required';

        return [
            'nombre' => [$requerido, 'string', 'max:255'],
            'identificacion_fiscal' => [
                $requerido,
                'string',
                'max:255',
                Rule::unique('institucion', 'identificacion_fiscal')->ignore($this->route('id')),
            ],
            'domicilio' => ['nullable', 'string', 'max:255'],
            'id_representante' => ['nullable', 'integer', 'exists:representante,id'],
            'es_interna' => ['sometimes', 'boolean'],
            'latitud' => ['nullable', 'numeric', 'between:-90,90'],
            'longitud' => ['nullable', 'numeric', 'between:-180,180'],
        ];
    }
}
