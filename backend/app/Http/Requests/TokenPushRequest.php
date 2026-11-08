<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TokenPushRequest extends FormRequest
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
            'push_token' => ['required', 'string', 'max:255'],
        ];
    }
}
