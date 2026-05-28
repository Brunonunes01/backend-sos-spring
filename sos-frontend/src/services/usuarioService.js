import api from './api'

export async function listarUsuarios(params = {}) {
  const response = await api.get('/usuarios', { params: { size: 200, ...params } })
  return Array.isArray(response.data) ? response.data : (response.data?.content ?? [])
}

export async function buscarUsuarioPorId(id) {
  const response = await api.get(`/usuarios/${id}`)
  return response.data
}

export async function criarUsuario(novoUsuario) {
  const response = await api.post('/usuarios', novoUsuario)
  return response.data
}

export async function atualizarUsuario(id, dadosAtualizados) {
  const response = await api.put(`/usuarios/${id}`, dadosAtualizados)
  return response.data
}

export async function excluirUsuario(id) {
  await api.delete(`/usuarios/${id}`)
}
