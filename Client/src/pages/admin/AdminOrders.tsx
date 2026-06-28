import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAllOrders } from '../../services/admin.service'

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-100 text-gray-600',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getAllOrders()
      .then(setOrders)
      .catch(() => toast.error('Error al cargar órdenes'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = orders.filter((o) =>
    o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    o.id?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mt-20" />

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Órdenes</h1>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar órdenes..." className="pl-10 pr-4 py-2 border rounded-lg text-sm w-64" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3 text-sm font-medium text-gray-600">Cliente</th>
              <th className="p-3 text-sm font-medium text-gray-600">Total</th>
              <th className="p-3 text-sm font-medium text-gray-600">Método</th>
              <th className="p-3 text-sm font-medium text-gray-600">Estado</th>
              <th className="p-3 text-sm font-medium text-gray-600">Fecha</th>
              <th className="p-3 text-sm font-medium text-gray-600"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="p-3">
                  <p className="font-medium text-gray-800">{order.user?.name || 'N/A'}</p>
                  <p className="text-xs text-gray-400">{order.user?.email}</p>
                </td>
                <td className="p-3 font-semibold text-gray-800">${Number(order.total).toLocaleString()}</td>
                <td className="p-3 text-sm text-gray-500">{order.paymentMethod}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status] || ''}`}>{order.status}</span>
                </td>
                <td className="p-3 text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <Link to={`/admin/ordenes/${order.id}`} className="text-primary hover:underline text-sm flex items-center gap-1">
                    Detalle <ChevronRight size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-gray-400 py-8">No se encontraron órdenes</p>}
      </div>
    </div>
  )
}
