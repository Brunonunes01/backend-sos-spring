const TOKEN_KEY = 'sos_token';

export function setToken(token) {
  if (!token) {
    clearToken();
    return;
  }

  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}
