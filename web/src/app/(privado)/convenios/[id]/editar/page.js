import { Suspense } from 'react'
import CrearConvenioPage from '@/app/components/convenio/CrearConvenioPage'

async function Contenido({ params }) {
  const { id } = await params

  return <CrearConvenioPage id={id} />
}

export default function Page({ params }) {
  return (
    <Suspense
      fallback={
        <div className="text-center py-5">
          <div className="spinner-border spinner-border-sm text-primary me-2" />
          Cargando editor...
        </div>
      }
    >
      <Contenido params={params} />
    </Suspense>
  )
}