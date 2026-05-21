import api from './api';

export async function listarOrcamentos(params = {}) {
  const response = await api.get('/ordens', { params: { ...params, tipo: 'ORCAMENTO' } });
  return Array.isArray(response.data) ? response.data : (response.data?.content ?? []);
}

export async function buscarOrcamentoPorId(id) {
  const response = await api.get(`/ordens/${id}`);
  return response.data;
}

export async function criarOrcamento(novoOrcamento) {
  const response = await api.post('/ordens', normalizarPayloadOrcamento(novoOrcamento));
  return response.data;
}

export async function atualizarOrcamento(id, dadosAtualizados) {
  const response = await api.put(`/ordens/${id}`, normalizarPayloadOrcamento(dadosAtualizados));
  return response.data;
}

export async function alterarStatusOrcamento(id, novoStatus) {
  const response = await api.patch(`/ordens/${id}/status`, { status: novoStatus });
  return response.data;
}

export async function converterOrcamentoEmOrdem(id) {
  const orcamento = await buscarOrcamentoPorId(id);
  const payload = {
    ...normalizarPayloadOrcamento(orcamento),
    tipo: 'ORDEM_SERVICO'
  };

  const response = await api.put(`/ordens/${id}`, payload);
  return response.data;
}

function normalizarPayloadOrcamento(dados) {
  return {
    clienteId: Number(dados.clienteId),
    tipo: 'ORCAMENTO',
    prioridade: dados.prioridade,
    descricaoProblema: dados.descricaoProblema,
    observacoes: dados.observacoes,
    itens: (dados.itens || []).map((item) => {
      return {
        tipoItem: 'PRODUTO',
        descricaoItem: item.descricaoItem || item.descricao || item.servicoNome,
        quantidade: Number(item.quantidade),
        precoUnitario: Number(item.precoUnitario),
        referenciaLink: item.referenciaLink || null,
        referenciaFonte: item.referenciaFonte || null
      };
    })
  };
}
