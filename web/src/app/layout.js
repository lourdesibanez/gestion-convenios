import './css/cssBoostrap/bootstrap.min.css'
import './css/general.css'
import './css/headerfooter.css'

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}