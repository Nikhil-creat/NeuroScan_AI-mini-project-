import { SITE } from './config.js'

const KEY = 'neuroscan.session'

export const session = {
  get() {
    try {
      return JSON.parse(sessionStorage.getItem(KEY) || 'null')
    } catch {
      return null
    }
  },
  set(v) {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(v))
    } catch {
      /* storage blocked: the session just won't persist */
    }
  },
  clear() {
    try {
      sessionStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
  },
}

async function request(path, { method = 'GET', body, form, token } = {}) {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (body) headers['Content-Type'] = 'application/json'
  const res = await fetch(`${SITE.apiUrl}${path}`, {
    method,
    headers,
    body: form ?? (body ? JSON.stringify(body) : undefined),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const detail = Array.isArray(data.detail) ? data.detail.map((d) => d.msg).join('; ') : data.detail
    throw new Error(detail || `Request failed (${res.status})`)
  }
  return data
}

export const api = {
  health: () => request('/api/health'),
  register: (username, password) => request('/api/auth/register', { method: 'POST', body: { username, password } }),
  login: (username, password) => request('/api/auth/login', { method: 'POST', body: { username, password } }),
  cases: (token) => request('/api/cases', { token }),
  upload: (token, file, notes) => {
    const form = new FormData()
    form.append('file', file)
    form.append('notes', notes || '')
    return request('/api/cases', { method: 'POST', form, token })
  },
  review: (token, id, payload) => request(`/api/cases/${id}/review`, { method: 'POST', body: payload, token }),
}
