import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import PageHeader from '../../components/PageHeader'
import { listarClientes } from '../../services/clienteService'
import {
  buscarOrdemPorId,
  criarOrdem,
  atualizarOrdem
} from '../../services/ordemService'

function novoItemProduto() {
  return {
    tipoItem: 'PRODUTO',
    quantidade: 1,
    precoUnitario: 0,
    subtotal: 0,
    descricaoItem: '',
    referenciaLink: '',
    referenciaFonte: ''
  }
}

function calcularSubtotal(item) {
  return Number(item.quantidade || 0) * Number(item.precoUnitario || 0)
}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}

function OrdemForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const editando = !!id

  const [clientes, setClientes] = useState([])
  const [erro, setErro] = useState('')

  const [form, setForm] = useState({
    clienteId: '',
    tipo: 'ORDEM_SERVICO',
    prioridade: 'MEDIA',
    descricaoProblema: '',
    observacoes: '',
    itens: [novoItemProduto()]
  })

  useEffect(() => {
    async function carregarDados() {
      try {
        const dadosClientes = await listarClientes()
        setClientes(dadosClientes)

        if (editando) {
          const ordem = await buscarOrdemPorId(id)

          if (!ordem) {
            alert('Ordem não encontrada.')
            navigate('/ordens')
            return
          }

          const itens = (ordem.itens || []).map((item) => ({
            id: item.id,
            tipoItem: 'PRODUTO',
            descricaoItem: item.descricaoItem || item.servicoNome || '',
            quantidade: Number(item.quantidade || 1),
            precoUnitario: Number(item.precoUnitario || 0),
            subtotal: Number(item.subtotal || 0),
            referenciaLink: item.referenciaLink || '',
            referenciaFonte: item.referenciaFonte || ''
          }))

          setForm({
            clienteId: ordem.clienteId,
            tipo: ordem.tipo || 'ORDEM_SERVICO',
            prioridade: ordem.prioridade || 'MEDIA',
            descricaoProblema: ordem.descricaoProblema || '',
            observacoes: ordem.observacoes || '',
            itens: itens.length > 0 ? itens : [novoItemProduto()]
          })
        }
      } catch (error) {
        alert(error.message)
      }
    }

    carregarDados()
  }, [editando, id, navigate])

  function handleChange(e) {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  function atualizarItem(index, campo, valor) {
    setForm((prev) => {
      const novosItens = [...prev.itens]
      const itemAtual = { ...novosItens[index] }

      itemAtual[campo] = valor
      itemAtual.subtotal = calcularSubtotal(itemAtual)
      novosItens[index] = itemAtual

      return {
        ...prev,
        itens: novosItens
      }
    })
  }

  function adicionarProduto() {
    setForm((prev) => ({
      ...prev,
      itens: [...prev.itens, novoItemProduto()]
    }))
  }

  function removerItem(index) {
    if (form.itens.length === 1) {
      alert('A ordem precisa ter pelo menos um item no carrinho.')
      return
    }

    const novosItens = form.itens.filter((_, i) => i !== index)

    setForm((prev) => ({
      ...prev,
      itens: novosItens
    }))
  }

  const valorTotal = useMemo(() => {
    return form.itens.reduce(
      (total, item) => total + Number(item.subtotal || 0),
      0
    )
  }, [form.itens])

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    if (!form.clienteId) {
      setErro('Selecione um cliente.')
      return
    }

    if (!form.descricaoProblema) {
      setErro('Preencha a descrição do problema.')
      return
    }

    const itemInvalido = form.itens.some((item) => {
      return !item.descricaoItem || Number(item.quantidade) <= 0 || Number(item.precoUnitario) <= 0
    })

    if (itemInvalido) {
      setErro('Preencha corretamente os produtos do carrinho.')
      return
    }

    const payload = {
      clienteId: Number(form.clienteId),
      tipo: form.tipo,
      prioridade: form.prioridade,
      descricaoProblema: form.descricaoProblema,
      observacoes: form.observacoes,
      itens: form.itens.map((item) => ({
        tipoItem: 'PRODUTO',
        descricaoItem: item.descricaoItem,
        quantidade: Number(item.quantidade),
        precoUnitario: Number(item.precoUnitario),
        referenciaLink: item.referenciaLink || null,
        referenciaFonte: item.referenciaFonte || null
      }))
    }

    try {
      if (editando) {
        await atualizarOrdem(id, payload)
        alert('Ordem atualizada com sucesso.')
      } else {
        await criarOrdem(payload)
        alert('Ordem cadastrada com sucesso.')
      }

      navigate('/ordens')
    } catch (error) {
      setErro(error.message)
    }
  }

  return (
    <Layout>
      <PageHeader
        eyebrow="Ordens"
        title={editando ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
        description="Serviços ficam fora do carrinho. Aqui entram somente produtos e materiais utilizados, com links de referência."
      />

      <form onSubmit={handleSubmit}>
        {erro && <div className="alert alert-danger">{erro}</div>}

        <div className="form-layout">
          <div>
            <div className="form-section">
              <div className="form-section-header">
                <h2 className="form-section-title">Dados da ordem</h2>
                <p className="form-section-description">Cliente, prioridade e descrição do atendimento.</p>
              </div>
              <div className="form-section-body">
                <div className="row">
                  <div className="col-md-7 mb-3">
                    <label className="form-label">Cliente</label>
                    <select
                      className="form-select"
                      name="clienteId"
                      value={form.clienteId}
                      onChange={handleChange}
                    >
                      <option value="">Selecione</option>
                      {clientes.map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label">Prioridade</label>
                    <select
                      className="form-select"
                      name="prioridade"
                      value={form.prioridade}
                      onChange={handleChange}
                    >
                      <option value="BAIXA">BAIXA</option>
                      <option value="MEDIA">MEDIA</option>
                      <option value="ALTA">ALTA</option>
                      <option value="URGENTE">URGENTE</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Descrição do Problema</label>
                  <textarea
                    className="form-control"
                    name="descricaoProblema"
                    rows="4"
                    value={form.descricaoProblema}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="form-label">Observações</label>
                  <textarea
                    className="form-control"
                    name="observacoes"
                    rows="3"
                    value={form.observacoes}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-header">
                <div className="d-flex justify-content-between align-items-center gap-3">
                  <div>
                    <h2 className="form-section-title">Carrinho da ordem</h2>
                    <p className="form-section-description">Somente produtos e materiais utilizados.</p>
                  </div>
                  <button type="button" className="btn btn-success" onClick={adicionarProduto}>
                    + Produto
                  </button>
                </div>
              </div>
              <div className="form-section-body">
                {form.itens.map((item, index) => (
                  <div key={index} className="item-card">
                    <div className="item-card-header">
                      <div className="d-flex align-items-center gap-2">
                        <h3 className="item-card-title">Item {index + 1}</h3>
                        <span className="badge text-bg-info">Produto</span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removerItem(index)}
                      >
                        Remover
                      </button>
                    </div>
                    <div className="item-card-body">
                      <div className="row align-items-end">
                        <div className="col-md-5 mb-3">
                          <label className="form-label">Produto/Material</label>
                          <input
                            className="form-control"
                            value={item.descricaoItem}
                            onChange={(e) => atualizarItem(index, 'descricaoItem', e.target.value)}
                            placeholder="Ex.: Cabo flexível 2,5mm"
                          />
                        </div>
                        <div className="col-md-2 mb-3">
                          <label className="form-label">Quantidade</label>
                          <input
                            type="number"
                            min="1"
                            className="form-control"
                            value={item.quantidade}
                            onChange={(e) => atualizarItem(index, 'quantidade', e.target.value)}
                          />
                        </div>
                        <div className="col-md-2 mb-3">
                          <label className="form-label">Preço</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="form-control"
                            value={item.precoUnitario}
                            onChange={(e) => atualizarItem(index, 'precoUnitario', e.target.value)}
                          />
                        </div>
                        <div className="col-md-3 mb-3">
                          <label className="form-label">Subtotal</label>
                          <input type="text" className="form-control" value={formatarMoeda(item.subtotal)} readOnly />
                        </div>
                      </div>

                      <div className="row align-items-end">
                        <div className="col-md-8 mb-2">
                          <label className="form-label">Link de referência (opcional)</label>
                          <input
                            className="form-control"
                            value={item.referenciaLink}
                            onChange={(e) => atualizarItem(index, 'referenciaLink', e.target.value)}
                            placeholder="https://..."
                          />
                        </div>
                        <div className="col-md-4 mb-2">
                          <label className="form-label">Fonte (opcional)</label>
                          <input
                            className="form-control"
                            value={item.referenciaFonte}
                            onChange={(e) => atualizarItem(index, 'referenciaFonte', e.target.value)}
                            placeholder="Ex.: Mercado Livre"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="form-sidebar">
            <div className="form-sidebar-card">
              <div className="total-box mb-3">
                <small>Valor total</small>
                <strong>{formatarMoeda(valorTotal)}</strong>
              </div>
              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-primary">
                  Salvar Ordem
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/ordens')}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </aside>
        </div>
      </form>
    </Layout>
  )
}

export default OrdemForm
