import api from './api';

export async function listarProdutos(params = {}) {
  const response = await api.get('/produtos', { params: { ativo: true, ...params } });
  return Array.isArray(response.data) ? response.data : (response.data?.content ?? []);
}
