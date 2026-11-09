<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegistrarFirmaRequest extends FormRequest
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
            'firma' => [
                'required',
                'string',
                'max:2800000',
                'regex:/^data:image\/png;base64,[A-Za-z0-9+\/]+=*$/',
            ],
            'acepta' => ['required', 'accepted'],
            'latitud' => ['required', 'numeric', 'between:-90,90'],
            'longitud' => ['required', 'numeric', 'between:-180,180'],
        ];
    }
}
