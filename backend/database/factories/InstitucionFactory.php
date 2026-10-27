<?php

namespace Database\Factories;

use App\Models\Institucion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Institucion>
 */
class InstitucionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre' => fake()->company(),
            'identificacion_fiscal' => fake()->unique()->numerify('30-########-#'),
            'domicilio' => fake()->address(),
            'es_interna' => false,
        ];
    }

    /**
     * UNLPam o una de sus unidades académicas.
     */
    public function interna(): static
    {
        return $this->state(fn (array $attributes) => [
            'es_interna' => true,
        ]);
    }
}
