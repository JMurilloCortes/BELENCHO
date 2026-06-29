import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, CreditCard, MapPin, Gift, Package, User as UserIcon, CheckCircle, Clock } from 'lucide-react'
import { showToast } from '../lib/sweetalert'
import { getOrder } from '../services/payment.service'
import type { Order } from '../types'

const formatSlot = (slot: string) => {
  const [s, e] = slot.split('-').map(Number)
  const f = (h: number) => `${h % 12 || 12} ${h >= 12 ? 'PM' : 'AM'}`
  return `${f(s)} - ${f(e)}`
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: {
    label: 'Pendiente',
    color: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    icon: Clock,
  },
  PAID: {
    label: 'Pagada',
    color: 'bg-green-50 text-green-600 border-green-200',
    icon: CheckCircle,
  },
  CANCELLED: {
    label: 'Cancelada',
    color: 'bg-red-50 text-red-600 border-red-200',
    icon: Package,
  },
  REFUNDED: {
    label: 'Reembolsada',
    color: 'bg-gray-100 text-gray-500 border-gray-200',
    icon: Package,
  },
}

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    getOrder(id)
      .then(setOrder)
      .catch(() => showToast('error', 'Error al cargar la orden'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  )

  if (!order) return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
          <ShoppingCart size={36} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Orden no encontrada</h2>
        <p className="text-gray-400 text-sm mb-6">Esta orden no existe o no tienes acceso</p>
        <Link to="/pedidos" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-dark transition-all">Volver a mis pedidos</Link>
      </div>
    </div>
  )

  const status = statusConfig[order.status] || statusConfig.PENDING
  const StatusIcon = status.icon

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <Link to="/pedidos" className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-400 hover:text-primary transition-colors mb-6">
        <ArrowLeft size={14} /> Volver a mis pedidos
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Orden #{order.id.slice(0, 8)}</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">{new Date(order.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border ${status.color}`}>
          <StatusIcon size={16} />
          {status.label}
        </div>
      </div>

      {/* Client + Payment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
            <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center">
              <UserIcon size={16} className="text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-gray-700">Cliente</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shrink-0">
              {order.user?.name?.[0] || order.customerName?.[0] || '?'}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-800 text-sm truncate">{order.user?.name || order.customerName}</p>
              <p className="text-xs sm:text-sm text-gray-400 truncate">{order.user?.email || order.customerEmail}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
            <div className="w-9 h-9 rounded-xl bg-accent/5 flex items-center justify-center">
              <CreditCard size={16} className="text-accent" />
            </div>
            <h2 className="text-sm font-semibold text-gray-700">Pago</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-400">Método</span>
              <span className="font-medium text-gray-800">{order.paymentMethod === 'WOMPI' ? 'Wompi' : 'Mercado Pago'}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-400">Total</span>
              <span className="font-bold text-gray-800 text-lg">${Number(order.total).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-6">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-highlight/10 flex items-center justify-center">
            <MapPin size={16} className="text-yellow-700" />
          </div>
          <h2 className="text-sm font-semibold text-gray-700">Entrega</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
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
              <p className="font-medium text-gray-800">{order.deliveryDate.split('T')[0].split('-').reverse().join('/')}</p>
            </div>
          )}
          {order.deliveryTimeSlot && (
            <div>
              <span className="text-gray-400 block mb-0.5">Horario</span>
              <p className="font-medium text-gray-800">{formatSlot(order.deliveryTimeSlot)}</p>
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

      {/* Gift card */}
      {(order.giftFrom || order.giftTo || order.giftMessage) && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-6">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
            <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center">
              <Gift size={16} className="text-pink-500" />
            </div>
            <h2 className="text-sm font-semibold text-gray-700">Tarjeta de regalo</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            {order.giftFrom && (
              <div>
                <span className="text-gray-400 block mb-0.5">De</span>
                <p className="font-medium text-gray-800">{order.giftFrom}</p>
              </div>
            )}
            {order.giftTo && (
              <div>
                <span className="text-gray-400 block mb-0.5">Para</span>
                <p className="font-medium text-gray-800">{order.giftTo}</p>
              </div>
            )}
            {order.giftMessage && (
              <div className="sm:col-span-2">
                <span className="text-gray-400 block mb-0.5">Mensaje</span>
                <p className="font-medium text-gray-800 italic bg-gray-50 rounded-xl p-4">"{order.giftMessage}"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-6">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center">
            <ShoppingCart size={16} className="text-primary" />
          </div>
          <h2 className="text-sm font-semibold text-gray-700">Productos</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex items-center gap-4 py-3.5">
              <img
                src={item.product?.images?.[0]?.url || ''}
                alt={item.product?.name || ''}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover bg-gray-100 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-800 truncate">{item.product?.name}</p>
                <p className="text-xs sm:text-sm text-gray-400">
                  {item.quantity} x ${Number(item.price).toLocaleString()}
                </p>
              </div>
              <p className="font-semibold text-sm text-gray-800 shrink-0 whitespace-nowrap">
                ${(Number(item.price) * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-3 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <span className="text-xs sm:text-sm text-gray-500">{order.items?.length || 0} producto{(order.items?.length || 0) !== 1 ? 's' : ''}</span>
          <div className="text-right">
            <span className="text-xs text-gray-400">Total</span>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">${Number(order.total).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
