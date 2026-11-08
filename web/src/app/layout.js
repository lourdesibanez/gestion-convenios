import './css/cssBoostrap/bootstrap.min.css'
import './css/general.css'
import './css/headerfooter.css'
import { AuthProvider } from './context/authContext'

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}