import Link from "next/link";
import '../css/headerfooter.css'


export default function Sidebar({ abierto, onCerrar }) {
  return (
    <aside className={`barra-lateral ${abierto ? "barra-lateral-abierta" : ""}`}>
      <div className="barra-lateral-logo">
        <img src="/Logo.png" alt="Logo" className="Logo" />
      </div>
      <nav className="barra-lateral-contenido">
        <ul>
          <li><Link href="#" onClick={onCerrar}>Panel</Link></li>
          <li><Link href="/admin/convenios" onClick={onCerrar}>Convenios</Link></li>
          <li><Link href="#" onClick={onCerrar}>Revisión</Link></li>
          <li><Link href="#" onClick={onCerrar}>Vencimientos</Link></li>
          <li><Link href="#" onClick={onCerrar}>Partes y Personas</Link></li>
        </ul>
      </nav>
    </aside>
  );
}