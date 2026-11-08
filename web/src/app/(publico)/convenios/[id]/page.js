import { Suspense } from 'react'
import DetalleConvenio from '../../../components/convenio/DetalleConvenio'

async function Contenido({ params }) {
  const { id } = await params
  return <DetalleConvenio id={id} />
}

export default function Page({ params }) {
  return (
    <div className="container py-4">
      <Suspense fallback={<p className="small text-muted">Cargando...</p>}>
        <Contenido params={params} />
      </Suspense>
    </div>
  )
}