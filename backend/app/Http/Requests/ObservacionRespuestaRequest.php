<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ObservacionRespuestaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('respuesta'))) {
            $this->merge([
                'respuesta' => trim($this->input('respuesta')),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'respuesta' => ['required', 'string', 'max:2000'],
        ];
    }
}