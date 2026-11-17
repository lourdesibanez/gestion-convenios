<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class IdentidadFirmaRequest extends FormRequest
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
            // Mismo formato que la firma de convenios. ~2 MB en base64 alcanza de sobra.
            'firma' => ['required', 'string', 'starts_with:data:image/png;base64,', 'max:2800000'],
        ];
    }
}
