<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ObservacionStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('contenido'))) {
            $this->merge([
                'contenido' => trim($this->input('contenido')),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'contenido' => ['required', 'string', 'max:2000'],
        ];
    }
}