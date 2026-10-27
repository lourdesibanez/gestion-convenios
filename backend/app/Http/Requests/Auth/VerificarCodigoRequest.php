<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class VerificarCodigoRequest extends FormRequest
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
            'id_desafio' => ['required', 'integer'],
            'codigo' => ['required', 'digits:6'],
            'dispositivo' => ['required', 'string', 'max:100'],
        ];
    }
}
