'use client'

import { useState } from 'react'
import '../css/general.css'

export default function Buscador({ onBuscar }) {
  const [filtros, setFiltros] = useState({
    buscar: '',
    tipo: '',
    estado: '',
    unidad: '',
    firmadoDesde: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFiltros((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onBuscar?.(filtros) // le pasa los filtros a la página
  }

  return (
    <div className="buscador">
      <form className="form-buscador" onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-12 col-lg-4">
            <label htmlFor="buscar" className="form-label">Buscar</label>
            <input
              type="text"
              className="form-control"
              id="buscar"
              name="buscar"
              value={filtros.buscar}
              onChange={handleChange}
            />
          </div>

          <div className="col-12 col-md-4 col-lg-2">
            <label htmlFor="tipo" className="form-label">Tipo</label>
            <select
              className="form-select"
              id="tipo"
              name="tipo"
              value={filtros.tipo}
              onChange={handleChange}
            >
              <option value="">Todos</option>
              <option value="marco">Marco</option>
              <option value="especifico">Específico</option>
              <option value="adenda">Adenda</option>
            </select>
          </div>

          <div className="col-12 col-md-4 col-lg-2">
            <label htmlFor="estado" className="form-label">Estado</label>
            <select
              className="form-select"
              id="estado"
              name="estado"
              value={filtros.estado}
              onChange={handleChange}
            >
              <option value="">Todos</option>
              <option value="borrador">Borrador</option>
              <option value="revision">Revisión</option>
              <option value="aprobado">Aprobado</option>
              <option value="firmado">Firmado</option>
              <option value="rescindido">Rescindido</option>
            </select>
          </div>

          <div className="col-12 col-md-4 col-lg-2">
            <label htmlFor="unidad" className="form-label">Unidad</label>
            <select
              className="form-select"
              id="unidad"
              name="unidad"
              value={filtros.unidad}
              onChange={handleChange}
            >
              <option value="">Todas</option>
              <option value="ingenieria">Ingeniería</option>
              <option value="agronomia">Agronomía</option>
              <option value="exactas">Cs. Exactas</option>
              <option value="rectorado">Rectorado</option>
            </select>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <label htmlFor="firmadoDesde" className="form-label">Firmado desde</label>
            <input
              type="date"
              className="form-control"
              id="firmadoDesde"
              name="firmadoDesde"
              value={filtros.firmadoDesde}
              onChange={handleChange}
            />
          </div>

          <div className="col-12 col-md-6 col-lg-3 d-flex align-items-end">
            <button type="submit" className="btn btn-primary btn-buscador">
              Buscar
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}