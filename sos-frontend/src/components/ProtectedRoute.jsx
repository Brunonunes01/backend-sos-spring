import { Navigate } from 'react-router-dom'
import { getToken } from '../utils/auth'

function obterUsuarioStorage() {
  try {
    const bruto = localStorage.getItem('usuario')
    return bruto ? JSON.parse(bruto) : null
  } catch {
    return null
  }
}

function ProtectedRoute({ children, allowedProfiles = null }) {
  const token = getToken()

  if (!token) {
    return <Navigate to="/" replace />
  }

  if (Array.isArray(allowedProfiles) && allowedProfiles.length > 0) {
    const usuario = obterUsuarioStorage()
    const perfil = usuario?.perfil

    if (!perfil || !allowedProfiles.includes(perfil)) {
      return <Navigate to="/dashboard" replace />
    }
  }

  return children
}

export default ProtectedRoute
