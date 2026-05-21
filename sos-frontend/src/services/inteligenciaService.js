import api from './api';

export async function sugerirPrecosProduto(consulta, limite = 6) {
  const response = await api.get('/precos/sugerir', {
    params: {
      q: consulta,
      limite
    }
  });

  return response.data;
}
