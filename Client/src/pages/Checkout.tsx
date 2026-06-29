import { useState } from 'react'
import { CreditCard, ChevronRight } from 'lucide-react'
import { showToast } from '../lib/sweetalert'
import { createPayment } from '../services/payment.service'
import { useCartStore } from '../store/cart.store'

export default function Checkout() {
  const { items, itemCount, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<'WOMPI' | 'MERCADOPAGO' | null>(null)

  const total = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)

  const handlePay = async () => {
    if (!selectedMethod) { showToast('error', 'Selecciona un método de pago'); return }
    setLoading(true)
    try {
      const { redirectUrl } = await createPayment(selectedMethod)
      clearCart()
      window.location.href = redirectUrl
    } catch (e: any) {
      showToast('error', e.response?.data?.error || 'Error al procesar pago')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Checkout</h1>
        <p className="text-gray-500 mb-4">Tu carrito está vacío</p>
        <a href="/carrito" className="text-primary hover:underline">Volver al carrito</a>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Resumen del pedido</h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center gap-3">
              <img src={item.product.images?.[0]?.url || ''} alt="" className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="font-medium text-gray-800 text-sm">{item.product.name}</p>
                <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold text-gray-800">${(Number(item.product.price) * item.quantity).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <div className="border-t mt-4 pt-4 flex justify-between text-lg font-bold text-gray-800">
          <span>Total</span>
          <span>${total.toLocaleString()}</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">{itemCount} producto(s)</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Método de pago</h2>
        <div className="space-y-3">
          <button
            onClick={() => setSelectedMethod('WOMPI')}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors ${
              selectedMethod === 'WOMPI' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
              <CreditCard size={24} className="text-teal-600" />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-gray-800">Wompi</p>
              <p className="text-sm text-gray-400">Paga con tarjeta de crédito, débito o PSE</p>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>

          <button
            onClick={() => setSelectedMethod('MERCADOPAGO')}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors ${
              selectedMethod === 'MERCADOPAGO' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <CreditCard size={24} className="text-blue-600" />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-gray-800">Mercado Pago</p>
              <p className="text-sm text-gray-400">Paga con Mercado Pago, tarjeta o efectivo</p>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>
      </div>

      <button
        onClick={handlePay}
        disabled={!selectedMethod || loading}
        className="w-full bg-primary text-white py-3.5 rounded-xl text-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
      >
        {loading ? 'Procesando...' : `Pagar $${total.toLocaleString()}`}
      </button>
    </div>
  )
}
