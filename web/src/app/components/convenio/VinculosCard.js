import Link from 'next/link'

export default function VinculosCard({ convenio }) {
  const { marco, adendas = [] } = convenio
  return (
    <div className="card shadow-sm">
      <div className="card-body small">
        <h2 className="h6 text-primary">Vínculos</h2>

        {marco && (
          <div className="mb-2">
            <span className="badge text-bg-primary me-2">MAR</span>
            <Link href={`/dashboard/convenios/${marco.id}`}>{marco.codigo} · marco</Link>
          </div>
        )}

        <div className="mb-2 ms-3">
          <span className="badge text-bg-secondary me-2">ESP</span>
          este instrumento
        </div>

        {adendas.map((a) => (
          <div key={a.id} className="mb-1 ms-5">
            <span className="badge text-bg-warning me-2">ADE</span>
            <Link href={`/dashboard/convenios/${a.id}`}>{a.codigo}</Link>
          </div>
        ))}
      </div>
    </div>
  )
}