<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

/**
 * Auditoría automática de los modelos. Cada evento completa solo sus columnas:
 *  - al crear:     created_at y created_by (updated_at y updated_by quedan vacíos)
 *  - al editar:    updated_at y updated_by
 *  - al borrar:    deleted_at y deleted_by (borrado lógico)
 *  - al restaurar: limpia deleted_at y deleted_by
 *
 * Las columnas *_by se completan con el usuario autenticado; sin usuario
 * (seeders, comandos, tareas programadas) quedan en null = sistema.
 *
 * Si la tabla no tiene alguna de las columnas *_by, el modelo declara cuáles usa:
 *     protected array $auditoria = ['created_by'];
 */
trait Auditoria
{
    private bool $restaurando = false;

    public static function bootAuditoria(): void
    {
        static::creating(fn (Model $modelo) => $modelo->asignarAuditor('created_by'));

        static::updating(function (Model $modelo) {
            if (! $modelo->restaurando) {
                $modelo->asignarAuditor('updated_by', siempre: true);
            }
        });

        static::deleting(function (Model $modelo) {
            // Solo en borrado lógico: un borrado definitivo no deja la fila.
            if (! method_exists($modelo, 'isForceDeleting') || $modelo->isForceDeleting()) {
                return;
            }

            // Sin timestamps, el borrado lógico no toca updated_at.
            $modelo->timestamps = false;

            if ($modelo->auditaColumna('deleted_by')) {
                $modelo->deleted_by = Auth::id();
                $modelo->saveQuietly();
            }
        });

        static::deleted(fn (Model $modelo) => $modelo->timestamps = true);

        static::registerModelEvent('restoring', function (Model $modelo) {
            $modelo->restaurando = true;
            $modelo->timestamps = false;

            if ($modelo->auditaColumna('deleted_by')) {
                $modelo->deleted_by = null;
            }
        });

        static::registerModelEvent('restored', function (Model $modelo) {
            $modelo->restaurando = false;
            $modelo->timestamps = true;
        });
    }

    /**
     * Reemplaza el comportamiento de Eloquent, que al crear completa también updated_at.
     */
    public function updateTimestamps()
    {
        if ($this->exists) {
            return parent::updateTimestamps();
        }

        $columna = $this->getCreatedAtColumn();

        if ($columna && ! $this->isDirty($columna)) {
            $this->setCreatedAt($this->freshTimestamp());
        }

        return $this;
    }

    /**
     * @return list<string>
     */
    public function columnasAuditoria(): array
    {
        return property_exists($this, 'auditoria') ? $this->auditoria : ['created_by', 'updated_by', 'deleted_by'];
    }

    public function auditaColumna(string $columna): bool
    {
        return in_array($columna, $this->columnasAuditoria(), true);
    }

    /**
     * Al crear, respeta un valor cargado a mano; al editar, siempre registra al editor.
     */
    protected function asignarAuditor(string $columna, bool $siempre = false): void
    {
        if ($this->auditaColumna($columna) && ($siempre || ! $this->isDirty($columna))) {
            $this->{$columna} = Auth::id();
        }
    }
}
