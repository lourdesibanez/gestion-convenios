<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ArchivoRequest extends FormRequest
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
            'id_instrumento'    => ['required', 'integer', 'exists:instrumento,id'],
            'tipo_documento'    => ['required', 'string', 'max:255'],
            'archivo'           => ['required', 'file', 'mimes:pdf', 'max:20480'],
            'origen'            => ['nullable', 'in:web,app_movil'],

        ];
    }
}
