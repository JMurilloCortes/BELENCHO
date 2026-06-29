import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, CreditCard, MapPin, Gift, Package, User as UserIcon, CheckCircle, Clock, Shield } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  )

  if (!order) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center shadow-sm">
          <ShoppingCart size={40} className="text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Orden no encontrada</h2>
        <p className="text-gray-400 text-sm mb-8">Esta orden no existe o no tienes acceso</p>
        <Link to="/pedidos" className="inline-flex items-center gap-2 bg-gradient-to-br from-primary to-accent text-white px-6 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-300">
          Volver a mis pedidos
        </Link>
      </div>
    </div>
  )

  const status = statusConfig[order.status] || statusConfig.PENDING
  const StatusIcon = status.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Top bar */}
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20">
              <Package size={17} />
            </div>
            <span className="font-bold text-gray-800 text-lg">Orden #{order.id.slice(0, 8)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Shield size={12} />
            {status.label}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <Link to="/pedidos" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary transition-colors mb-6">
          <ArrowLeft size={14} /> Volver a mis pedidos
        </Link>

        {/* Client + Payment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="p-5 sm:p-6 lg:p-7">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-50">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                  <UserIcon size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-gray-800">Cliente</h2>
                  <p className="text-xs text-gray-400">Datos del comprador</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                  {order.user?.name?.[0] || order.customerName?.[0] || '?'}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{order.user?.name || order.customerName}</p>
                  <p className="text-xs sm:text-sm text-gray-400 truncate">{order.user?.email || order.customerEmail}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="p-5 sm:p-6 lg:p-7">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-50">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-lg">
                  <CreditCard size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-gray-800">Pago</h2>
                  <p className="text-xs text-gray-400">Método y total</p>
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-400 font-medium">Método</span>
                  <span className="font-semibold text-gray-800">{order.paymentMethod === 'WOMPI' ? 'Wompi' : 'Mercado Pago'}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                  <span className="text-xs text-gray-400 font-medium">Total</span>
                  <span className="font-bold text-gray-900 text-lg sm:text-xl">${Number(order.total).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden mb-6">
          <div className="p-5 sm:p-6 lg:p-7">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-50">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg">
                <MapPin size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-gray-800">Entrega</h2>
                <p className="text-xs text-gray-400">Dirección y horario</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-gray-400 block mb-0.5 font-medium">Nombre</span>
                <p className="font-semibold text-gray-900">{order.customerName}</p>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5 font-medium">Teléfono</span>
                <p className="font-semibold text-gray-900">{order.customerPhone}</p>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5 font-medium">Email</span>
                <p className="font-semibold text-gray-900">{order.customerEmail}</p>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5 font-medium">Barrio</span>
                <p className="font-semibold text-gray-900">{order.neighborhood?.name || '—'}</p>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5 font-medium">Dirección</span>
                <p className="font-semibold text-gray-900">{order.deliveryAddress}</p>
              </div>
              {order.deliveryDate && (
                <div>
                  <span className="text-gray-400 block mb-0.5 font-medium">Fecha de entrega</span>
                  <p className="font-semibold text-gray-900">{order.deliveryDate.split('T')[0].split('-').reverse().join('/')}</p>
                </div>
              )}
              {order.deliveryTimeSlot && (
                <div>
                  <span className="text-gray-400 block mb-0.5 font-medium">Horario</span>
                  <p className="font-semibold text-gray-900">{formatSlot(order.deliveryTimeSlot)}</p>
                </div>
              )}
              {order.deliveryInstructions && (
                <div className="sm:col-span-2">
                  <span className="text-gray-400 block mb-0.5 font-medium">Instrucciones</span>
                  <p className="font-semibold text-gray-900">{order.deliveryInstructions}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gift card */}
        {(order.giftFrom || order.giftTo || order.giftMessage) && (
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden mb-6">
            <div className="p-5 sm:p-6 lg:p-7">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-50">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center shadow-lg">
                  <Gift size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-gray-800">Tarjeta de regalo</h2>
                  <p className="text-xs text-gray-400">Detalles del regalo</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                {order.giftFrom && (
                  <div>
                    <span className="text-gray-400 block mb-0.5 font-medium">De</span>
                    <p className="font-semibold text-gray-900">{order.giftFrom}</p>
                  </div>
                )}
                {order.giftTo && (
                  <div>
                    <span className="text-gray-400 block mb-0.5 font-medium">Para</span>
                    <p className="font-semibold text-gray-900">{order.giftTo}</p>
                  </div>
                )}
                {order.giftMessage && (
                  <div className="sm:col-span-2">
                    <span className="text-gray-400 block mb-0.5 font-medium">Mensaje</span>
                    <p className="font-semibold text-gray-900 italic bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 sm:p-5 border border-gray-100">"{order.giftMessage}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Products */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="p-5 sm:p-6 lg:p-7">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-50">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                <ShoppingCart size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-gray-800">Productos</h2>
                <p className="text-xs text-gray-400">{order.items?.length || 0} producto{(order.items?.length || 0) !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <img
                    src={item.product?.images?.[0]?.url || ''}
                    alt={item.product?.name || ''}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover bg-gray-100 shrink-0 shadow-sm border border-gray-50"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate">{item.product?.name}</p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-0.5">{item.quantity} x ${Number(item.price).toLocaleString()}</p>
                  </div>
                  <p className="font-bold text-sm text-gray-900 shrink-0 whitespace-nowrap">${(Number(item.price) * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">{order.items?.length || 0} producto{(order.items?.length || 0) !== 1 ? 's' : ''}</span>
              <div className="text-right">
                <span className="text-xs text-gray-400 block">Total</span>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">${Number(order.total).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
