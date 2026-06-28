import api from './api'

export async function createPayment(paymentMethod: 'WOMPI' | 'MERCADOPAGO') {
  const { data } = await api.post('/payments/create', { paymentMethod })
  return data as { orderId: string; redirectUrl: string }
}

export async function confirmPayment(transactionId: string) {
  const { data } = await api.get('/payments/confirm', { params: { transactionId } })
  return data
}

export async function getOrder(orderId: string) {
  const { data } = await api.get(`/payments/orders/${orderId}`)
  return data
}

export async function getUserOrders() {
  const { data } = await api.get('/payments/orders')
  return data
}
