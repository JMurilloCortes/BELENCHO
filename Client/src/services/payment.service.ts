import api from './api'

interface CustomerData {
  customerName: string
  customerEmail: string
  customerPhone: string
  deliveryAddress: string
  deliveryInstructions?: string
  neighborhoodId: string
  deliveryDate: string
  deliveryTimeSlot: string
  giftFrom?: string
  giftTo?: string
  giftMessage?: string
}

export async function createPayment(paymentMethod: 'WOMPI' | 'MERCADOPAGO', customerData: CustomerData) {
  const { data } = await api.post('/payments/create', { paymentMethod, ...customerData })
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
