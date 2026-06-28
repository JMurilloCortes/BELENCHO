import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useCartStore } from '../store/cart.store'
import { useAuthStore } from '../store/auth.store'

export default function CartPage() {
  const { items, loading, loadCart, updateQuantity, removeItem } = useCartStore()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (isAuthenticated) loadCart()
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Inicia sesión para ver tu carrito</h2>
        <Link to="/login" className="text-primary font-medium hover:underline">Ir a iniciar sesión</Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    )
  }

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-500 mb-4">Agrega productos para empezar</p>
        <Link to="/catalogo" className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors">
          Ver catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Carrito de compras</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <img
                src={item.product.images?.[0]?.url || 'https://placehold.co/100x100/e2e8f0/94a3b8?text=No'}
                alt={item.product.name}
                className="w-24 h-24 rounded-lg object-cover"
              />
              <div className="flex-1">
                <Link to={`/producto/${item.productId}`} className="font-semibold text-gray-800 hover:text-primary">
                  {item.product.name}
                </Link>
                <p className="text-primary font-bold mt-1">${Number(item.product.price).toLocaleString()}</p>
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 rounded border border-gray-200 hover:bg-gray-50"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-medium w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 rounded border border-gray-200 hover:bg-gray-50"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="ml-auto p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-fit">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Resumen</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Envío</span>
              <span className="text-green-600">Gratis</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-gray-800 text-lg">
              <span>Total</span>
              <span>${total.toLocaleString()}</span>
            </div>
          </div>
          <Link to="/checkout" className="block w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors text-center">
            Proceder al pago
          </Link>
        </div>
      </div>
    </div>
  )
}
