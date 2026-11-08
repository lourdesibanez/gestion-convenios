import { Suspense } from 'react'
import DetalleConvenio from '../../../../components/convenio/DetalleConvenio'

async function Contenido({ params }) {
  const { id } = await params
  return <DetalleConvenio id={id} admin={true} />
}

export default function Page({ params }) {
  return (
    <Suspense fallback={<p className="small text-muted">Cargando...</p>}>
      <Contenido params={params} />
    </Suspense>
  )
}