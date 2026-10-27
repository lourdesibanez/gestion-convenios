<?php

namespace Database\Factories;

use App\Models\Estado;
use App\Models\Institucion;
use App\Models\Instrumento;
use App\Models\TipoInstrumento;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Requiere los catálogos cargados (CatalogoSeeder).
 *
 * @extends Factory<Instrumento>
 */
class InstrumentoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'codigo' => fake()->unique()->numerify('CV-2026-####'),
            'titulo' => fake()->sentence(4),
            'id_tipo_instrumento' => fn () => TipoInstrumento::query()->inRandomOrder()->value('id'),
            'id_institucion' => Institucion::factory()->interna(),
            'id_estado' => fn () => Estado::where('nombre', 'borrador')->value('id'),
        ];
    }

    public function enEstado(string $estado): static
    {
        return $this->state(fn (array $attributes) => [
            'id_estado' => Estado::where('nombre', $estado)->value('id'),
        ]);
    }

    /**
     * Firmado y vigente: firmado hace 2 meses, vence en 1 año.
     */
    public function vigente(): static
    {
        return $this->enEstado('firmado')->state(fn (array $attributes) => [
            'fecha_firma' => today()->subMonths(2),
            'fecha_inicio' => today()->subMonths(2),
            'fecha_fin' => today()->addYear(),
        ]);
    }
}
