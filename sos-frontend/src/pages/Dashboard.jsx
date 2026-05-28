import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { listarClientes } from '../services/clienteService'
import { listarCategorias } from '../services/categoriaService'
import { listarServicos } from '../services/servicoService'
import { listarOrdens } from '../services/ordemService'

function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [dados, setDados] = useState({
    clientes: [],
    categorias: [],
    servicos: [],
    ordens: []
  })

  useEffect(() => {
    async function carregarDashboard() {
      setLoading(true)
      setErro('')

      try {
        const [clientes, categorias, servicos, ordens] = await Promise.all([
          listarClientes(),
          listarCategorias(),
          listarServicos(),
          listarOrdens()
        ])

        setDados({ clientes, categorias, servicos, ordens })
      } catch (error) {
        setErro(error.message || 'Erro ao carregar dashboard.')
      } finally {
        setLoading(false)
      }
    }

    carregarDashboard()
  }, [])

  const resumo = useMemo(() => {
    const ordensAbertas = dados.ordens.filter((ordem) => ordem.status === 'ABERTA')
    const ordensAndamento = dados.ordens.filter((ordem) => ordem.status === 'EM_ANDAMENTO')
    const ordensConcluidas = dados.ordens.filter((ordem) => ordem.status === 'CONCLUIDA')
    const ordensCanceladas = dados.ordens.filter((ordem) => ordem.status === 'CANCELADA')

    const valorTotalOrdens = dados.ordens.reduce(
      (total, ordem) => total + Number(ordem.valorTotal || 0),
      0
    )

    const valorConcluido = ordensConcluidas.reduce(
      (total, ordem) => total + Number(ordem.valorTotal || 0),
      0
    )

    return {
      totalClientes: dados.clientes.length,
      totalCategorias: dados.categorias.length,
      totalServicos: dados.servicos.length,
      totalOrdens: dados.ordens.length,
      ordensAbertas: ordensAbertas.length,
      ordensAndamento: ordensAndamento.length,
      ordensConcluidas: ordensConcluidas.length,
      ordensCanceladas: ordensCanceladas.length,
      valorTotalOrdens,
      valorConcluido,
      ultimasOrdens: [...dados.ordens].sort((a, b) => b.id - a.id).slice(0, 6)
    }
  }, [dados])

  function formatarStatus(status) {
    return String(status || '').replaceAll('_', ' ')
  }

  function badgeStatus(status) {
    const mapa = {
      ABERTA: 'bg-primary',
      EM_ANDAMENTO: 'bg-warning text-dark',
      CONCLUIDA: 'bg-success',
      CANCELADA: 'bg-danger'
    }

    return <span className={`badge ${mapa[status] || 'bg-secondary'}`}>{formatarStatus(status)}</span>
  }

  function formatarMoeda(valor) {
    return `R$ ${Number(valor || 0).toFixed(2)}`
  }

  if (loading) {
    return (
      <Layout>
        <div className="panel-card">Carregando dashboard...</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <div className="page-kicker">Centro de controle</div>
          <h1>Visão geral operacional</h1>
          <p>
            Acompanhe cadastros e status das ordens de serviço em tempo real.
          </p>
        </div>

        <div className="dashboard-hero-grid">
          <div className="hero-stat">
            <span>Ordens ativas</span>
            <strong>{resumo.ordensAbertas + resumo.ordensAndamento}</strong>
          </div>
          <div className="hero-stat">
            <span>OS concluídas</span>
            <strong>{resumo.ordensConcluidas}</strong>
          </div>
          <div className="hero-stat">
            <span>Valor concluído</span>
            <strong>{formatarMoeda(resumo.valorConcluido)}</strong>
          </div>
        </div>
      </section>

      {erro && <div className="alert alert-danger mt-3">{erro}</div>}

      <div className="row">
        <div className="col-sm-6 col-xl-3 mb-4">
          <div className="metric-card metric-primary">
            <p className="metric-label">Clientes</p>
            <h3 className="metric-value">{resumo.totalClientes}</h3>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3 mb-4">
          <div className="metric-card metric-neutral">
            <p className="metric-label">Categorias</p>
            <h3 className="metric-value">{resumo.totalCategorias}</h3>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3 mb-4">
          <div className="metric-card metric-neutral">
            <p className="metric-label">Serviços</p>
            <h3 className="metric-value">{resumo.totalServicos}</h3>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3 mb-4">
          <div className="metric-card metric-warning">
            <p className="metric-label">Ordens totais</p>
            <h3 className="metric-value">{resumo.totalOrdens}</h3>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="content-card">
          <div className="content-card-header">
            <h2 className="content-card-title">Distribuição de ordens</h2>
          </div>
          <div className="content-card-body">
            <div className="registry-grid">
              <div>
                <span>ABERTAS</span>
                <strong>{resumo.ordensAbertas}</strong>
              </div>
              <div>
                <span>EM ANDAMENTO</span>
                <strong>{resumo.ordensAndamento}</strong>
              </div>
              <div>
                <span>CONCLUÍDAS</span>
                <strong>{resumo.ordensConcluidas}</strong>
              </div>
              <div>
                <span>CANCELADAS</span>
                <strong>{resumo.ordensCanceladas}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="content-card">
          <div className="content-card-header">
            <h2 className="content-card-title">Financeiro</h2>
          </div>
          <div className="content-card-body">
            <div className="finance-stack">
              <div>
                <span>Valor total em ordens</span>
                <strong>{formatarMoeda(resumo.valorTotalOrdens)}</strong>
              </div>
              <div>
                <span>Valor de ordens concluídas</span>
                <strong>{formatarMoeda(resumo.valorConcluido)}</strong>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="row mt-4">
        <div className="col-xl-12 mb-4">
          <div className="panel-card activity-panel">
            <div className="panel-header">
              <h5 className="panel-title">Últimas ordens</h5>
              <span className="text-muted small">{resumo.ultimasOrdens.length} registros</span>
            </div>

            <div className="activity-list">
              {resumo.ultimasOrdens.map((ordem) => (
                <div className="activity-item" key={ordem.id}>
                  <div>
                    <strong>Ordem #{ordem.id}</strong>
                    <span>{badgeStatus(ordem.status)}</span>
                  </div>
                  <b>{formatarMoeda(ordem.valorTotal)}</b>
                </div>
              ))}

              {resumo.ultimasOrdens.length === 0 && (
                <div className="activity-empty">Nenhuma ordem encontrada.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
