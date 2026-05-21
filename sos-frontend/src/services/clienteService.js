import api from './api';

export async function listarClientes(params = {}) {
  const response = await api.get('/clientes', { params: { ativo: true, ...params } });
  return Array.isArray(response.data) ? response.data : (response.data?.content ?? []);
}

export async function buscarClientePorId(id) {
  const response = await api.get(`/clientes/${id}`);
  return response.data;
}

export async function criarCliente(novoCliente) {
  const response = await api.post('/clientes', novoCliente);
  return response.data;
}

export async function atualizarCliente(id, dadosAtualizados) {
  const response = await api.put(`/clientes/${id}`, dadosAtualizados);
  return response.data;
}

export async function excluirCliente(id) {
  await api.delete(`/clientes/${id}`);
}
