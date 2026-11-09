<?php

namespace App\Http\Requests;

use App\Models\ParteFirmante;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class ParteFirmanteRequest extends FormRequest
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
        $id = $this->route('id');
        $requerido = $this->isMethod('POST') ? 'required' : 'sometimes|required';

        return [
            'id_institucion' => [$requerido, 'integer', 'exists:institucion,id'],
            'id_instrumento' => [$requerido, 'integer', 'exists:instrumento,id'],
            'fecha_firma' => ['nullable', 'date'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $id = $this->route('id');
            $actual = $id ? ParteFirmante::find($id) : null;
            $idInstitucion = $this->input('id_institucion', $actual?->id_institucion);
            $id_instrumento = $this->input('id_instrumento', $actual?->id_instrumento);

            if ($idInstitucion === null || $id_instrumento === null) {
                return;
            }

            $duplicado = ParteFirmante::query()
                ->where('id_institucion', $idInstitucion)
                ->where('id_instrumento', $id_instrumento)
                ->when($id, fn ($query) => $query->whereKeyNot($id))
                ->exists();

            if ($duplicado) {
                $validator->errors()->add('id_instrumento', 'La institución ya es parte firmante de este instrumento.');
            }
        });
    }
}
