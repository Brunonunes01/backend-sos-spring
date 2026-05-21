import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import EmptyState from '../../components/EmptyState'
import PageHeader from '../../components/PageHeader'
import {
  listarCategorias,
  excluirCategoria
} from '../../services/categoriaService'

function CategoriaList() {
  const [categorias, setCategorias] = useState([])
  const [busca, setBusca] = useState('')
  const navigate = useNavigate()

  async function carregarCategorias() {
    const dados = await listarCategorias()
    setCategorias(dados)
  }

  useEffect(() => {
    carregarCategorias()
  }, [])

  async function handleExcluir(id) {
    const confirmar = window.confirm('Deseja desativar esta categoria?')

    if (!confirmar) return

    try {
      await excluirCategoria(id)
      alert('Categoria desativada com sucesso.')
      carregarCategorias()
    } catch (error) {
      alert(error.message)
    }
  }

  const categoriasFiltradas = categorias.filter((categoria) => {
    const termo = busca.toLowerCase()
    return [categoria.nome, categoria.descricao]
      .some((campo) => String(campo || '').toLowerCase().includes(termo))
  })

  return (
    <Layout>
      <PageHeader
        eyebrow="Catálogo"
        title="Categorias"
        description="Organize os serviços por área técnica para facilitar a montagem de ordens."
        actions={
          <button className="btn btn-primary" onClick={() => navigate('/categorias/novo')}>
            + Nova Categoria
          </button>
        }
      />

      <div className="summary-strip">
        <div className="summary-item">
          <p className="summary-label">Total</p>
          <p className="summary-value">{categorias.length}</p>
        </div>
        <div className="summary-item">
          <p className="summary-label">Com descrição</p>
          <p className="summary-value">{categorias.filter((categoria) => categoria.descricao).length}</p>
        </div>
        <div className="summary-item">
          <p className="summary-label">Resultado</p>
          <p className="summary-value">{categoriasFiltradas.length}</p>
        </div>
      </div>

      <div className="toolbar-card">
        <div className="toolbar-field">
          <label className="form-label">Buscar categoria</label>
          <input
            className="form-control"
            placeholder="Nome ou descrição"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      <div className="table-card">
        {categoriasFiltradas.length > 0 ? (
          <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {categoriasFiltradas.map((categoria) => (
                <tr key={categoria.id}>
                  <td className="muted-cell">#{categoria.id}</td>
                  <td className="table-primary-text">{categoria.nome}</td>
                  <td>{categoria.descricao || '-'}</td>
                  <td>
                    <span className="action-group">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => navigate(`/categorias/editar/${categoria.id}`)}
                    >
                      Editar
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleExcluir(categoria.id)}
                    >
                      Excluir
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
            title="Nenhuma categoria encontrada"
            description="Crie categorias para manter o catálogo de serviços organizado."
            action={
              <button className="btn btn-primary" onClick={() => navigate('/categorias/novo')}>
                + Nova Categoria
              </button>
            }
          />
        )}
      </div>
    </Layout>
  )
}

export default CategoriaList
