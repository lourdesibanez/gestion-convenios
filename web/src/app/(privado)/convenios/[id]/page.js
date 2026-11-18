import { Suspense } from 'react'
import DetalleConvenio from '@/app/components/convenio/DetalleConvenio'

async function Contenido({ params }) {
  const { id } = await params

  return <DetalleConvenio id={id} />
}

export default function Page({ params }) {
  return (
    <Suspense
      fallback={
        <p className="small text-muted">
          Cargando convenio...
        </p>
      }
    >
      <Contenido params={params} />
    </Suspense>
  )
}