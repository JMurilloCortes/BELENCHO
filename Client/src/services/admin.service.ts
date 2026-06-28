import api from './api'

export async function getDashboardStats() {
  const { data } = await api.get('/admin/dashboard')
  return data
}

export async function getUsers() {
  const { data } = await api.get('/admin/users')
  return data
}

export async function updateUserRole(userId: string, role: string) {
  const { data } = await api.put(`/admin/users/${userId}/role`, { role })
  return data
}

export async function getAllOrders() {
  const { data } = await api.get('/admin/orders')
  return data
}

export async function getOrderDetail(orderId: string) {
  const { data } = await api.get(`/admin/orders/${orderId}`)
  return data
}

export async function updateOrderStatus(orderId: string, status: string) {
  const { data } = await api.put(`/admin/orders/${orderId}/status`, { status })
  return data
}

export async function createProduct(product: any) {
  const { data } = await api.post('/admin/products', product)
  return data
}

export async function updateProduct(id: string, product: any) {
  const { data } = await api.put(`/admin/products/${id}`, product)
  return data
}

export async function deleteProduct(id: string) {
  const { data } = await api.delete(`/admin/products/${id}`)
  return data
}

export async function getCategories() {
  const { data } = await api.get('/admin/categories')
  return data
}

export async function createCategory(name: string) {
  const { data } = await api.post('/admin/categories', { name })
  return data
}
