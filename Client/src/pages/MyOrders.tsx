import { useEffect, useState } from 'react'
import { ShoppingBag, Package, ChevronRight, ArrowLeft, Search } from 'lucide-react'
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={36} className="text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Inicia sesión</h1>
          <p className="text-gray-500 mb-6">Necesitas iniciar sesión para ver tus pedidos</p>
          <a href="/login" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-dark transition-all duration-300 hover:shadow-lg hover:shadow-primary/30">
            Ir a iniciar sesión
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary transition-colors mb-6">
        <ArrowLeft size={14} /> Volver a la tienda
      </Link>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mis pedidos</h1>
          <p className="text-sm text-gray-400 mt-1">{orders.length} pedido{orders.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar pedidos..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
          <Package size={48} className="mx-auto text-gray-200 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            {search ? 'No se encontraron pedidos' : 'Aún no tienes pedidos'}
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            {search ? 'Intenta con otro término de búsqueda' : 'Explora el catálogo y haz tu primer pedido'}
          </p>
          {!search && (
            <Link to="/catalogo" className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
              Ir al catálogo
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <Link key={order.id} to={`/pedidos/${order.id}`} className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200 group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  <ShoppingBag size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-sm font-bold text-gray-800">#{order.id.slice(0, 8)}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                    <ChevronRight size={14} className="text-gray-300 ml-auto shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-400">
                    <span className="font-semibold text-gray-700">${Number(order.total).toLocaleString()}</span>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    {order.deliveryDate && <span>Entrega: {order.deliveryDate.split('T')[0].split('-').reverse().join('/')}</span>}
                    <span className="text-gray-300">{order.items?.length || 0} producto{(order.items?.length || 0) !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
