<?php

namespace Database\Factories;

use App\Models\Institucion;
use App\Models\Instrumento;
use App\Models\ParteFirmante;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ParteFirmante>
 */
class ParteFirmanteFactory extends Factory
{
    public function definition(): array
    {
        return [
            'id_institucion' => Institucion::factory()->interna(),
            'id_instrumento' => Instrumento::factory(),
            'fecha_firma' => fake()->optional()->date(),
        ];
    }
}
