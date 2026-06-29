import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ChevronRight, ShoppingCart } from 'lucide-react'
import { showToast } from '../../lib/sweetalert'
import { getAllOrders } from '../../services/admin.service'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-600',
  PAID: 'bg-green-50 text-green-600',
  CANCELLED: 'bg-red-50 text-red-600',
  REFUNDED: 'bg-gray-100 text-gray-500',
}

const statusDots: Record<string, string> = {
  PENDING: 'bg-yellow-400',
  PAID: 'bg-green-400',
  CANCELLED: 'bg-red-400',
  REFUNDED: 'bg-gray-400',
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagada',
  CANCELLED: 'Cancelada',
  REFUNDED: 'Reembolsada',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getAllOrders()
      .then(setOrders)
      .catch(() => showToast('error', 'Error al cargar órdenes'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = orders.filter((o) =>
    o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    o.id?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Órdenes</h1>
          <p className="text-sm text-gray-400 mt-1">{orders.length} órdenes registradas</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar órdenes..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200" />
        </div>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {filtered.map((order) => (
          <Link key={order.id} to={`/admin/ordenes/${order.id}`} className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold shrink-0">
                {order.user?.name?.[0] || '?'}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-800 text-sm">{order.user?.name || 'N/A'}</h3>
                <p className="text-xs text-gray-400 truncate">{order.user?.email}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 shrink-0 mt-1" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${statusDots[order.status] || 'bg-gray-400'}`} />
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                  {statusLabels[order.status] || order.status}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-gray-800">${Number(order.total).toLocaleString()}</span>
                <span className="text-xs text-gray-400 ml-2">{order.paymentMethod}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">{new Date(order.createdAt).toLocaleDateString()}</p>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <ShoppingCart size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">No se encontraron órdenes</p>
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left p-3 lg:p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Cliente</th>
              <th className="text-left p-3 lg:p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
              <th className="text-left p-3 lg:p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Método</th>
              <th className="text-left p-3 lg:p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
              <th className="text-left p-3 lg:p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Fecha</th>
              <th className="text-right p-3 lg:p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-3 lg:p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {order.user?.name?.[0] || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{order.user?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-400 truncate">{order.user?.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 lg:p-4 text-sm font-semibold text-gray-800">${Number(order.total).toLocaleString()}</td>
                <td className="p-3 lg:p-4">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{order.paymentMethod}</span>
                </td>
                <td className="p-3 lg:p-4">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${statusDots[order.status] || 'bg-gray-400'}`} />
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                </td>
                <td className="p-3 lg:p-4 text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="p-3 lg:p-4 text-right">
                  <Link to={`/admin/ordenes/${order.id}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium">
                    Detalle <ChevronRight size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <ShoppingCart size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">No se encontraron órdenes</p>
          </div>
        )}
      </div>
    </div>
  )
}
