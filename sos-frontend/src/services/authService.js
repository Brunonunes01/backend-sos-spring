import api from './api';
import { setToken, clearToken } from '../utils/auth';

export async function login(email, senha) {
  const response = await api.post('/auth/login', { email, senha });
  const accessToken = response.data?.accessToken || response.data?.token;

  if (!accessToken) {
    throw new Error('Resposta de login sem token.');
  }

  setToken(accessToken);

  let usuario = null;
  try {
    const meResponse = await api.get('/auth/me');
    usuario = meResponse.data;
  } catch {
    // /auth/me é opcional para concluir login; token já foi salvo.
  }

  if (usuario) {
    localStorage.setItem('usuario', JSON.stringify(usuario));
  } else {
    localStorage.removeItem('usuario');
  }

  return { ...response.data, usuario };
}

export async function me() {
  const response = await api.get('/auth/me');
  return response.data;
}

export function logout() {
  clearToken();
  localStorage.removeItem('usuario');
  // Opcional: Chamar endpoint de logout no backend se houver
  // api.post('/auth/logout').catch(() => {});
}
