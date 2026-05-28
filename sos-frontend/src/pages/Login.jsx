import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/authService'

function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email || !senha) {
      setError('Preencha email e senha')
      return
    }

    try {
      await login(email, senha)
      navigate('/dashboard')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          setError('Não foi possível conectar ao backend. Verifique se a API está rodando na porta 8081.')
        } else if (err.response.status === 401) {
          setError('E-mail ou senha inválidos. Tente novamente.')
        } else {
          setError(err.message)
        }
      } else {
        setError('Falha inesperada ao fazer login.')
      }
      console.error(err)
    }
  }

  return (
    <div className="login-page">
      <div className="login-shell">
        <section className="login-aside">
          <div>
            <span className="brand-mark">OS</span>
            <h1>Controle suas ordens com mais clareza.</h1>
            <p>
              Acompanhe clientes, serviços e ordens de serviço em uma área operacional
              simples de consultar.
            </p>
          </div>
          <div className="small text-white-50">Sistema de Ordens de Serviço</div>
        </section>

        <section className="login-form-panel">
          <h2>Acessar conta</h2>
          <p className="text-muted mb-4">Entre para continuar no painel administrativo.</p>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">E-mail</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                list="dominios-email-login"
              />
              <datalist id="dominios-email-login">
                <option value="@gmail.com" />
                <option value="@outlook.com" />
                <option value="@hotmail.com" />
                <option value="@yahoo.com" />
              </datalist>
            </div>

            <div className="mb-4">
              <label className="form-label">Senha</label>
              <input
                type="password"
                className="form-control"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2">
              Entrar
            </button>
          </form>

          <div className="mt-3 small text-muted">
            Não tem conta? Solicite criação com o administrador do sistema.
          </div>
        </section>
      </div>
    </div>
  )
}

export default Login
