import api from './api';

export async function listarOrdens(params = {}) {
  const response = await api.get('/ordens', { params });
  return Array.isArray(response.data) ? response.data : (response.data?.content ?? []);
}

export async function buscarOrdemPorId(id) {
  const response = await api.get(`/ordens/${id}`);
  return response.data;
}

export async function criarOrdem(novaOrdem) {
  const response = await api.post('/ordens', novaOrdem);
  return response.data;
}

export async function atualizarOrdem(id, dadosAtualizados) {
  const response = await api.put(`/ordens/${id}`, dadosAtualizados);
  return response.data;
}

export async function alterarStatusOrdem(id, novoStatus) {
  const response = await api.patch(`/ordens/${id}/status`, { status: novoStatus });
  return response.data;
}

export async function excluirOrdem(id) {
  await api.delete(`/ordens/${id}`);
}
