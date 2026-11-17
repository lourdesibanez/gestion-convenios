<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IdentidadBiometriaRequest extends FormRequest
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
            'tipo' => ['required', 'string', 'in:facial,huella'],
        ];
    }
}
