import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import EmptyState from '../../components/EmptyState'
import PageHeader from '../../components/PageHeader'
import { listarServicos, excluirServico } from '../../services/servicoService'
import { listarCategorias } from '../../services/categoriaService'

function ServicoList() {
  const [servicos, setServicos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [categoriaFiltro, setCategoriaFiltro] = useState('')
  const [busca, setBusca] = useState('')
  const navigate = useNavigate()

  async function carregarDados() {
    const dadosServicos = await listarServicos()
    const dadosCategorias = await listarCategorias()

    setServicos(dadosServicos)
    setCategorias(dadosCategorias)
  }

  useEffect(() => {
    carregarDados()
  }, [])

  async function handleExcluir(id) {
    const confirmar = window.confirm('Deseja desativar este serviço?')

    if (!confirmar) return

    try {
      await excluirServico(id)
      alert('Serviço desativado com sucesso.')
      carregarDados()
    } catch (error) {
      alert(error.message)
    }
  }

  function obterNomeCategoria(categoriaId) {
    const categoria = categorias.find((item) => item.id === categoriaId)
    return categoria ? categoria.nome : 'Sem categoria'
  }

  const servicosFiltrados = servicos.filter((servico) => {
    const categoriaOk = categoriaFiltro
      ? servico.categoriaId === Number(categoriaFiltro)
      : true
    const termo = busca.toLowerCase()
    const buscaOk = [
      servico.nome,
      servico.descricao,
      servico.categoriaNome,
      obterNomeCategoria(servico.categoriaId)
    ].some((campo) => String(campo || '').toLowerCase().includes(termo))

    return categoriaOk && buscaOk
  })

  const ticketMedio = servicos.length
    ? servicos.reduce((total, servico) => total + Number(servico.precoBase || 0), 0) / servicos.length
    : 0

  return (
    <Layout>
      <PageHeader
        eyebrow="Catálogo"
        title="Serviços"
        description="Controle preços base, descrições e categorias dos serviços oferecidos."
        actions={
          <button className="btn btn-primary" onClick={() => navigate('/servicos/novo')}>
            + Novo Serviço
          </button>
        }
      />

      <div className="summary-strip">
        <div className="summary-item">
          <p className="summary-label">Total</p>
          <p className="summary-value">{servicos.length}</p>
        </div>
        <div className="summary-item">
          <p className="summary-label">Categorias</p>
          <p className="summary-value">{categorias.length}</p>
        </div>
        <div className="summary-item">
          <p className="summary-label">Preço médio</p>
          <p className="summary-value">R$ {ticketMedio.toFixed(2)}</p>
        </div>
        <div className="summary-item">
          <p className="summary-label">Resultado</p>
          <p className="summary-value">{servicosFiltrados.length}</p>
        </div>
      </div>

      <div className="toolbar-card">
        <div className="toolbar-field">
          <label className="form-label">Buscar serviço</label>
          <input
            className="form-control"
            placeholder="Nome, descrição ou categoria"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="toolbar-field">
          <label className="form-label">Filtrar por categoria</label>
          <select
            className="form-select"
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
          >
            <option value="">Todas</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-card">
        {servicosFiltrados.length > 0 ? (
          <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Preço Base</th>
                <th>Categoria</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {servicosFiltrados.map((servico) => (
                <tr key={servico.id}>
                  <td className="muted-cell">#{servico.id}</td>
                  <td className="table-primary-text">{servico.nome}</td>
                  <td>{servico.descricao || '-'}</td>
                  <td className="table-primary-text">R$ {Number(servico.precoBase).toFixed(2)}</td>
                  <td>{servico.categoriaNome || obterNomeCategoria(servico.categoriaId)}</td>
                  <td>
                    <span className="action-group">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => navigate(`/servicos/editar/${servico.id}`)}
                    >
                      Editar
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleExcluir(servico.id)}
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
            title="Nenhum serviço encontrado"
            description="Ajuste os filtros ou cadastre um novo serviço para compor orçamentos."
            action={
              <button className="btn btn-primary" onClick={() => navigate('/servicos/novo')}>
                + Novo Serviço
              </button>
            }
          />
        )}
      </div>
    </Layout>
  )
}

export default ServicoList
