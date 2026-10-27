<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

/**
 * Para tablas con suspended_at y suspended_by (usuario, institucion, usuario_perfil).
 */
trait Suspendible
{
    public function initializeSuspendible(): void
    {
        $this->mergeCasts(['suspended_at' => 'datetime']);
    }

    public function suspender(): void
    {
        $this->forceFill(['suspended_at' => now(), 'suspended_by' => Auth::id()])->save();
    }

    public function reactivar(): void
    {
        $this->forceFill(['suspended_at' => null, 'suspended_by' => null])->save();
    }

    public function estaSuspendido(): bool
    {
        return $this->suspended_at !== null;
    }

    public function scopeActivos(Builder $query): void
    {
        $query->whereNull($this->qualifyColumn('suspended_at'));
    }
}
