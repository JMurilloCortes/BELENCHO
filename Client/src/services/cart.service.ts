import api from './api'

export async function getCart() {
  const { data } = await api.get('/cart')
  return data
}

export async function addToCart(productId: string, quantity = 1) {
  const { data } = await api.post('/cart', { productId, quantity })
  return data
}

export async function updateCartItem(itemId: string, quantity: number) {
  const { data } = await api.put(`/cart/${itemId}`, { quantity })
  return data
}

export async function removeFromCart(itemId: string) {
  const { data } = await api.delete(`/cart/${itemId}`)
  return data
}
