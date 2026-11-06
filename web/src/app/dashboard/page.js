'use client'
import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Sidebar from "../components/SideBar";
import Buscador from "../components/Buscador";
import ListaConvenios from "../components/ListarConvenios";

export default function Home() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [filtros, setFiltros] = useState({});// datos de los filtros que se van a pasar al buscador
  
  return (
    <>
      <div className="bloque-dashboard">
        {menuAbierto && (
          <div className="fondo-menu" onClick={() => setMenuAbierto(false)} />
        )}

        <Sidebar abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />

        <div className="columna-principal">
          <Header onMenu={() => setMenuAbierto(true)} />
          <main className="contenido">
              <Buscador onBuscar={setFiltros} />
              <ListaConvenios filtros={filtros} />
          </main>
          <Footer />
        </div>
        
      </div>
      
    </>
  );
}