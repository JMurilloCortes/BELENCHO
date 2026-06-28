import api from './api'

export async function createReview(productId: string, rating: number, comment?: string) {
  const { data } = await api.post('/reviews', { productId, rating, comment })
  return data
}
