import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import EmptyState from '../../components/EmptyState'
import PageHeader from '../../components/PageHeader'
import {
  listarOrdens,
  alterarStatusOrdem,
  excluirOrdem
} from '../../services/ordemService'
import { listarClientes } from '../../services/clienteService'

function OrdemList() {
  const [ordens, setOrdens] = useState([])
  const [clientes, setClientes] = useState([])
  const [busca, setBusca] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')
  const [prioridadeFiltro, setPrioridadeFiltro] = useState('')
  const navigate = useNavigate()

  async function carregarDados() {
    const dadosOrdens = await listarOrdens()
    const dadosClientes = await listarClientes()

    setOrdens(dadosOrdens)
    setClientes(dadosClientes)
  }

  useEffect(() => {
    carregarDados()
  }, [])

  function obterNomeCliente(clienteId) {
    const cliente = clientes.find((item) => item.id === clienteId)
    return cliente ? cliente.nome : 'Cliente não encontrado'
  }

  function obterClasseStatus(status) {
    const mapa = {
      ABERTA: 'bg-primary',
      EM_ANDAMENTO: 'bg-warning text-dark',
      CONCLUIDA: 'bg-success',
      CANCELADA: 'bg-danger'
    }

    return mapa[status] || 'bg-secondary'
  }

  function obterProximoStatus(status) {
    if (status === 'ABERTA') return 'EM_ANDAMENTO'
    if (status === 'EM_ANDAMENTO') return 'CONCLUIDA'
    return null
  }

  async function handleAvancarStatus(ordem) {
    const proximoStatus = obterProximoStatus(ordem.status)

    if (!proximoStatus) {
      alert('Esta ordem não pode avançar mais.')
      return
    }

    try {
      await alterarStatusOrdem(ordem.id, proximoStatus)
      alert(`Status alterado para ${proximoStatus}.`)
      carregarDados()
    } catch (error) {
      alert(error.message)
    }
  }

  async function handleCancelar(id) {
    const confirmar = window.confirm('Deseja cancelar esta ordem?')

    if (!confirmar) return

    try {
      await excluirOrdem(id)
      alert('Ordem cancelada com sucesso.')
      carregarDados()
    } catch (error) {
      alert(error.message)
    }
  }

  const ordensFiltradas = ordens.filter((ordem) => {
    const clienteNome = ordem.clienteNome || obterNomeCliente(ordem.clienteId)
    const termo = busca.toLowerCase()
    const buscaOk = [
      ordem.id,
      clienteNome,
      ordem.status,
      ordem.prioridade,
      ordem.descricaoProblema
    ].some((campo) => String(campo || '').toLowerCase().includes(termo))
    const statusOk = statusFiltro ? ordem.status === statusFiltro : true
    const prioridadeOk = prioridadeFiltro ? ordem.prioridade === prioridadeFiltro : true

    return buscaOk && statusOk && prioridadeOk
  })

  const valorEmOrdens = ordens.reduce((total, ordem) => total + Number(ordem.valorTotal || 0), 0)

  return (
    <Layout>
      <PageHeader
        eyebrow="Operação"
        title="Ordens de Serviço"
        description="Acompanhe atendimento, execução, entrega e cancelamento das ordens."
        actions={
          <button className="btn btn-primary" onClick={() => navigate('/ordens/novo')}>
            + Nova Ordem
          </button>
        }
      />

      <div className="summary-strip">
        <div className="summary-item">
          <p className="summary-label">Total</p>
          <p className="summary-value">{ordens.length}</p>
        </div>
        <div className="summary-item">
          <p className="summary-label">Em andamento</p>
          <p className="summary-value">
            {ordens.filter((ordem) => ordem.status === 'EM_ANDAMENTO').length}
          </p>
        </div>
        <div className="summary-item">
          <p className="summary-label">Valor total</p>
          <p className="summary-value">R$ {valorEmOrdens.toFixed(2)}</p>
        </div>
        <div className="summary-item">
          <p className="summary-label">Resultado</p>
          <p className="summary-value">{ordensFiltradas.length}</p>
        </div>
      </div>

      <div className="toolbar-card">
        <div className="toolbar-field">
          <label className="form-label">Buscar ordem</label>
          <input
            className="form-control"
            placeholder="ID, cliente, status ou prioridade"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="toolbar-field">
          <label className="form-label">Status</label>
          <select
            className="form-select"
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="ABERTA">ABERTA</option>
            <option value="EM_ANDAMENTO">EM_ANDAMENTO</option>
            <option value="CONCLUIDA">CONCLUIDA</option>
            <option value="CANCELADA">CANCELADA</option>
          </select>
        </div>
        <div className="toolbar-field">
          <label className="form-label">Prioridade</label>
          <select
            className="form-select"
            value={prioridadeFiltro}
            onChange={(e) => setPrioridadeFiltro(e.target.value)}
          >
            <option value="">Todas</option>
            <option value="BAIXA">BAIXA</option>
            <option value="MEDIA">MEDIA</option>
            <option value="ALTA">ALTA</option>
            <option value="URGENTE">URGENTE</option>
          </select>
        </div>
      </div>

      <div className="table-card">
        {ordensFiltradas.length > 0 ? (
          <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Data Abertura</th>
                <th>Valor Total</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {ordensFiltradas.map((ordem) => (
                <tr key={ordem.id}>
                  <td className="muted-cell">#{ordem.id}</td>
                  <td className="table-primary-text">{ordem.clienteNome || obterNomeCliente(ordem.clienteId)}</td>
                  <td>{ordem.prioridade}</td>
                  <td>
                    <span className={`badge ${obterClasseStatus(ordem.status)}`}>
                      {ordem.status}
                    </span>
                  </td>
                  <td>{ordem.dataAbertura ? new Date(ordem.dataAbertura).toLocaleString('pt-BR') : '-'}</td>
                  <td className="table-primary-text">R$ {Number(ordem.valorTotal).toFixed(2)}</td>
                  <td>
                    <span className="action-group">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => navigate(`/ordens/editar/${ordem.id}`)}
                    >
                      Editar
                    </button>

                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => handleAvancarStatus(ordem)}
                    >
                      Avançar
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleCancelar(ordem.id)}
                    >
                      Cancelar
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
            title="Nenhuma ordem encontrada"
            description="Ajuste os filtros ou crie uma nova ordem de serviço."
            action={
              <button className="btn btn-primary" onClick={() => navigate('/ordens/novo')}>
                + Nova Ordem
              </button>
            }
          />
        )}
      </div>
    </Layout>
  )
}

export default OrdemList
