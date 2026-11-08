'use client'
import { useState } from 'react'
import Buscador from "../../components/Buscador";
import ListaConvenios from "../../components/ListarConvenios";

export default function ConveniosPage() {
  const [filtros, setFiltros] = useState({})
  return (
    <>
      <Buscador onBuscar={setFiltros} />
      <ListaConvenios filtros={filtros} />
    </>
  )
}