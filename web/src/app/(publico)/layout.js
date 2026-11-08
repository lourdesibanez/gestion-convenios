import Header from '../components/Header'
import Footer from '../components/Footer'

export default function PublicoLayout({ children }) {
  return (
    <>
      <Header />
      <main className="contenido">{children}</main>
      <Footer />
    </>
  )
}

