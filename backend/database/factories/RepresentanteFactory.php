<?php

namespace Database\Factories;

use App\Models\Representante;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Representante>
 */
class RepresentanteFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nombre' => fake()->firstName(),
            'apellido' => fake()->lastName(),
            'tipo_documento' => 'DNI',
            'numero_documento' => fake()->unique()->numerify('########'),
            'correo_electronico' => fake()->safeEmail(),
            'telefono' => fake()->phoneNumber(),
        ];
    }
}
