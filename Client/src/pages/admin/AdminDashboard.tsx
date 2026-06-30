import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Users, ShoppingCart, DollarSign, TrendingUp, Clock, ArrowUpRight, ArrowRight, Trash2 } from 'lucide-react'
import { getDashboardStats } from '../../services/admin.service'
import { showToast, showConfirm } from '../../lib/sweetalert'
import api from '../../services/api'

interface Stats {
  totalProducts: number
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  ordersByStatus: { status: string; _count: number }[]
  recentOrders: any[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleReset = async () => {
    const result = await showConfirm({
      title: '¿Restablecer todo?',
      text: 'Se eliminarán todos los productos, categorías, órdenes, reseñas, favoritos, carritos y usuarios (excepto el administrador principal). Esta acción no se puede deshacer.',
      confirmText: 'Sí, restablecer',
      confirmColor: '#ef4444',
    })
    if (!result.isConfirmed) return
    try {
      await api.post('/admin/reset')
      showToast('success', 'Todo restablecido correctamente')
      const updated = await getDashboardStats()
      setStats(updated)
    } catch {
      showToast('error', 'Error al restablecer')
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  )

  const statusCount = (s: string) => stats?.ordersByStatus?.find((o) => o.status === s)?._count || 0

  const cards = [
    { label: 'Productos', value: stats?.totalProducts || 0, icon: Package, href: '/admin/productos', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 text-blue-600' },
    { label: 'Usuarios', value: stats?.totalUsers || 0, icon: Users, href: '/admin/usuarios', color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 text-purple-600' },
    { label: 'Órdenes', value: stats?.totalOrders || 0, icon: ShoppingCart, href: '/admin/ordenes', color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50 text-orange-600' },
    { label: 'Ingresos', value: `$${Number(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, href: '/admin/ordenes', color: 'from-green-500 to-green-600', bg: 'bg-green-50 text-green-600' },
  ]

  return (
    <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">Resumen general de tu tienda</p>
          </div>
        </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {cards.map((card) => (
          <Link key={card.label} to={card.href} className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon size={20} />
              </div>
              <ArrowUpRight size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
            </div>
            <p className="text-2xl font-bold text-gray-800 mb-0.5">{card.value}</p>
            <p className="text-xs text-gray-400">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                <TrendingUp size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-800">Estado de órdenes</h2>
                <p className="text-xs text-gray-400">Distribución actual</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Pendientes', count: statusCount('PENDING'), color: 'bg-yellow-400', text: 'text-yellow-600', bg: 'bg-yellow-50' },
              { label: 'Pagadas', count: statusCount('PAID'), color: 'bg-green-400', text: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Canceladas', count: statusCount('CANCELLED'), color: 'bg-red-400', text: 'text-red-600', bg: 'bg-red-50' },
            ].map((item) => {
              const total = statusCount('PENDING') + statusCount('PAID') + statusCount('CANCELLED')
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="text-sm text-gray-600">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">{item.count}</span>
                      <span className="text-xs text-gray-400">{pct}%</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center">
                <Clock size={20} className="text-accent" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-800">Últimas órdenes</h2>
                <p className="text-xs text-gray-400">Actividad reciente</p>
              </div>
            </div>
            <Link to="/admin/ordenes" className="text-xs text-primary hover:underline flex items-center gap-1">
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-1">
            {stats?.recentOrders?.length === 0 && <p className="text-sm text-gray-400 text-center py-8">Sin órdenes aún</p>}
            {stats?.recentOrders?.map((order: any) => (
              <Link key={order.id} to={`/admin/ordenes/${order.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {order.user?.name?.[0] || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{order.user?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-semibold text-gray-800">${Number(order.total).toLocaleString()}</p>
                  <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    order.status === 'PAID' ? 'bg-green-50 text-green-600' :
                    order.status === 'PENDING' ? 'bg-yellow-50 text-yellow-600' :
                    'bg-red-50 text-red-600'
                  }`}>{order.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <button onClick={handleReset} className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-2xl shadow-lg shadow-red-500/10 hover:text-white hover:bg-red-500 hover:border-red-500 hover:shadow-xl hover:shadow-red-500/25 transition-all duration-200">
        <Trash2 size={16} /> Restablecer todo
      </button>
    </div>
  )
}
