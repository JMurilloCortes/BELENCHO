import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, Lock, Shield, Truck, Package } from 'lucide-react'
import { useCartStore } from '../store/cart.store'
import { useAuthStore } from '../store/auth.store'
import { showToast } from '../lib/sweetalert'

export default function CartPage() {
  const { items, loading, loadCart, updateQuantity, removeItem } = useCartStore()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (isAuthenticated) loadCart()
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            <ShoppingBag size={40} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Inicia sesión</h1>
          <p className="text-gray-400 text-sm mb-8">Accede a tu cuenta para ver tu carrito de compras</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4">
        <div className="relative w-14 h-14 mx-auto mb-4">
          <div className="absolute inset-0 border-[3px] border-gray-100 rounded-full" />
          <div className="absolute inset-0 border-[3px] border-t-primary border-r-accent border-b-transparent border-l-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm text-gray-400">Cargando carrito...</p>
      </div>
    )
  }

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const qty = items.reduce((s, i) => s + i.quantity, 0)

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            <ShoppingBag size={40} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h2>
          <p className="text-gray-400 text-sm mb-8">Agrega productos que te gusten y aparecerán aquí</p>
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Ver catálogo
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Top bar */}
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
              B
            </div>
            <span className="font-bold text-gray-800 text-lg hidden sm:block">BELENCHO</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/catalogo" className="text-xs text-gray-400 hover:text-primary transition-colors hidden sm:flex items-center gap-1">
              <ArrowLeft size={14} /> Seguir comprando
            </Link>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <ShoppingBag size={14} />
              {qty} {qty === 1 ? 'item' : 'items'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">Carrito de compras</h1>
              <p className="text-sm text-gray-400 mt-1.5">{items.length} producto{items.length !== 1 ? 's' : ''} en tu carrito</p>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 p-4 sm:p-6 hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-500"
                >
                  <div className="flex gap-4 sm:gap-6">
                    {/* Image */}
                    <Link to={`/producto/${item.productId}`} className="shrink-0">
                      <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl sm:rounded-2xl overflow-hidden bg-gray-50 border border-gray-50 group-hover:border-primary/20 transition-all duration-300">
                        <img
                          src={item.product.images?.[0]?.url || 'https://placehold.co/112x112/e2e8f0/94a3b8?text=No'}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            to={`/producto/${item.productId}`}
                            className="font-semibold text-gray-800 text-sm sm:text-base hover:text-primary transition-colors line-clamp-1"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{item.product.category?.name}</p>
                        </div>
                        <button
                          onClick={() => {
                            showToast('success', 'Producto eliminado')
                            removeItem(item.id).catch(() => showToast('error', 'Error al eliminar'))
                          }}
                          className="p-2 rounded-xl border border-red-100 bg-red-50 text-red-400 hover:text-white hover:bg-red-500 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 shrink-0"
                          title="Eliminar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="flex items-end justify-between mt-3 sm:mt-0">
                        {/* Quantity */}
                        <div className="flex flex-col gap-1.5">
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
                          <span className="text-[10px] sm:text-xs text-gray-400">
                            {item.product.stock <= 3 ? (
                              <span className="text-accent font-medium">Solo {item.product.stock} disponibles</span>
                            ) : (
                              <>{item.product.stock} disponibles</>
                            )}
                          </span>
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
          </div>

          {/* Summary sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="p-5 sm:p-7 lg:p-8">
                  <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-50">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-highlight to-primary flex items-center justify-center shadow-lg shadow-highlight/20">
                      <Package size={18} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-800">Resumen</h3>
                      <p className="text-xs text-gray-400">{qty} artículo{qty !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="font-semibold text-gray-800">${total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Domicilio</span>
                      <span className="text-green-600 font-medium bg-green-50 px-2.5 py-0.5 rounded-full text-xs">Gratis</span>
                    </div>
                    <div className="border-t border-gray-100 pt-3 flex justify-between">
                      <span className="font-bold text-gray-900 text-base">Total</span>
                      <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        ${total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/checkout"
                    className="block w-full bg-gradient-to-r from-primary to-accent text-white py-3.5 rounded-xl font-bold text-sm text-center shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02] active:scale-95"
                  >
                    Proceder al pago
                  </Link>

                  <Link
                    to="/catalogo"
                    className="block w-full text-center text-xs sm:text-sm text-gray-400 hover:text-primary mt-4 transition-colors"
                  >
                    Seguir comprando
                  </Link>
                </div>
              </div>

              {/* Trust badges */}
              <div className="hidden lg:flex items-center justify-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1.5"><Lock size={12} /> Pago seguro</div>
                <div className="flex items-center gap-1.5"><Shield size={12} /> Datos protegidos</div>
                <div className="flex items-center gap-1.5"><Truck size={12} /> Domicilio gratis</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile trust */}
        <div className="lg:hidden mt-8 flex items-center justify-center gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-1.5"><Lock size={12} /> Pago seguro</div>
          <div className="flex items-center gap-1.5"><Shield size={12} /> Datos protegidos</div>
          <div className="flex items-center gap-1.5"><Truck size={12} /> Domicilio gratis</div>
        </div>
      </div>
    </div>
  )
}
