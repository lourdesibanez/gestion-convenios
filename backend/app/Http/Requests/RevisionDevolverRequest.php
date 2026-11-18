<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RevisionDevolverRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('fundamento'))) {
            $this->merge([
                'fundamento' => trim($this->input('fundamento')),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'version' => ['required', 'integer', 'min:1'],
            'fundamento' => ['required', 'string', 'max:2000'],
        ];
    }
}