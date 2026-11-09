'use client'
import { useState } from 'react'
import Link from 'next/link'
import Buscador from '../../../components/Buscador'
import ListarConvenios from '../../../components/ListarConvenios'

export default function ConveniosAdmin() {
  const [filtros, setFiltros] = useState({})

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
        <div className="d-flex gap-2">
          <Link href="/admin/convenios/nuevo" className="btn btn-primary btn-sm">
            + Nuevo convenio
          </Link>
        </div>
      </div>

      <Buscador onBuscar={setFiltros} />
      <ListarConvenios filtros={filtros} base="/admin/convenios" admin/>
    </>
  )
}