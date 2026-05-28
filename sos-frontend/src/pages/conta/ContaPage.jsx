import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import PageHeader from '../../components/PageHeader'
import { me, atualizarConta } from '../../services/authService'

function ContaPage() {
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [form, setForm] = useState({
    nome: '',
    email: '',
    novaSenha: '',
    confirmarSenha: ''
  })

  useEffect(() => {
    async function carregarConta() {
      setLoading(true)
      setErro('')

      try {
        const usuario = await me()
        setForm((prev) => ({
          ...prev,
          nome: usuario.nome || '',
          email: usuario.email || ''
        }))
      } catch (error) {
        setErro(error.message)
      } finally {
        setLoading(false)
      }
    }

    carregarConta()
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setSucesso('')

    const nome = form.nome.trim()
    const email = form.email.trim().toLowerCase()

    if (!nome || !email) {
      setErro('Preencha nome e e-mail.')
      return
    }

    if (form.novaSenha && form.novaSenha.length < 6) {
      setErro('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (form.novaSenha !== form.confirmarSenha) {
      setErro('Confirmação de senha não confere.')
      return
    }

    try {
      await atualizarConta({
        nome,
        email,
        novaSenha: form.novaSenha || null
      })

      setForm((prev) => ({
        ...prev,
        nome,
        email,
        novaSenha: '',
        confirmarSenha: ''
      }))
      setSucesso('Conta atualizada com sucesso.')
    } catch (error) {
      setErro(error.message)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="panel-card">Carregando conta...</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <PageHeader
        eyebrow="Conta"
        title="Configuração da Conta"
        description="Atualize nome, e-mail e senha de acesso do seu usuário."
      />

      <form onSubmit={handleSubmit}>
        {erro && <div className="alert alert-danger">{erro}</div>}
        {sucesso && <div className="alert alert-success">{sucesso}</div>}

        <div className="form-section">
          <div className="form-section-header">
            <h2 className="form-section-title">Dados de acesso</h2>
            <p className="form-section-description">Mantenha essas informações atualizadas para facilitar o login e comunicação.</p>
          </div>
          <div className="form-section-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Nome</label>
                <input
                  type="text"
                  className="form-control"
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  maxLength="150"
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">E-mail</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  maxLength="150"
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Nova senha (opcional)</label>
                <input
                  type="password"
                  className="form-control"
                  name="novaSenha"
                  value={form.novaSenha}
                  onChange={handleChange}
                  minLength="6"
                  autoComplete="new-password"
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Confirmar nova senha</label>
                <input
                  type="password"
                  className="form-control"
                  name="confirmarSenha"
                  value={form.confirmarSenha}
                  onChange={handleChange}
                  minLength="6"
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Salvar Alterações
          </button>
        </div>
      </form>
    </Layout>
  )
}

export default ContaPage
