import api from './api'

export async function getProfile() {
  const { data } = await api.get('/users/profile')
  return data
}

export async function updateProfile(body: {
  name?: string; email?: string; avatar?: string;
  phone?: string; defaultAddress?: string; defaultNeighborhoodId?: string;
}) {
  const { data } = await api.put('/users/profile', body)
  return data
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const { data } = await api.put('/users/password', { currentPassword, newPassword })
  return data
}
