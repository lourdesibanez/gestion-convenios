'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL

const ESTADOS = [
  { clave: 'borrador', label: 'Borrador', color: 'secondary' },
  { clave: 'revision', label: 'En revisión', color: 'warning' },
  { clave: 'aprobado', label: 'Aprobados', color: 'primary' },
  { clave: 'firmado', label: 'Firmados', color: 'success' },
]

const norm = (t) =>
  (t ?? '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

export default function Panel() {
  const [convenios, setConvenios] = useState([])

  useEffect(() => {
    async function cargar() {
      try {
        const res = await fetch(`${API}/api/convenios`, { headers: { Accept: 'application/json' } })
        if (!res.ok) throw new Error(`Error ${res.status}`)
        const data = await res.json()
        setConvenios(Array.isArray(data) ? data : data.data ?? [])
      } catch (err) {
        console.error(err)
      }
    }
    cargar()
  }, [])

  const cuenta = (clave) => convenios.filter((c) => norm(c.estado) === clave).length

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 text-primary mb-0">Panel</h1>
        <Link href="/admin/convenios" className="btn btn-primary btn-sm">
          Ver convenios
        </Link>
      </div>

      <div className="row g-3">
        {ESTADOS.map((e) => (
          <div className="col-6 col-lg-3" key={e.clave}>
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <div className="small text-muted">{e.label}</div>
                <div className={`display-6 fw-bold text-${e.color}`}>{cuenta(e.clave)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}