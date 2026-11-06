import '../css/headerfooter.css'

export default function Header({ onMenu }) {
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
                <button className="btn btn-primary">+ Nuevo Convenio </button>
            </div>        
        </div>

    </header>
  );
}