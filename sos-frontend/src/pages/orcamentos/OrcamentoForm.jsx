import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import PageHeader from '../../components/PageHeader'
import { listarClientes } from '../../services/clienteService'
import { listarServicos } from '../../services/servicoService'
import { sugerirPrecosProduto } from '../../services/inteligenciaService'
import {
  buscarOrcamentoPorId,
  criarOrcamento,
  atualizarOrcamento
} from '../../services/orcamentoService'

function novoItemProduto() {
  return {
    tipoItem: 'PRODUTO',
    descricaoItem: '',
    quantidade: 1,
    precoUnitario: 0,
    subtotal: 0,
    referenciaLink: '',
    referenciaFonte: ''
  }
}

function criarItemProduto(produto) {
  return {
    tipoItem: 'PRODUTO',
    descricaoItem: produto.titulo,
    quantidade: 1,
    precoUnitario: Number(produto.preco || 0),
    subtotal: Number(produto.preco || 0),
    referenciaLink: produto.link || '',
    referenciaFonte: produto.loja || 'Web'
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

function montarLinkBuscaKabum(consulta) {
  return `https://www.kabum.com.br/busca/${encodeURIComponent(consulta || '').replace(/%20/g, '-').toLowerCase()}`
}

function montarLinkBuscaMercadoLivre(consulta) {
  return `https://lista.mercadolivre.com.br/${encodeURIComponent(consulta || '').replace(/%20/g, '-').toLowerCase()}`
}

const REGEX_DESCRICAO_PRODUTO = /^(?=.*[A-Za-zÀ-ÿ])[A-Za-zÀ-ÿ0-9 .-]+$/

function OrcamentoForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const editando = !!id

  const [clientes, setClientes] = useState([])
  const [servicos, setServicos] = useState([])
  const [servicoSelecionadoId, setServicoSelecionadoId] = useState('')
  const [erro, setErro] = useState('')
  const [consultaProduto, setConsultaProduto] = useState('')
  const [buscandoProdutos, setBuscandoProdutos] = useState(false)
  const [resultadoProdutos, setResultadoProdutos] = useState(null)
  const [erroBuscaProduto, setErroBuscaProduto] = useState('')

  const [form, setForm] = useState({
    clienteId: '',
    tipo: 'ORCAMENTO',
    prioridade: 'MEDIA',
    descricaoProblema: '',
    observacoes: '',
    itens: []
  })

  useEffect(() => {
    async function carregarDados() {
      try {
        const [dadosClientes, dadosServicos] = await Promise.all([
          listarClientes(),
          listarServicos()
        ])

        setClientes(dadosClientes)
        setServicos(dadosServicos)

        if (editando) {
          const orcamento = await buscarOrcamentoPorId(id)

          if (!orcamento) {
            alert('Orçamento não encontrado.')
            navigate('/orcamentos')
            return
          }

          const itemServico = (orcamento.itens || []).find((item) => item.tipoItem === 'SERVICO' || item.servicoId)
          const itensProduto = (orcamento.itens || [])
            .filter((item) => item.tipoItem !== 'SERVICO' && !item.servicoId)
            .map((item) => ({
              id: item.id,
              tipoItem: 'PRODUTO',
              descricaoItem: item.descricaoItem || '',
              quantidade: Number(item.quantidade || 1),
              precoUnitario: Number(item.precoUnitario || 0),
              subtotal: Number(item.subtotal || 0),
              referenciaLink: item.referenciaLink || '',
              referenciaFonte: item.referenciaFonte || ''
            }))

          setForm({
            clienteId: orcamento.clienteId,
            tipo: orcamento.tipo || 'ORCAMENTO',
            prioridade: orcamento.prioridade || 'MEDIA',
            descricaoProblema: orcamento.descricaoProblema || '',
            observacoes: orcamento.observacoes || '',
            itens: itensProduto
          })

          if (itemServico?.servicoId) {
            setServicoSelecionadoId(String(itemServico.servicoId))
          }
        }
      } catch (error) {
        alert(error.message)
      }
    }

    carregarDados()
  }, [editando, id, navigate])

  const servicoSelecionado = useMemo(() => {
    const idServico = Number(servicoSelecionadoId)
    if (!idServico) return null
    return servicos.find((servico) => Number(servico.id) === idServico) || null
  }, [servicoSelecionadoId, servicos])

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

  function adicionarProduto(produto) {
    setForm((prev) => ({
      ...prev,
      itens: [...prev.itens, criarItemProduto(produto)]
    }))
  }

  function adicionarProdutoManual() {
    setForm((prev) => ({
      ...prev,
      itens: [...prev.itens, novoItemProduto()]
    }))
  }

  function removerItem(index) {
    const novosItens = form.itens.filter((_, i) => i !== index)

    setForm((prev) => ({
      ...prev,
      itens: novosItens
    }))
  }

  async function buscarProdutos(e) {
    e.preventDefault()
    setErroBuscaProduto('')
    setResultadoProdutos(null)

    if (!consultaProduto.trim()) {
      setErroBuscaProduto('Informe o produto que precisa comprar.')
      return
    }

    try {
      setBuscandoProdutos(true)
      const resultado = await sugerirPrecosProduto(consultaProduto.trim(), 8)
      setResultadoProdutos(resultado)
    } catch (error) {
      setErroBuscaProduto(error.message)
    } finally {
      setBuscandoProdutos(false)
    }
  }

  function handleProdutoKeyDown(e) {
    if (e.key === 'Enter') {
      buscarProdutos(e)
    }
  }

  const valorProdutos = useMemo(() => {
    return form.itens.reduce(
      (total, item) => total + Number(item.subtotal || 0),
      0
    )
  }, [form.itens])

  const valorServico = Number(servicoSelecionado?.precoBase || 0)
  const valorTotal = valorServico + valorProdutos

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    if (!form.clienteId) {
      setErro('Selecione um cliente.')
      return
    }

    if (!servicoSelecionadoId) {
      setErro('Selecione o serviço do orçamento.')
      return
    }

    if (!form.descricaoProblema.trim()) {
      setErro('Preencha a descrição do problema.')
      return
    }

    const itemInvalido = form.itens.some((item) => {
      return !item.descricaoItem
        || !REGEX_DESCRICAO_PRODUTO.test(String(item.descricaoItem).trim())
        || Number(item.quantidade) <= 0
        || Number(item.precoUnitario) <= 0
    })

    if (itemInvalido) {
      setErro('Preencha corretamente os produtos. O nome do produto deve conter letras e não pode usar caracteres inválidos.')
      return
    }

    const itensPayload = [
      {
        tipoItem: 'SERVICO',
        servicoId: Number(servicoSelecionadoId),
        descricaoItem: servicoSelecionado?.nome || form.descricaoProblema.trim(),
        quantidade: 1,
        precoUnitario: valorServico > 0 ? valorServico : null,
        referenciaLink: null,
        referenciaFonte: null
      },
      ...form.itens.map((item) => ({
        tipoItem: 'PRODUTO',
        descricaoItem: String(item.descricaoItem).trim(),
        quantidade: Number(item.quantidade),
        precoUnitario: Number(item.precoUnitario),
        referenciaLink: item.referenciaLink || null,
        referenciaFonte: item.referenciaFonte || null
      }))
    ]

    const payload = {
      ...form,
      descricaoProblema: form.descricaoProblema.trim(),
      observacoes: form.observacoes.trim(),
      itens: itensPayload
    }

    try {
      if (editando) {
        await atualizarOrcamento(id, payload)
        alert('Orçamento atualizado com sucesso.')
      } else {
        await criarOrcamento(payload)
        alert('Orçamento cadastrado com sucesso.')
      }

      navigate('/orcamentos')
    } catch (error) {
      setErro(error.message)
    }
  }

  return (
    <Layout>
      <PageHeader
        eyebrow="Orçamentos"
        title={editando ? 'Editar Orçamento' : 'Novo Orçamento'}
        description="Selecione o serviço e, se necessário, adicione produtos e materiais para compor o orçamento."
      />

      <form onSubmit={handleSubmit}>
        {erro && <div className="alert alert-danger">{erro}</div>}

        <div className="form-layout">
          <div>
            <div className="form-section">
              <div className="form-section-header">
                <h2 className="form-section-title">Dados do orçamento</h2>
                <p className="form-section-description">Cliente, serviço, prioridade e descrição da solicitação.</p>
              </div>
              <div className="form-section-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
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

                  <div className="col-md-4 mb-3">
                    <label className="form-label">Serviço</label>
                    <select
                      className="form-select"
                      value={servicoSelecionadoId}
                      onChange={(e) => setServicoSelecionadoId(e.target.value)}
                    >
                      <option value="">Selecione</option>
                      {servicos.map((servico) => (
                        <option key={servico.id} value={servico.id}>
                          {servico.nome} - {formatarMoeda(servico.precoBase)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-2 mb-3">
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
                  <label className="form-label">Serviço solicitado / descrição do problema</label>
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
                <h2 className="form-section-title">Produtos para comprar (opcional)</h2>
                <p className="form-section-description">Use apenas quando o orçamento também incluir materiais/produtos.</p>
              </div>
              <div className="form-section-body">
                <div className="product-search-panel">
                  <div className="product-search-form">
                    <input
                      className="form-control"
                      value={consultaProduto}
                      onChange={(e) => setConsultaProduto(e.target.value)}
                      onKeyDown={handleProdutoKeyDown}
                      placeholder="Ex.: disjuntor bipolar 32A, cabo 2,5mm, tomada 20A"
                    />
                    <button type="button" className="btn btn-primary" disabled={buscandoProdutos} onClick={buscarProdutos}>
                      {buscandoProdutos ? 'Buscando...' : 'Buscar'}
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={adicionarProdutoManual}>
                      + Produto manual
                    </button>
                  </div>

                  {erroBuscaProduto && <div className="alert alert-danger mt-3 mb-0">{erroBuscaProduto}</div>}

                  {resultadoProdutos && (
                    <div className="product-results">
                      <div className="product-results-summary">
                        <strong>{resultadoProdutos.consulta}</strong>
                        {resultadoProdutos.precoMediano && (
                          <span>Mediana: {formatarMoeda(resultadoProdutos.precoMediano)}</span>
                        )}
                      </div>
                      {resultadoProdutos.observacao && (
                        <p className="product-results-note">{resultadoProdutos.observacao}</p>
                      )}

                      {resultadoProdutos.itens?.length > 0 ? (
                        <div className="product-results-list">
                          {resultadoProdutos.itens.map((produto, index) => (
                            <div key={`${produto.titulo}-${index}`} className="product-result-card">
                              <div className="product-result-media">
                                {produto.imagemUrl ? (
                                  <img src={produto.imagemUrl} alt={produto.titulo} />
                                ) : (
                                  <span>Sem imagem</span>
                                )}
                              </div>
                              <div>
                                <h3>{produto.titulo}</h3>
                                <div className="product-result-meta">
                                  <span>{produto.loja || 'Web'}</span>
                                  <span>{produto.condicao || 'condição não informada'}</span>
                                </div>
                                {produto.link && (
                                  <a href={produto.link} target="_blank" rel="noreferrer">
                                    Ver referência
                                  </a>
                                )}
                              </div>
                              <div className="product-result-action">
                                <strong>{formatarMoeda(produto.preco)}</strong>
                                <button type="button" className="btn btn-sm btn-success" onClick={() => adicionarProduto(produto)}>
                                  Adicionar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="product-empty">
                          <span>Nenhum produto encontrado para esta busca.</span>
                          <div className="product-empty-actions">
                            <a href={montarLinkBuscaKabum(resultadoProdutos.consulta)} target="_blank" rel="noreferrer">
                              Abrir na Kabum
                            </a>
                            <a href={montarLinkBuscaMercadoLivre(resultadoProdutos.consulta)} target="_blank" rel="noreferrer">
                              Abrir no Mercado Livre
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-header">
                <div className="d-flex justify-content-between align-items-center gap-3">
                  <div>
                    <h2 className="form-section-title">Carrinho de produtos (opcional)</h2>
                    <p className="form-section-description">Você pode salvar o orçamento apenas com serviço, sem produtos.</p>
                  </div>
                  <button type="button" className="btn btn-success" onClick={adicionarProdutoManual}>
                    + Produto
                  </button>
                </div>
              </div>
              <div className="form-section-body">
                {form.itens.length === 0 && (
                  <div className="alert alert-secondary mb-0">
                    Nenhum produto adicionado. Este orçamento será salvo apenas com o serviço selecionado.
                  </div>
                )}

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
                <small>Serviço selecionado</small>
                <strong>{servicoSelecionado ? servicoSelecionado.nome : 'Nenhum serviço selecionado'}</strong>
              </div>
              <div className="total-box mb-3">
                <small>Valor serviço</small>
                <strong>{formatarMoeda(valorServico)}</strong>
              </div>
              <div className="total-box mb-3">
                <small>Valor produtos</small>
                <strong>{formatarMoeda(valorProdutos)}</strong>
              </div>
              <div className="total-box mb-3">
                <small>Valor total</small>
                <strong>{formatarMoeda(valorTotal)}</strong>
              </div>
              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-primary">
                  Salvar Orçamento
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/orcamentos')}
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

export default OrcamentoForm
