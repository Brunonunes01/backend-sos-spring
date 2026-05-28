import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import EmptyState from '../../components/EmptyState'
import PageHeader from '../../components/PageHeader'
import { listarUsuarios, excluirUsuario } from '../../services/usuarioService'

function UsuarioList() {
  const [usuarios, setUsuarios] = useState([])
  const [busca, setBusca] = useState('')
  const [perfilFiltro, setPerfilFiltro] = useState('')
  const [ativoFiltro, setAtivoFiltro] = useState('')
  const navigate = useNavigate()

  async function carregarUsuarios() {
    const dados = await listarUsuarios()
    setUsuarios(dados)
  }

  useEffect(() => {
    carregarUsuarios()
  }, [])

  async function handleExcluir(id) {
    const confirmar = window.confirm('Deseja desativar este usuário?')

    if (!confirmar) return

    try {
      await excluirUsuario(id)
      alert('Usuário desativado com sucesso.')
      carregarUsuarios()
    } catch (error) {
      alert(error.message)
    }
  }

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const termo = busca.toLowerCase()
    const buscaOk = [usuario.nome, usuario.email, usuario.perfil]
      .some((campo) => String(campo || '').toLowerCase().includes(termo))

    const perfilOk = perfilFiltro ? usuario.perfil === perfilFiltro : true
    const ativoOk = ativoFiltro
      ? String(Boolean(usuario.ativo)) === ativoFiltro
      : true

    return buscaOk && perfilOk && ativoOk
  })

  return (
    <Layout>
      <PageHeader
        eyebrow="Administração"
        title="Usuários"
        description="Cadastre e mantenha os acessos da equipe ao sistema."
        actions={
          <button className="btn btn-primary" onClick={() => navigate('/usuarios/novo')}>
            + Novo Usuário
          </button>
        }
      />

      <div className="summary-strip">
        <div className="summary-item">
          <p className="summary-label">Total</p>
          <p className="summary-value">{usuarios.length}</p>
        </div>
        <div className="summary-item">
          <p className="summary-label">Admins</p>
          <p className="summary-value">{usuarios.filter((usuario) => usuario.perfil === 'ADMIN').length}</p>
        </div>
        <div className="summary-item">
          <p className="summary-label">Ativos</p>
          <p className="summary-value">{usuarios.filter((usuario) => usuario.ativo).length}</p>
        </div>
        <div className="summary-item">
          <p className="summary-label">Resultado</p>
          <p className="summary-value">{usuariosFiltrados.length}</p>
        </div>
      </div>

      <div className="toolbar-card">
        <div className="toolbar-field">
          <label className="form-label">Buscar usuário</label>
          <input
            className="form-control"
            placeholder="Nome, e-mail ou perfil"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="toolbar-field">
          <label className="form-label">Perfil</label>
          <select
            className="form-select"
            value={perfilFiltro}
            onChange={(e) => setPerfilFiltro(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="ADMIN">ADMIN</option>
            <option value="TECNICO">TECNICO</option>
            <option value="ATENDENTE">ATENDENTE</option>
          </select>
        </div>
        <div className="toolbar-field">
          <label className="form-label">Situação</label>
          <select
            className="form-select"
            value={ativoFiltro}
            onChange={(e) => setAtivoFiltro(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>
        </div>
      </div>

      <div className="table-card">
        {usuariosFiltrados.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Perfil</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id}>
                    <td className="muted-cell">#{usuario.id}</td>
                    <td className="table-primary-text">{usuario.nome}</td>
                    <td>{usuario.email}</td>
                    <td>{usuario.perfil}</td>
                    <td>
                      <span className={`badge ${usuario.ativo ? 'bg-success' : 'bg-secondary'}`}>
                        {usuario.ativo ? 'ATIVO' : 'INATIVO'}
                      </span>
                    </td>
                    <td>
                      <span className="action-group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => navigate(`/usuarios/editar/${usuario.id}`)}
                        >
                          Editar
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleExcluir(usuario.id)}
                          disabled={!usuario.ativo}
                        >
                          Desativar
                        </button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="Nenhum usuário encontrado"
            description="Ajuste os filtros ou cadastre um novo usuário para liberar acesso."
            action={
              <button className="btn btn-primary" onClick={() => navigate('/usuarios/novo')}>
                + Novo Usuário
              </button>
            }
          />
        )}
      </div>
    </Layout>
  )
}

export default UsuarioList
