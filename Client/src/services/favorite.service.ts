import api from './api'

export async function getFavorites() {
  const { data } = await api.get('/favorites')
  return data
}

export async function addFavorite(productId: string) {
  const { data } = await api.post('/favorites', { productId })
  return data
}

export async function removeFavorite(productId: string) {
  const { data } = await api.delete(`/favorites/${productId}`)
  return data
}
