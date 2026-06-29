import { useEffect, useState } from 'react'
import { ShoppingBag, Package, ChevronRight, Search, Shield } from 'lucide-react'
import { showToast } from '../lib/sweetalert'
import { useAuthStore } from '../store/auth.store'
import { getUserOrders } from '../services/payment.service'
import { Link } from 'react-router-dom'
import type { Order } from '../types'

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagada',
  CANCELLED: 'Cancelada',
  REFUNDED: 'Reembolsada',
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-600',
  PAID: 'bg-green-50 text-green-600',
  CANCELLED: 'bg-red-50 text-red-600',
  REFUNDED: 'bg-gray-100 text-gray-500',
}

export default function MyOrders() {
  const { isAuthenticated } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return }
    getUserOrders()
      .then(setOrders)
      .catch(() => showToast('error', 'Error al cargar pedidos'))
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  const filtered = orders.filter((o) =>
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    statusLabels[o.status]?.toLowerCase().includes(search.toLowerCase())
  )

  const inputClass = 'w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-100 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all duration-300 hover:border-gray-200'

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shadow-lg">
            <ShoppingBag size={40} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Inicia sesión</h1>
          <p className="text-gray-400 text-sm mb-8">Necesitas iniciar sesión para ver tus pedidos</p>
          <a href="/login" className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all duration-300 hover:scale-105">
            Ir a iniciar sesión
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Top bar */}
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20">
              <Package size={17} />
            </div>
            <span className="font-bold text-gray-800 text-lg">Mis pedidos</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Shield size={12} />
            {orders.length} pedido{orders.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por ID o estado..."
              className={inputClass + ' pl-11'}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="p-12 sm:p-16 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center shadow-sm">
                <Package size={36} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {search ? 'No se encontraron pedidos' : 'Aún no tienes pedidos'}
              </h3>
              <p className="text-sm text-gray-400 mb-8">
                {search ? 'Intenta con otro término de búsqueda' : 'Explora el catálogo y haz tu primer pedido'}
              </p>
              {!search && (
                <Link to="/catalogo" className="inline-flex items-center gap-2 bg-gradient-to-br from-primary to-accent text-white px-6 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300">
                  Ir al catálogo
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => (
              <Link
                key={order.id}
                to={`/pedidos/${order.id}`}
                className="block bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 hover:border-gray-200 transition-all duration-300 group"
              >
                <div className="p-5 sm:p-6 lg:p-7">
                  <div className="flex items-start gap-4 sm:gap-5">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shrink-0 shadow-sm">
                      <ShoppingBag size={22} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap mb-2">
                        <span className="text-sm sm:text-base font-bold text-gray-900">#{order.id.slice(0, 8)}</span>
                        <span className={`text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                        <ChevronRight size={16} className="text-gray-200 ml-auto shrink-0 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs sm:text-sm text-gray-400">
                        <span className="font-bold text-gray-800 text-sm sm:text-base">${Number(order.total).toLocaleString()}</span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-gray-200" />
                          {new Date(order.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        {order.deliveryDate && (
                          <span className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-gray-200" />
                            Entrega: {order.deliveryDate.split('T')[0].split('-').reverse().join('/')}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-gray-200" />
                          {order.items?.length || 0} producto{(order.items?.length || 0) !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
