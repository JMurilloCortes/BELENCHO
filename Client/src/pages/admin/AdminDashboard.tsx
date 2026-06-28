import { useEffect, useState } from 'react'
import { Package, Users, ShoppingCart, DollarSign, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getDashboardStats } from '../../services/admin.service'

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

  if (loading) return <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mt-20" />

  const statusCount = (s: string) => stats?.ordersByStatus?.find((o) => o.status === s)?._count || 0

  const cards = [
    { label: 'Productos', value: stats?.totalProducts || 0, icon: Package, color: 'bg-blue-500', href: '/admin/productos' },
    { label: 'Usuarios', value: stats?.totalUsers || 0, icon: Users, color: 'bg-purple-500', href: '/admin/usuarios' },
    { label: 'Órdenes', value: stats?.totalOrders || 0, icon: ShoppingCart, color: 'bg-orange-500', href: '/admin/ordenes' },
    { label: 'Ingresos', value: `$${Number(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-green-500', href: '/admin/ordenes' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <Link key={card.label} to={card.href} className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 ${card.color} bg-opacity-10 rounded-xl flex items-center justify-center`}>
                <card.icon size={24} className={card.color.replace('bg-', 'text-')} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <TrendingUp size={20} /> Órdenes por estado
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Pendientes', count: statusCount('PENDING'), icon: Clock, color: 'text-yellow-500' },
              { label: 'Pagadas', count: statusCount('PAID'), icon: CheckCircle, color: 'text-green-500' },
              { label: 'Canceladas', count: statusCount('CANCELLED'), icon: XCircle, color: 'text-red-500' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <item.icon size={18} className={item.color} />
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <span className="font-semibold text-gray-800">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Clock size={20} /> Últimas órdenes
          </h2>
          <div className="space-y-3">
            {stats?.recentOrders?.length === 0 && <p className="text-sm text-gray-400">Sin órdenes aún</p>}
            {stats?.recentOrders?.map((order: any) => (
              <Link key={order.id} to={`/admin/ordenes/${order.id}`} className="flex items-center justify-between hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-800 truncate max-w-[200px]">{order.user?.name || 'N/A'}</p>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">${Number(order.total).toLocaleString()}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    order.status === 'PAID' ? 'bg-green-100 text-green-700' :
                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>{order.status}</span>
                </div>
              </Link>
            ))}
          </div>
          <Link to="/admin/ordenes" className="block text-center text-sm text-primary hover:underline mt-4">Ver todas las órdenes</Link>
        </div>
      </div>
    </div>
  )
}
