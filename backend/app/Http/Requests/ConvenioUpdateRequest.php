<?php

namespace App\Http\Requests;

class ConvenioUpdateRequest extends ConvenioStoreRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'version' => ['required', 'integer', 'min:1'],
        ];
    }
}
