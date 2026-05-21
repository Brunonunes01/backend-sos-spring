import api from './api';

export async function listarServicos(params = {}) {
  const response = await api.get('/servicos', { params: { ativo: true, ...params } });
  return Array.isArray(response.data) ? response.data : (response.data?.content ?? []);
}

export async function buscarServicoPorId(id) {
  const response = await api.get(`/servicos/${id}`);
  return response.data;
}

export async function criarServico(novoServico) {
  const response = await api.post('/servicos', novoServico);
  return response.data;
}

export async function atualizarServico(id, dadosAtualizados) {
  const response = await api.put(`/servicos/${id}`, dadosAtualizados);
  return response.data;
}

export async function excluirServico(id) {
  await api.delete(`/servicos/${id}`);
}
