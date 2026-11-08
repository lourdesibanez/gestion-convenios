import Link from 'next/link'

export default function Header({ onMenu, admin = false }) {
  return (
    <header className="header">
      {onMenu && (
        <button className="boton-hamburguesa" aria-label="Abrir menú" onClick={onMenu}>
          ☰
        </button>
      )}
      <div className="header-contenido">
            <h3 className='header-titulo'>Convenios</h3>
            <div className="header-opciones">
                {admin ? (
                // más adelante: botón con logout() en lugar de Link
                <Link href="/login" className="btn btn-outline-danger btn-sm">
                    Cerrar sesión
                </Link>
                ) : (
                <Link href="/login" className="btn btn-primary">
                    Iniciar Sesión
                </Link>
                )}
            </div>        
        </div>  
      
    </header>
  )
}