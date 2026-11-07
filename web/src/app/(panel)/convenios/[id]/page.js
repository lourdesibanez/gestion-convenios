import { Suspense } from 'react'
import DetalleConvenio from './DetalleConvenio'

async function Contenido({ params }) {
  const { id } = await params
  return <DetalleConvenio id={id} />
}

export default function Page({ params }) {
  return (
    <Suspense fallback={<p>Cargando...</p>}>
      <Contenido params={params} />
    </Suspense>
  )
}