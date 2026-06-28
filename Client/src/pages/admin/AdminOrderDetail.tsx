import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { getOrderDetail, updateOrderStatus } from '../../services/admin.service'

const statuses = ['PENDING', 'PAID', 'CANCELLED', 'REFUNDED'] as const
const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-100 text-gray-600',
}

export default function AdminOrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const load = async () => {
    if (!id) return
    try {
      const o = await getOrderDetail(id)
      setOrder(o)
    } catch {
      toast.error('Error al cargar orden')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return
    setUpdating(true)
    try {
      const updated = await updateOrderStatus(id, newStatus)
      setOrder(updated)
      toast.success('Estado actualizado')
    } catch {
      toast.error('Error al actualizar estado')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mt-20" />
  if (!order) return <p className="text-gray-500 text-center py-20">Orden no encontrada</p>

  return (
    <div className="max-w-3xl">
      <Link to="/admin/ordenes" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary mb-6">
        <ArrowLeft size={16} /> Volver a órdenes
      </Link>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Orden #{order.id.slice(0, 8)}</h1>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusColors[order.status]}`}>{order.status}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Cliente</h2>
          <p className="font-medium text-gray-800">{order.user?.name}</p>
          <p className="text-sm text-gray-400">{order.user?.email}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Pago</h2>
          <p className="font-medium text-gray-800">{order.paymentMethod}</p>
          <p className="text-sm text-gray-400">Total: <span className="font-semibold">${Number(order.total).toLocaleString()}</span></p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-5 mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Productos</h2>
        <div className="space-y-3">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex items-center gap-3 py-2">
              <img src={item.product?.images?.[0]?.url || ''} alt="" className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-800">{item.product?.name}</p>
                <p className="text-xs text-gray-400">Qty: {item.quantity} x ${Number(item.price).toLocaleString()}</p>
              </div>
              <p className="font-semibold text-sm text-gray-800">${(Number(item.price) * item.quantity).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <div className="border-t mt-3 pt-3 flex justify-between font-bold text-gray-800">
          <span>Total</span>
          <span>${Number(order.total).toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Actualizar estado</h2>
        <div className="flex gap-2 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              disabled={s === order.status || updating}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                s === order.status
                  ? 'bg-primary text-white border-primary'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 disabled:opacity-50'
              }`}
            >
              {s === 'PENDING' ? 'Pendiente' : s === 'PAID' ? 'Pagada' : s === 'CANCELLED' ? 'Cancelada' : 'Reembolsada'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
