export function extrairMensagemErroApi(error) {
  if (!error?.response) {
    return 'Não foi possível comunicar com o servidor. Tente novamente.'
  }

  const data = error.response.data

  if (data?.fields && typeof data.fields === 'object') {
    const detalhes = Object.entries(data.fields)
      .map(([campo, mensagem]) => `${campo}: ${mensagem}`)
      .join(' | ')

    if (detalhes) {
      return detalhes
    }
  }

  if (error.response.status === 403) {
    const path = typeof data?.path === 'string' ? data.path : ''
    if (path.startsWith('/api/v1/usuarios')) {
      return `Acesso negado em ${path}. Esta ação é exclusiva de administrador.`
    }
    if (path) {
      return `Acesso negado em ${path}. Seu usuário não tem permissão para esta ação.`
    }
    return 'Acesso negado. Seu usuário não tem permissão para esta ação.'
  }

  if (error.response.status === 401) {
    return 'Sessão expirada ou não autenticada. Faça login novamente.'
  }

  if (typeof data === 'string' && data.trim()) {
    return data
  }

  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message
  }

  if (typeof data?.error === 'string' && data.error.trim()) {
    return data.error
  }

  return `Falha na requisição (HTTP ${error.response.status}).`
}
