import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import PageHeader from '../../components/PageHeader'
import {
  buscarUsuarioPorId,
  criarUsuario,
  atualizarUsuario
} from '../../services/usuarioService'

function UsuarioForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const editando = !!id

  const [form, setForm] = useState({
    nome: '',
    email: '',
    perfil: 'ATENDENTE',
    senha: ''
  })

  const [erro, setErro] = useState('')

  useEffect(() => {
    async function carregarUsuario() {
      if (!editando) return

      try {
        const usuario = await buscarUsuarioPorId(id)

        if (!usuario) {
          alert('Usuário não encontrado.')
          navigate('/usuarios')
          return
        }

        setForm({
          nome: usuario.nome || '',
          email: usuario.email || '',
          perfil: usuario.perfil || 'ATENDENTE',
          senha: ''
        })
      } catch (error) {
        alert(error.message)
      }
    }

    carregarUsuario()
  }, [editando, id, navigate])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function validarFormulario() {
    const nome = form.nome.trim()
    const email = form.email.trim().toLowerCase()

    if (!nome || !email || !form.perfil) {
      return 'Preencha nome, e-mail e perfil.'
    }

    if (!editando && !form.senha) {
      return 'Preencha a senha provisória para o novo usuário.'
    }

    if (form.senha && form.senha.length < 6) {
      return 'Senha deve ter pelo menos 6 caracteres.'
    }

    return ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    const mensagemErro = validarFormulario()
    if (mensagemErro) {
      setErro(mensagemErro)
      return
    }

    const payload = {
      nome: form.nome.trim(),
      email: form.email.trim().toLowerCase(),
      perfil: form.perfil,
      senha: form.senha || null
    }

    if (!editando) {
      payload.senha = form.senha
    }

    try {
      if (editando) {
        await atualizarUsuario(id, payload)
        alert('Usuário atualizado com sucesso.')
      } else {
        await criarUsuario(payload)
        alert('Usuário cadastrado com sucesso.')
      }

      navigate('/usuarios')
    } catch (error) {
      setErro(error.message)
    }
  }

  return (
    <Layout>
      <PageHeader
        eyebrow="Administração"
        title={editando ? 'Editar Usuário' : 'Novo Usuário'}
        description="Defina perfil e senha provisória para liberar o primeiro acesso do usuário."
      />

      <form onSubmit={handleSubmit}>
        {erro && <div className="alert alert-danger">{erro}</div>}

        <div className="form-section">
          <div className="form-section-header">
            <h2 className="form-section-title">Dados do usuário</h2>
            <p className="form-section-description">Após o primeiro login, o usuário poderá trocar a própria senha em Configuração da Conta.</p>
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
              <div className="col-md-4 mb-3">
                <label className="form-label">Perfil</label>
                <select
                  className="form-select"
                  name="perfil"
                  value={form.perfil}
                  onChange={handleChange}
                  required
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="TECNICO">TECNICO</option>
                  <option value="ATENDENTE">ATENDENTE</option>
                </select>
              </div>

              <div className="col-md-8 mb-3">
                <label className="form-label">
                  {editando ? 'Nova senha (opcional)' : 'Senha provisória'}
                </label>
                <input
                  type="password"
                  className="form-control"
                  name="senha"
                  value={form.senha}
                  onChange={handleChange}
                  minLength="6"
                  placeholder={editando ? 'Preencha apenas para trocar a senha' : 'Mínimo 6 caracteres'}
                  required={!editando}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate('/usuarios')}
          >
            Cancelar
          </button>

          <button type="submit" className="btn btn-primary">
            Salvar Usuário
          </button>
        </div>
      </form>
    </Layout>
  )
}

export default UsuarioForm
