import api from './api'

export async function listarOrcamentos(params = {}) {
  const response = await api.get('/ordens', { params: { size: 200, ...params, tipo: 'ORCAMENTO' } })
  return Array.isArray(response.data) ? response.data : (response.data?.content ?? [])
}

export async function buscarOrcamentoPorId(id) {
  const response = await api.get(`/ordens/${id}`)
  return response.data
}

export async function criarOrcamento(novoOrcamento) {
  const response = await api.post('/ordens', normalizarPayloadOrcamento(novoOrcamento))
  return response.data
}

export async function atualizarOrcamento(id, dadosAtualizados) {
  const response = await api.put(`/ordens/${id}`, normalizarPayloadOrcamento(dadosAtualizados))
  return response.data
}

export async function alterarStatusOrcamento(id, novoStatus) {
  const response = await api.patch(`/ordens/${id}/status`, { status: novoStatus })
  return response.data
}

export async function converterOrcamentoEmOrdem(id) {
  const orcamento = await buscarOrcamentoPorId(id)
  const payload = {
    ...normalizarPayloadOrcamento(orcamento),
    tipo: 'ORDEM_SERVICO'
  }

  const response = await api.put(`/ordens/${id}`, payload)
  return response.data
}

function normalizarPayloadOrcamento(dados) {
  return {
    clienteId: Number(dados.clienteId),
    tipo: dados.tipo || 'ORCAMENTO',
    prioridade: dados.prioridade,
    descricaoProblema: String(dados.descricaoProblema || '').trim(),
    observacoes: String(dados.observacoes || '').trim(),
    itens: (dados.itens || []).map((item) => {
      const tipoItem = item.tipoItem === 'SERVICO' ? 'SERVICO' : 'PRODUTO'

      if (tipoItem === 'SERVICO') {
        return {
          tipoItem: 'SERVICO',
          servicoId: Number(item.servicoId),
          descricaoItem: String(item.descricaoItem || item.servicoNome || '').trim(),
          quantidade: Number(item.quantidade || 1),
          precoUnitario: item.precoUnitario == null || item.precoUnitario === ''
            ? null
            : Number(item.precoUnitario),
          referenciaLink: item.referenciaLink || null,
          referenciaFonte: item.referenciaFonte || null
        }
      }

      return {
        tipoItem: 'PRODUTO',
        descricaoItem: String(item.descricaoItem || item.descricao || '').trim(),
        quantidade: Number(item.quantidade),
        precoUnitario: Number(item.precoUnitario),
        referenciaLink: item.referenciaLink || null,
        referenciaFonte: item.referenciaFonte || null
      }
    })
  }
}
