import Link from 'next/link'

export default function Inicio() {
  return (
    <div className="container py-4">
      {/* Portada */}
      <section className="p-4 p-md-5 mb-4 rounded-4 text-white" style={{ background: '#2b5086' }}>
        <h1 className="fw-bold display-6 mb-3">
          Convenios de la Facultad de Ingeniería
        </h1>
        <p className="lead mb-4" style={{ maxWidth: 640, opacity: 0.85 }}>
          Consultá los convenios marco, específicos y de pasantías vigentes de la UNLPam.
        </p>

        <div className="d-flex flex-wrap gap-2">
          <Link href="/convenios" className="btn btn-light fw-semibold">
            Ver convenios
          </Link>
          <Link href="/login" className="btn btn-outline-light">
            Acceso administración
          </Link>
        </div>
      </section>

      {/* Qué se puede consultar */}
      <section className="row g-3">
        <div className="col-12 col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h2 className="h6 text-primary">Convenios marco</h2>
              <p className="small text-muted mb-0">
                Acuerdos generales con instituciones, que dan origen a convenios específicos.
              </p>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h2 className="h6 text-primary">Convenios específicos</h2>
              <p className="small text-muted mb-0">
                Proyectos concretos de colaboración, investigación y desarrollo.
              </p>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h2 className="h6 text-primary">Pasantías</h2>
              <p className="small text-muted mb-0">
                Programas de pasantías educativas para estudiantes de la Facultad.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}