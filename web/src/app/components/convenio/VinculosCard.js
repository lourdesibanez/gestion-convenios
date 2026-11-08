import Link from 'next/link'

export default function VinculosCard({ vinculos = [], idActual, base }) {
  return (
    <div className="card shadow-sm">
      <div className="card-body small">
        <h2 className="h6 text-primary">Vínculos</h2>

        {vinculos.length === 0 && <p className="text-muted mb-0">Sin vínculos.</p>}

        {vinculos.map((v) => {
          const soyOrigen = Number(v.origen_id) === Number(idActual)
          const otro = soyOrigen
            ? { id: v.destino_id, codigo: v.destino_codigo, titulo: v.destino_titulo }
            : { id: v.origen_id, codigo: v.origen_codigo, titulo: v.origen_titulo }

          return (
            <div key={`${v.origen_id}-${v.destino_id}-${v.tipo_vinculo}`} className="mb-2">
              <span className="badge text-bg-secondary me-2">{v.tipo_vinculo}</span>
              <Link href={`${base}/${otro.id}`}>{otro.codigo}</Link>
              <div className="text-muted">{otro.titulo}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}