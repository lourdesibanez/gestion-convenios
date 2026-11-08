'use client'
import Link from "next/link";
import { usePathname } from "next/navigation";
import '../css/headerfooter.css'

const items = [
  { href: "/admin", label: "Panel", exacto: true },
  { href: "/admin/convenios", label: "Convenios" },
  { href: "#", label: "Revisión" },
  { href: "#", label: "Vencimientos" },
  { href: "#", label: "Partes y Personas" },
];

export default function Sidebar({ abierto, onCerrar }) {
  const pathname = usePathname();

  return (
    <aside className={`barra-lateral ${abierto ? "barra-lateral-abierta" : ""}`}>
      <div className="barra-lateral-logo">
        <img src="/Logo.png" alt="Logo" className="Logo" />
      </div>
      <nav className="barra-lateral-contenido">
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
      </nav>
    </aside>
  );
}