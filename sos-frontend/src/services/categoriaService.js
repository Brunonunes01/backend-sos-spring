import api from './api';

export async function listarCategorias(params = {}) {
  const response = await api.get('/categorias', { params: { ativo: true, ...params } });
  return Array.isArray(response.data) ? response.data : (response.data?.content ?? []);
}

export async function buscarCategoriaPorId(id) {
  const response = await api.get(`/categorias/${id}`);
  return response.data;
}

export async function criarCategoria(novaCategoria) {
  const response = await api.post('/categorias', novaCategoria);
  return response.data;
}

export async function atualizarCategoria(id, dadosAtualizados) {
  const response = await api.put(`/categorias/${id}`, dadosAtualizados);
  return response.data;
}

export async function excluirCategoria(id) {
  await api.delete(`/categorias/${id}`);
}
