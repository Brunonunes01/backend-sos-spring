import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import EmptyState from '../../components/EmptyState'
import PageHeader from '../../components/PageHeader'
import { listarClientes } from '../../services/clienteService'
import {
  listarOrcamentos,
  alterarStatusOrcamento,
  converterOrcamentoEmOrdem
} from '../../services/orcamentoService'

function OrcamentoList() {
  const [orcamentos, setOrcamentos] = useState([])
  const [clientes, setClientes] = useState([])
  const [busca, setBusca] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')
  const [prioridadeFiltro, setPrioridadeFiltro] = useState('')
  const navigate = useNavigate()

  async function carregarDados() {
    const dadosOrcamentos = await listarOrcamentos()
    const dadosClientes = await listarClientes()

    setOrcamentos(dadosOrcamentos)
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

  async function handleAvancarStatus(orcamento) {
    const proximoStatus = obterProximoStatus(orcamento.status)

    if (!proximoStatus) {
      alert('Este orçamento não pode avançar mais.')
      return
    }

    try {
      await alterarStatusOrcamento(orcamento.id, proximoStatus)
      alert(`Status alterado para ${proximoStatus}.`)
      carregarDados()
    } catch (error) {
      alert(error.message)
    }
  }

  async function handleCancelar(orcamento) {
    const confirmar = window.confirm('Deseja cancelar este orçamento?')

    if (!confirmar) return

    try {
      await alterarStatusOrcamento(orcamento.id, 'CANCELADA')
      alert('Orçamento cancelado com sucesso.')
      carregarDados()
    } catch (error) {
      alert(error.message)
    }
  }

  async function handleConverter(orcamento) {
    const confirmar = window.confirm('Deseja converter este orçamento em ordem de serviço?')

    if (!confirmar) return

    try {
      const resultado = await converterOrcamentoEmOrdem(orcamento.id)
      alert(`Orçamento convertido com sucesso para OS #${resultado.id}.`)
      carregarDados()
    } catch (error) {
      alert(error.message)
    }
  }

  const orcamentosFiltrados = orcamentos.filter((orcamento) => {
    const clienteNome = orcamento.clienteNome || obterNomeCliente(orcamento.clienteId)
    const termo = busca.toLowerCase()
    const buscaOk = [
      orcamento.id,
      clienteNome,
      orcamento.status,
      orcamento.prioridade,
      orcamento.descricaoProblema
    ].some((campo) => String(campo || '').toLowerCase().includes(termo))
    const statusOk = statusFiltro ? orcamento.status === statusFiltro : true
    const prioridadeOk = prioridadeFiltro ? orcamento.prioridade === prioridadeFiltro : true

    return buscaOk && statusOk && prioridadeOk
  })

  const valorTotal = orcamentos.reduce((total, item) => total + Number(item.valorTotal || 0), 0)

  return (
    <Layout>
      <PageHeader
        eyebrow="Comercial"
        title="Orçamentos"
        description="Monte orçamento, acompanhe status e converta para ordem de serviço quando necessário."
        actions={
          <button className="btn btn-primary" onClick={() => navigate('/orcamentos/novo')}>
            + Novo Orçamento
          </button>
        }
      />

      <div className="summary-strip">
        <div className="summary-item">
          <p className="summary-label">Total</p>
          <p className="summary-value">{orcamentos.length}</p>
        </div>
        <div className="summary-item">
          <p className="summary-label">Em andamento</p>
          <p className="summary-value">
            {orcamentos.filter((item) => item.status === 'EM_ANDAMENTO').length}
          </p>
        </div>
        <div className="summary-item">
          <p className="summary-label">Valor total</p>
          <p className="summary-value">R$ {valorTotal.toFixed(2)}</p>
        </div>
        <div className="summary-item">
          <p className="summary-label">Resultado</p>
          <p className="summary-value">{orcamentosFiltrados.length}</p>
        </div>
      </div>

      <div className="toolbar-card">
        <div className="toolbar-field">
          <label className="form-label">Buscar orçamento</label>
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
        {orcamentosFiltrados.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Prioridade</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Valor Total</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {orcamentosFiltrados.map((orcamento) => (
                  <tr key={orcamento.id}>
                    <td className="muted-cell">#{orcamento.id}</td>
                    <td className="table-primary-text">{orcamento.clienteNome || obterNomeCliente(orcamento.clienteId)}</td>
                    <td>{orcamento.prioridade}</td>
                    <td>
                      <span className={`badge ${obterClasseStatus(orcamento.status)}`}>
                        {orcamento.status}
                      </span>
                    </td>
                    <td>{orcamento.dataAbertura ? new Date(orcamento.dataAbertura).toLocaleString('pt-BR') : '-'}</td>
                    <td className="table-primary-text">R$ {Number(orcamento.valorTotal).toFixed(2)}</td>
                    <td>
                      <span className="action-group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => navigate(`/orcamentos/editar/${orcamento.id}`)}
                        >
                          Editar
                        </button>

                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleAvancarStatus(orcamento)}
                        >
                          Avançar
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleCancelar(orcamento)}
                        >
                          Cancelar
                        </button>

                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => handleConverter(orcamento)}
                        >
                          Converter
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
            title="Nenhum orçamento encontrado"
            description="Ajuste os filtros ou crie um orçamento para enviar ao cliente."
            action={
              <button className="btn btn-primary" onClick={() => navigate('/orcamentos/novo')}>
                + Novo Orçamento
              </button>
            }
          />
        )}
      </div>
    </Layout>
  )
}

export default OrcamentoList
