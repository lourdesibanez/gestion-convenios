<?php

namespace Database\Seeders;

use App\Models\Usuario;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(CatalogoSeeder::class);

        $usuario = Usuario::factory()->create([
            'nombre_usuario' => 'test',
            'nombre' => 'Laura',
            'apellido' => 'Iriarte',
            'email' => 'test@example.com',
        ]);

        // Datos ficticios para ver las pantallas con contenido.
        if (app()->environment('local')) {
            $this->callWith(DemoSeeder::class, ['usuario' => $usuario]);
        }
    }
}
