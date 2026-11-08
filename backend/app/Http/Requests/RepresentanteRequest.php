<?php

namespace App\Http\Requests;

use App\Models\Representante;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RepresentanteRequest extends FormRequest
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
        $actual = $id ? Representante::withTrashed()->find($id) : null;
        $tipoDocumento = $this->input('tipo_documento', $actual?->tipo_documento);
        $crear = $this->isMethod('POST');
        $requerido = $crear ? 'required' : 'sometimes|required';

        return [
            'nombre' => [$requerido, 'string', 'max:255'],
            'apellido' => [$requerido, 'string', 'max:255'],
            'tipo_documento' => [$requerido, 'string', 'max:255'],
            'numero_documento' => [
                $requerido,
                'string',
                'max:255',
                Rule::unique('representante', 'numero_documento')
                    ->where(fn ($query) => $query->where('tipo_documento', $tipoDocumento))
                    ->ignore($id),
            ],
            'correo_electronico' => ['nullable', 'email', 'max:255'],
            'telefono' => ['nullable', 'string', 'max:255'],
        ];
    }
}
