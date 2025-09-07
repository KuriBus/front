const SERVER_URL = 'https://kuriverse.shop';

let accessToken = localStorage.getItem('accessToken') || null;

export function setToken(token) {
  accessToken = token;
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
  } else {
    localStorage.removeItem('accessToken');
  }
}

export function getToken() {
  if (!accessToken) {
    accessToken = localStorage.getItem('accessToken');
  }
  return accessToken;
}

async function request(endpoint, options = {}) {
  const url = `${SERVER_URL}${endpoint}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  return fetch(url, config);
}

// 캐릭터 좌표 조회 API
export async function fetchCharacterCoordinates(nickname) {
  const res = await request(`/api/coordinates/${nickname}`, { method: 'GET' });
  return res.json();
}

// 캐릭터 좌표 갱신 API
export async function updateCharacterCoordinates(nickname, roomName, x, y) {
  const body = { roomName, x, y };
  const res = await request(`/api/coordinates/${nickname}`, { method: 'POST', body });
  return res.json();
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};