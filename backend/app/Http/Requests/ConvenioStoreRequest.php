<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ConvenioStoreRequest extends FormRequest
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
        // Solo puede crear en las unidades donde tiene el permiso de crear.
        $institucionesPermitidas = $this->user()->institucionesConPermiso('instrumento.crear');
        $reglaInstitucion = Rule::exists('institucion', 'id')
            ->whereNull('deleted_at')
            ->where('es_interna', true);

        if ($institucionesPermitidas !== null) {
            $reglaInstitucion->whereIn('id', $institucionesPermitidas);
        }

        return [
            'titulo' => ['required', 'string', 'max:255'],
            'id_tipo_instrumento' => [
                'required',
                'integer',
                Rule::exists('tipo_instrumento', 'id')->whereNull('deleted_at'),
            ],
            'id_institucion' => ['required', 'integer', $reglaInstitucion],
            'fecha_inicio' => ['nullable', 'date'],
            'fecha_fin' => ['nullable', 'date', 'after_or_equal:fecha_inicio'],
            'fecha_preaviso' => ['nullable', 'date'],
            'numero_resolucion' => ['nullable', 'string', 'max:255'],
            'referencia_expediente' => ['nullable', 'string', 'max:255'],
            'notas' => ['nullable', 'string'],
            'objeto' => ['nullable', 'string'],
            'marco_legal' => ['nullable', 'string'],
            'obligaciones' => ['nullable', 'string'],
            'condiciones_terminacion' => ['nullable', 'string'],
            'condiciones_renovacion' => ['nullable', 'string'],
            'confidencialidad' => ['nullable', 'string'],
            'alcance_actividades' => ['nullable', 'string'],
        ];
    }
}
