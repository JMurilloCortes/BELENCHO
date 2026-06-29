import { useState, useEffect, useMemo } from 'react'
import { CreditCard, ChevronRight, MapPin, Phone, Mail, User, MessageSquare, ShoppingBag, Shield, Lock, Truck, ArrowLeft, Package, Building2, Calendar, Clock } from 'lucide-react'
import { showToast } from '../lib/sweetalert'
import { createPayment } from '../services/payment.service'
import { getActiveNeighborhoods } from '../services/neighborhood.service'
import { getTimeSlots } from '../services/delivery.service'
import { useCartStore } from '../store/cart.store'
import { useAuthStore } from '../store/auth.store'
import { Link } from 'react-router-dom'
import type { Neighborhood } from '../types'
import type { TimeSlot } from '../services/delivery.service'

const formatSlot = (slot: string) => {
  const [s, e] = slot.split('-').map(Number)
  const f = (h: number) => `${h % 12 || 12} ${h >= 12 ? 'PM' : 'AM'}`
  return `${f(s)} - ${f(e)}`
}

export default function Checkout() {
  const { items, itemCount, clearCart } = useCartStore()
  const user = useAuthStore((s) => s.user)
  const [loading, setLoading] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<'WOMPI' | 'MERCADOPAGO' | null>(null)
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('')
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [giftEnabled, setGiftEnabled] = useState(false)
  const [form, setForm] = useState({
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: '',
    deliveryAddress: '',
    deliveryInstructions: '',
    giftFrom: '',
    giftMessage: '',
  })

  useEffect(() => {
    getActiveNeighborhoods().then(setNeighborhoods).catch(() => {})
  }, [])

  useEffect(() => {
    if (!deliveryDate) { setTimeSlots([]); setSelectedTimeSlot(''); return }
    setSelectedTimeSlot('')
    setSlotsLoading(true)
    getTimeSlots(deliveryDate)
      .then(setTimeSlots)
      .catch(() => showToast('error', 'Error al cargar horarios'))
      .finally(() => setSlotsLoading(false))
  }, [deliveryDate])

  const tomorrow = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }, [])

  const total = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)

  const updateField = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }))

  const handlePay = async () => {
    if (!form.customerName.trim() || !form.customerEmail.trim() || !form.customerPhone.trim() || !form.deliveryAddress.trim()) {
      showToast('error', 'Completa todos los datos de entrega')
      return
    }
    if (!selectedNeighborhoodId) { showToast('error', 'Selecciona un barrio para la entrega'); return }
    if (!deliveryDate) { showToast('error', 'Selecciona una fecha de entrega'); return }
    if (!selectedTimeSlot) { showToast('error', 'Selecciona un horario de entrega'); return }
    if (!selectedMethod) { showToast('error', 'Selecciona un método de pago'); return }
    setLoading(true)
    try {
      const { redirectUrl } = await createPayment(selectedMethod, { ...form, neighborhoodId: selectedNeighborhoodId, deliveryDate, deliveryTimeSlot: selectedTimeSlot })
      clearCart()
      window.location.href = redirectUrl
    } catch (e: any) {
      showToast('error', e.response?.data?.error || 'Error al procesar pago')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            <ShoppingBag size={40} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h1>
          <p className="text-gray-400 text-sm mb-8">Agrega productos antes de continuar con el checkout</p>
          <Link to="/carrito" className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all duration-300 hover:scale-105">Volver al carrito</Link>
        </div>
      </div>
    )
  }

  const inputBase = 'w-full pl-11 pr-4 py-3.5 bg-white border-2 border-gray-100 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all duration-300 hover:border-gray-200'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Top bar */}
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
              B
            </div>
            <span className="font-bold text-gray-800 text-lg hidden sm:block">BELENCHO</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Lock size={12} />
            Checkout seguro
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* LEFT — Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header */}
            <div>
              <Link to="/carrito" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary transition-colors mb-4">
                <ArrowLeft size={14} /> Volver al carrito
              </Link>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">Checkout</h1>
              <p className="text-sm text-gray-400 mt-1.5">Completa tus datos para recibir el pedido en Quibdó</p>
            </div>

            {/* Delivery form */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
              <div className="p-5 sm:p-7 lg:p-8">
                <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-50">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                    <User size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-800">Datos de entrega</h2>
                    <p className="text-xs text-gray-400">Información del destinatario</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative group">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors duration-300" />
                    <input
                      type="text"
                      placeholder="Nombre completo"
                      value={form.customerName}
                      onChange={(e) => updateField('customerName', e.target.value)}
                      className={inputBase}
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="relative group">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors duration-300" />
                      <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={form.customerEmail}
                        onChange={(e) => updateField('customerEmail', e.target.value)}
                        className={inputBase}
                      />
                    </div>
                    <div className="relative group">
                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors duration-300" />
                      <input
                        type="tel"
                        placeholder="Teléfono"
                        value={form.customerPhone}
                        onChange={(e) => updateField('customerPhone', e.target.value)}
                        className={inputBase}
                      />
                    </div>
                  </div>
                  <div className="relative group">
                    <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors duration-300 pointer-events-none z-10" />
                    <select
                      value={selectedNeighborhoodId}
                      onChange={(e) => setSelectedNeighborhoodId(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-gray-100 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all duration-300 hover:border-gray-200 appearance-none"
                    >
                      <option value="">Selecciona un barrio</option>
                      {neighborhoods.map((n) => (
                        <option key={n.id} value={n.id}>{n.name}</option>
                      ))}
                    </select>
                    <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none rotate-90" />
                  </div>
                  <div className="relative group">
                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors duration-300" />
                    <input
                      type="text"
                      placeholder="Dirección de entrega (casa, apartamento)"
                      value={form.deliveryAddress}
                      onChange={(e) => updateField('deliveryAddress', e.target.value)}
                      className={inputBase}
                    />
                  </div>
                  <div className="relative group">
                    <MessageSquare size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors duration-300" />
                    <input
                      type="text"
                      placeholder="Instrucciones de entrega (opcional)"
                      value={form.deliveryInstructions}
                      onChange={(e) => updateField('deliveryInstructions', e.target.value)}
                      className={inputBase}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery schedule */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
              <div className="p-5 sm:p-7 lg:p-8">
                <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-50">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-highlight to-primary flex items-center justify-center shadow-lg shadow-highlight/20">
                    <Calendar size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-800">Agendar entrega</h2>
                    <p className="text-xs text-gray-400">Elige fecha y horario para recibir tu pedido</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Fecha de entrega</label>
                    <div className="relative group">
                      <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors duration-300 pointer-events-none" />
                      <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        min={tomorrow}
                        className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-gray-100 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all duration-300 hover:border-gray-200"
                      />
                    </div>
                  </div>

                  {deliveryDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-3">Horario disponible</label>
                      {slotsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {timeSlots.map((ts) => {
                            const isSelected = selectedTimeSlot === ts.slot
                            const isDisabled = ts.available <= 0
                            return (
                              <button
                                key={ts.slot}
                                onClick={() => !isDisabled && setSelectedTimeSlot(ts.slot)}
                                disabled={isDisabled}
                                className={`relative flex flex-col items-center py-3 px-2 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${
                                  isSelected
                                    ? 'border-primary bg-gradient-to-r from-primary/5 to-accent/5 shadow-md shadow-primary/10 text-primary'
                                    : isDisabled
                                      ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                                      : 'border-gray-100 hover:border-gray-200 hover:shadow-sm hover:bg-gray-50 text-gray-700'
                                }`}
                              >
                                <Clock size={14} className={`mb-1 ${isSelected ? 'text-primary' : isDisabled ? 'text-gray-300' : 'text-gray-400'}`} />
                                <span className="font-semibold">{formatSlot(ts.slot)}</span>
                                <span className={`text-[10px] mt-0.5 ${isDisabled ? 'text-gray-300' : isSelected ? 'text-primary/70' : 'text-gray-400'}`}>
                                  {isDisabled ? 'Completo' : `${ts.available} cupo${ts.available !== 1 ? 's' : ''}`}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Gift details */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
              <div className="p-5 sm:p-7 lg:p-8">
                <div className="flex items-center justify-between mb-6 pb-5 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-highlight flex items-center justify-center shadow-lg shadow-accent/20">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-gray-800">¿Incluir tarjeta de regalo?</h2>
                      <p className="text-xs text-gray-400">Personaliza tu pedido con un mensaje especial</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setGiftEnabled(!giftEnabled)
                      if (giftEnabled) { updateField('giftFrom', ''); updateField('giftTo', ''); updateField('giftMessage', '') }
                    }}
                    className={`relative inline-flex h-7 w-12 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${giftEnabled ? 'bg-primary' : 'bg-gray-200'}`}
                  >
                    <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ${giftEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {giftEnabled && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="relative group">
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors duration-300" />
                        <input
                          type="text"
                          placeholder="De (ej. María, Juan...)"
                          value={form.giftFrom}
                          onChange={(e) => updateField('giftFrom', e.target.value)}
                          className={inputBase}
                        />
                      </div>
                      <div className="relative group">
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors duration-300" />
                        <input
                          type="text"
                          placeholder="Para (ej. Ana, Carlos...)"
                          value={form.giftTo}
                          onChange={(e) => updateField('giftTo', e.target.value)}
                          className={inputBase}
                        />
                      </div>
                    </div>
                    <div className="relative group">
                      <MessageSquare size={16} className="absolute left-4 top-6 text-gray-300 group-focus-within:text-primary transition-colors duration-300" />
                      <textarea
                        placeholder="Mensaje para la tarjeta (máximo 200 caracteres)"
                        value={form.giftMessage}
                        onChange={(e) => {
                          if (e.target.value.length <= 200) updateField('giftMessage', e.target.value)
                        }}
                        rows={3}
                        maxLength={200}
                        className="w-full pl-11 pr-4 py-3.5 bg-white border-2 border-gray-100 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all duration-300 hover:border-gray-200 resize-none"
                      />
                      <span className="absolute right-3 bottom-3 text-[10px] text-gray-300">{form.giftMessage.length}/200</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
              <div className="p-5 sm:p-7 lg:p-8">
                <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-50">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-highlight flex items-center justify-center shadow-lg shadow-accent/20">
                    <CreditCard size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-800">Método de pago</h2>
                    <p className="text-xs text-gray-400">Selecciona cómo quieres pagar</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedMethod('WOMPI')}
                    className={`w-full flex items-center gap-4 p-4 sm:p-5 rounded-xl border-2 transition-all duration-300 ${
                      selectedMethod === 'WOMPI'
                        ? 'border-primary bg-gradient-to-r from-primary/5 to-accent/5 shadow-lg shadow-primary/10'
                        : 'border-gray-100 hover:border-gray-200 hover:shadow-md hover:bg-gray-50/50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      selectedMethod === 'WOMPI' ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-teal-50'
                    }`}>
                      <CreditCard size={22} className={selectedMethod === 'WOMPI' ? 'text-white' : 'text-teal-600'} />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className={`font-semibold text-sm sm:text-base ${selectedMethod === 'WOMPI' ? 'text-primary' : 'text-gray-800'}`}>
                        Wompi
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400">Paga con tarjeta de crédito, débito o PSE</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                      selectedMethod === 'WOMPI' ? 'border-primary bg-primary' : 'border-gray-300'
                    }`}>
                      {selectedMethod === 'WOMPI' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedMethod('MERCADOPAGO')}
                    className={`w-full flex items-center gap-4 p-4 sm:p-5 rounded-xl border-2 transition-all duration-300 ${
                      selectedMethod === 'MERCADOPAGO'
                        ? 'border-primary bg-gradient-to-r from-primary/5 to-accent/5 shadow-lg shadow-primary/10'
                        : 'border-gray-100 hover:border-gray-200 hover:shadow-md hover:bg-gray-50/50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      selectedMethod === 'MERCADOPAGO' ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-blue-50'
                    }`}>
                      <CreditCard size={22} className={selectedMethod === 'MERCADOPAGO' ? 'text-white' : 'text-blue-600'} />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className={`font-semibold text-sm sm:text-base ${selectedMethod === 'MERCADOPAGO' ? 'text-primary' : 'text-gray-800'}`}>
                        Mercado Pago
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400">Paga con Mercado Pago, tarjeta o efectivo</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                      selectedMethod === 'MERCADOPAGO' ? 'border-primary bg-primary' : 'border-gray-300'
                    }`}>
                      {selectedMethod === 'MERCADOPAGO' && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Pay button - mobile */}
            <div className="lg:hidden">
              <button
                onClick={handlePay}
                disabled={!selectedMethod || !selectedNeighborhoodId || !deliveryDate || !selectedTimeSlot || loading}
                className="w-full bg-gradient-to-r from-primary to-accent text-white py-4 rounded-xl text-base font-bold shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Procesando...
                  </span>
                ) : (
                  <>
                    <Lock size={16} />
                    Pagar ${total.toLocaleString()}
                  </>
                )}
              </button>
            </div>

            {/* Security badges */}
            <div className="hidden lg:flex items-center gap-6 text-xs text-gray-400 justify-center pt-2">
              <div className="flex items-center gap-1.5"><Lock size={12} /> Pago seguro</div>
              <div className="flex items-center gap-1.5"><Shield size={12} /> Datos protegidos</div>
              <div className="flex items-center gap-1.5"><Truck size={12} /> Domicilio gratis</div>
            </div>
          </div>

          {/* RIGHT — Summary sidebar */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="p-5 sm:p-7 lg:p-8">
                  <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-50">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-highlight to-primary flex items-center justify-center shadow-lg shadow-highlight/20">
                      <Package size={18} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-gray-800">Resumen</h2>
                      <p className="text-xs text-gray-400">{itemCount} producto{itemCount !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.productId} className="flex items-center gap-3 sm:gap-4 group">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-gray-50 shrink-0 border border-gray-50 group-hover:border-primary/20 transition-all duration-300">
                          <img src={item.product.images?.[0]?.url || ''} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate">{item.product.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">Cant: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-gray-800 text-sm sm:text-base shrink-0">${(Number(item.product.price) * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-5 border-t border-gray-100 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="font-semibold text-gray-800">${total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Domicilio</span>
                      <span className="text-green-600 font-medium bg-green-50 px-2.5 py-0.5 rounded-full text-xs">Gratis</span>
                    </div>
                    <div className="flex justify-between text-sm pt-3 border-t border-gray-100">
                      <span className="font-bold text-gray-900 text-base">Total</span>
                      <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">${total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pay button - desktop */}
              <div className="hidden lg:block">
                <button
                  onClick={handlePay}
                  disabled={!selectedMethod || !selectedNeighborhoodId || !deliveryDate || !selectedTimeSlot || loading}
                  className="w-full bg-gradient-to-r from-primary to-accent text-white py-4 rounded-xl text-base font-bold shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Procesando...
                    </span>
                  ) : (
                    <>
                      <Lock size={16} />
                      Pagar ${total.toLocaleString()}
                    </>
                  )}
                </button>
                <p className="text-[10px] text-gray-300 text-center mt-3">Tus datos están protegidos con encriptación SSL</p>
              </div>

              {/* Trust badges */}
              <div className="hidden lg:flex items-center justify-center gap-2 text-xs text-gray-400">
                <Shield size={12} />
                <span>Pago 100% seguro</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile security bar */}
        <div className="lg:hidden mt-6 flex items-center justify-center gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-1.5"><Lock size={12} /> Pago seguro</div>
          <div className="flex items-center gap-1.5"><Shield size={12} /> Datos protegidos</div>
          <div className="flex items-center gap-1.5"><Truck size={12} /> Domicilio gratis</div>
        </div>
      </div>
    </div>
  )
}
