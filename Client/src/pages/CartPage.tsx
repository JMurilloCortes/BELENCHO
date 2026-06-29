import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react'
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
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={32} className="text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Inicia sesión para ver tu carrito</h2>
        <p className="text-gray-400 text-sm mb-6">Accede a tu cuenta para gestionar tus productos</p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <div className="relative w-12 h-12 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-gray-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-primary border-r-accent border-b-transparent border-l-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm text-gray-400">Cargando carrito...</p>
      </div>
    )
  }

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={32} className="text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-400 text-sm mb-6">Agrega productos que te gusten y aparecerán aquí</p>
        <Link
          to="/catalogo"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          Ver catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Carrito de compras</h1>
          <p className="text-sm text-gray-400 mt-1">{items.reduce((s, i) => s + i.quantity, 0)} artículo{items.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''}</p>
        </div>
        <Link
          to="/catalogo"
          className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Seguir comprando
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:shadow-lg hover:border-gray-200 transition-all duration-300"
            >
              <div className="flex gap-4 sm:gap-5">
                {/* Image */}
                <Link to={`/producto/${item.productId}`} className="shrink-0">
                  <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-50">
                    <img
                      src={item.product.images?.[0]?.url || 'https://placehold.co/112x112/e2e8f0/94a3b8?text=No'}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        to={`/producto/${item.productId}`}
                        className="font-semibold text-gray-800 text-sm sm:text-base hover:text-primary transition-colors line-clamp-1"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{item.product.category?.name}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 rounded-xl border border-red-200 bg-red-50 text-red-500 hover:text-white hover:bg-red-500 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-end justify-between mt-3 sm:mt-4">
                    {/* Quantity selector */}
                    <div className="flex items-center gap-0 border border-primary/20 rounded-xl overflow-hidden bg-primary/5">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 sm:p-2.5 text-accent hover:text-white hover:bg-accent transition-all duration-200 border-r border-primary/20"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} className={item.quantity <= 1 ? 'opacity-30' : ''} />
                      </button>
                      <span className="font-semibold text-gray-800 text-sm sm:text-base min-w-[40px] text-center select-none px-2">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 sm:p-2.5 text-primary hover:text-white hover:bg-primary transition-all duration-200 border-l border-primary/20"
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus size={14} className={item.quantity >= item.product.stock ? 'opacity-30' : ''} />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        ${(item.product.price * item.quantity).toLocaleString()}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-[10px] sm:text-xs text-gray-400">
                          ${Number(item.product.price).toLocaleString()} c/u
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm lg:sticky lg:top-24">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Resumen</h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold text-gray-800">${total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Domicilio</span>
                <span className="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full text-xs">Gratis</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-bold text-gray-800">Total</span>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  ${total.toLocaleString()}
                </span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="block w-full bg-gradient-to-r from-primary to-accent text-white py-3.5 rounded-xl font-bold text-sm text-center hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02] active:scale-95"
            >
              Proceder al pago
            </Link>

            <Link
              to="/catalogo"
              className="block w-full text-center text-sm text-gray-400 hover:text-primary mt-4 transition-colors"
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
