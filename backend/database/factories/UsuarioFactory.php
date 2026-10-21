<?php

namespace Database\Factories;

use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<Usuario>
 */
class UsuarioFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre_usuario' => fake()->unique()->userName(),
            'email' => fake()->unique()->safeEmail(),
            'contrasena' => static::$password ??= Hash::make('password'),
        ];
    }

    /**
     * Indicate that the user is suspended.
     */
    public function suspendido(): static
    {
        return $this->state(fn (array $attributes) => [
            'suspended_at' => now(),
        ]);
    }
}
