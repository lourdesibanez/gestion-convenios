'use client'
import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import '../css/headerfooter.css'

const items = [
  { href: "/admin", label: "Panel", exacto: true },
  { href: "/admin/convenios", label: "Convenios" },
  { href: "/admin/revision", label: "Revisión" },
  { href: "/admin/vencimientos", label: "Vencimientos" },
  { href: "/admin/partes", label: "Partes y Personas" },
];

// Dibuja la lista. No usa hooks, solo recibe el pathname.
function Lista({ pathname, onCerrar }) {
  return (
    <ul>
      {items.map((it) => {
        const activo = it.exacto
          ? pathname === it.href
          : pathname.startsWith(it.href);

        return (
          <li key={it.href}>
            <Link
              href={it.href}
              onClick={onCerrar}
              className={activo ? "activo" : ""}
              aria-current={activo ? "page" : undefined}
            >
              {it.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

// Este es el único que lee la URL (por eso va dentro del Suspense)
function ListaConResaltado({ onCerrar }) {
  const pathname = usePathname();
  return <Lista pathname={pathname} onCerrar={onCerrar} />;
}

export default function Sidebar({ abierto, onCerrar }) {
  return (
    <aside className={`barra-lateral ${abierto ? "barra-lateral-abierta" : ""}`}>
      <div className="barra-lateral-logo">
        <img src="/Logo.png" alt="Logo" className="Logo" />
      </div>

      <nav className="barra-lateral-contenido">
        <Suspense fallback={<Lista pathname="" onCerrar={onCerrar} />}>
          <ListaConResaltado onCerrar={onCerrar} />
        </Suspense>
      </nav>
    </aside>
  );
}