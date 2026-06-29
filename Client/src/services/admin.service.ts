import api from './api'

export async function getDashboardStats() {
  const { data } = await api.get('/admin/dashboard')
  return data
}

export async function getUsers() {
  const { data } = await api.get('/admin/users')
  return data
}

export async function createUser(userData: { name: string; email: string; password: string; role?: string }) {
  const { data } = await api.post('/admin/users', userData)
  return data
}

export async function updateUserRole(userId: string, role: string) {
  const { data } = await api.put(`/admin/users/${userId}/role`, { role })
  return data
}

export async function toggleUserActive(userId: string) {
  const { data } = await api.put(`/admin/users/${userId}/toggle-active`)
  return data
}

export async function deleteUser(userId: string) {
  const { data } = await api.delete(`/admin/users/${userId}`)
  return data
}

export async function updateUserPassword(userId: string, newPassword: string) {
  const { data } = await api.put(`/admin/users/${userId}/password`, { newPassword })
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

export async function getAdminProducts() {
  const { data } = await api.get('/admin/products')
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

export async function toggleProductActive(id: string) {
  const { data } = await api.put(`/admin/products/${id}/toggle-active`)
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

export async function updateCategory(id: string, name: string) {
  const { data } = await api.put(`/admin/categories/${id}`, { name })
  return data
}

export async function toggleCategoryActive(id: string) {
  const { data } = await api.put(`/admin/categories/${id}/toggle-active`)
  return data
}

export async function deleteCategory(id: string) {
  const { data } = await api.delete(`/admin/categories/${id}`)
  return data
}
