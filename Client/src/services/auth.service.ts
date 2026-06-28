import api from './api'

export interface AuthResponse {
  token: string
  user: {
    id: string
    email: string
    name: string
    role: string
    avatar?: string
  }
}

export async function login(email: string, password: string) {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
  return data
}

export async function register(email: string, password: string, name: string) {
  const { data } = await api.post<AuthResponse>('/auth/register', { email, password, name })
  return data
}
