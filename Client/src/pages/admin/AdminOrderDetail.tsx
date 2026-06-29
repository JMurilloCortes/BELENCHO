import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, User as UserIcon, CreditCard, Clock, MapPin } from 'lucide-react'
import { showToast } from '../../lib/sweetalert'
import { getOrderDetail, updateOrderStatus } from '../../services/admin.service'

const statuses = ['PENDING', 'PAID', 'CANCELLED', 'REFUNDED'] as const
const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  PAID: 'bg-green-50 text-green-600 border-green-200',
  CANCELLED: 'bg-red-50 text-red-600 border-red-200',
  REFUNDED: 'bg-gray-100 text-gray-500 border-gray-200',
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagada',
  CANCELLED: 'Cancelada',
  REFUNDED: 'Reembolsada',
}

export default function AdminOrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const load = async () => {
    if (!id) return
    try {
      setOrder(await getOrderDetail(id))
    } catch {
      showToast('error', 'Error al cargar orden')
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
      showToast('success', 'Estado actualizado')
    } catch {
      showToast('error', 'Error al actualizar estado')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  )

  if (!order) return (
    <div className="text-center py-16">
      <ShoppingCart size={48} className="mx-auto text-gray-200 mb-3" />
      <p className="text-gray-400">Orden no encontrada</p>
      <Link to="/admin/ordenes" className="text-primary hover:underline text-sm mt-2 inline-block">Volver a órdenes</Link>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-0 sm:px-2">
      <Link to="/admin/ordenes" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary mb-4 lg:mb-6 transition-colors">
        <ArrowLeft size={16} /> Volver a órdenes
      </Link>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 lg:mb-8">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Orden #{order.id.slice(0, 8)}</h1>
          <p className="text-xs lg:text-sm text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString()} - {new Date(order.createdAt).toLocaleTimeString()}</p>
        </div>
        <span className={`text-sm font-semibold px-3 lg:px-4 py-1.5 rounded-xl border ${statusColors[order.status] || 'bg-gray-100'}`}>
          {statusLabels[order.status] || order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6">
          <div className="flex items-center gap-3 mb-3 lg:mb-4 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-primary/5 flex items-center justify-center">
              <UserIcon size={16} className="text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-gray-700">Cliente</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                {order.user?.name?.[0] || '?'}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-800 text-sm truncate">{order.user?.name}</p>
                <p className="text-xs lg:text-sm text-gray-400 truncate">{order.user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6">
          <div className="flex items-center gap-3 mb-3 lg:mb-4 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-accent/5 flex items-center justify-center">
              <CreditCard size={16} className="text-accent" />
            </div>
            <h2 className="text-sm font-semibold text-gray-700">Pago</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs lg:text-sm">
              <span className="text-gray-400">Método</span>
              <span className="font-medium text-gray-800">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-xs lg:text-sm">
              <span className="text-gray-400">Total</span>
              <span className="font-bold text-gray-800 text-base lg:text-lg">${Number(order.total).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6 mb-6 lg:mb-8">
        <div className="flex items-center gap-3 mb-3 lg:mb-4 pb-3 border-b border-gray-100">
          <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-highlight/10 flex items-center justify-center">
            <MapPin size={16} className="text-yellow-700" />
          </div>
          <h2 className="text-sm font-semibold text-gray-700">Entrega</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs lg:text-sm">
          <div>
            <span className="text-gray-400 block mb-0.5">Nombre</span>
            <p className="font-medium text-gray-800">{order.customerName}</p>
          </div>
          <div>
            <span className="text-gray-400 block mb-0.5">Teléfono</span>
            <p className="font-medium text-gray-800">{order.customerPhone}</p>
          </div>
          <div>
            <span className="text-gray-400 block mb-0.5">Email</span>
            <p className="font-medium text-gray-800">{order.customerEmail}</p>
          </div>
          <div>
            <span className="text-gray-400 block mb-0.5">Barrio</span>
            <p className="font-medium text-gray-800">{order.neighborhood?.name || '—'}</p>
          </div>
          <div>
            <span className="text-gray-400 block mb-0.5">Dirección</span>
            <p className="font-medium text-gray-800">{order.deliveryAddress}</p>
          </div>
          {order.deliveryDate && (
            <div>
              <span className="text-gray-400 block mb-0.5">Fecha de entrega</span>
              <p className="font-medium text-gray-800">{new Date(order.deliveryDate).toLocaleDateString()}</p>
            </div>
          )}
          {order.deliveryTimeSlot && (
            <div>
              <span className="text-gray-400 block mb-0.5">Horario</span>
              <p className="font-medium text-gray-800">{order.deliveryTimeSlot.replace('-', ' - ')}</p>
            </div>
          )}
          {order.deliveryInstructions && (
            <div className="sm:col-span-2">
              <span className="text-gray-400 block mb-0.5">Instrucciones</span>
              <p className="font-medium text-gray-800">{order.deliveryInstructions}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6 mb-6 lg:mb-8">
        <div className="flex items-center gap-3 mb-3 lg:mb-4 pb-3 border-b border-gray-100">
          <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-primary/5 flex items-center justify-center">
            <ShoppingCart size={16} className="text-primary" />
          </div>
          <h2 className="text-sm font-semibold text-gray-700">Productos</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex items-center gap-3 lg:gap-4 py-3">
              <img src={item.product?.images?.[0]?.url || ''} alt="" className="w-10 h-10 lg:w-14 lg:h-14 rounded-xl object-cover bg-gray-100 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-800 truncate">{item.product?.name}</p>
                <p className="text-xs text-gray-400">{item.quantity} x ${Number(item.price).toLocaleString()}</p>
              </div>
              <p className="font-semibold text-sm text-gray-800 shrink-0 whitespace-nowrap">${(Number(item.price) * item.quantity).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-3 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <span className="text-xs lg:text-sm text-gray-500">Total de productos: {order.items?.length || 0}</span>
          <div className="text-right">
            <span className="text-xs text-gray-400">Total</span>
            <p className="text-lg lg:text-xl font-bold text-gray-800">${Number(order.total).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6">
        <div className="flex items-center gap-3 mb-3 lg:mb-4 pb-3 border-b border-gray-100">
          <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-accent/5 flex items-center justify-center">
            <Clock size={16} className="text-accent" />
          </div>
          <h2 className="text-sm font-semibold text-gray-700">Actualizar estado</h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map((s) => {
            const active = s === order.status
            return (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={active || updating}
                className={`px-3 lg:px-5 py-2 lg:py-2.5 rounded-xl text-xs lg:text-sm font-medium border transition-all duration-200 ${
                  active
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50'
                }`}
              >
                {statusLabels[s]}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
