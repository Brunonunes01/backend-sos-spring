import axios from 'axios'
import { clearToken, getToken } from '../utils/auth'
import { extrairMensagemErroApi } from '../utils/apiError'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1'
})

api.interceptors.request.use((config) => {
  const token = getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearToken()
      localStorage.removeItem('usuario')
      if (window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }

    error.message = extrairMensagemErroApi(error)
    return Promise.reject(error)
  }
)

export default api
