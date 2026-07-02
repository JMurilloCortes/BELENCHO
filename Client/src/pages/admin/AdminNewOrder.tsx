import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, Plus, Minus, Trash2, ShoppingCart, User, MapPin, CreditCard, Package, Check, ArrowLeft, Bike, Car, Phone, Mail, Calendar, Clock, Store, Home, Gift, AlertCircle, ChevronDown } from 'lucide-react'
import { showToast } from '../../lib/sweetalert'
import { getAdminProducts, createManualOrder, getNeighborhoods as getAdminNeighborhoods } from '../../services/admin.service'
import type { Product } from '../../types'

interface CartItem {
  product: Product
  quantity: number
}

interface Neighborhood {
  id: string
  name: string
  motoPrice: number | null
  taxiPrice: number | null
}

interface TimeSlot {
  slot: string
  capacity: number
  booked: number
  available: number
}

const paymentMethods = [
  { value: 'EFECTIVO', label: 'Efectivo', icon: CreditCard },
  { value: 'TRANSFERENCIA', label: 'Transferencia', icon: CreditCard },
  { value: 'TARJETA', label: 'Tarjeta (Datafono)', icon: CreditCard },
]

const formatSlot = (slot: string) => {
  const [s, e] = slot.split('-').map(Number)
  const f = (h: number) => `${h % 12 || 12} ${h >= 12 ? 'PM' : 'AM'}`
  return `${f(s)} - ${f(e)}`
}

const formatCurrency = (value: number) => `$${value.toLocaleString()}`

const stepClass = (active: boolean, done: boolean) =>
  `flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
    active ? 'bg-primary/10 text-primary shadow-sm' : done ? 'bg-green-50 text-green-600' : 'text-gray-300'
  }`

export default function AdminNewOrder() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('EFECTIVO')

  const [hasDelivery, setHasDelivery] = useState(false)
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryInstructions, setDeliveryInstructions] = useState('')
  const [neighborhoodId, setNeighborhoodId] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('')
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [giftEnabled, setGiftEnabled] = useState(false)
  const [giftFrom, setGiftFrom] = useState('')
  const [giftTo, setGiftTo] = useState('')
  const [giftMessage, setGiftMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const showResults = search.trim().length > 0
  const filtered = showResults
    ? products.filter((p) => p.active !== false && p.name.toLowerCase().includes(search.toLowerCase()))
    : []

  const cartTotal = cart.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0)
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)

  const selectedNeighborhood = useMemo(
    () => neighborhoods.find((n) => n.id === neighborhoodId),
    [neighborhoodId, neighborhoods]
  )

  const deliveryCost = useMemo(() => {
    if (!hasDelivery || !selectedNeighborhood) return 0
    return cart.reduce((max, item) => {
      const transport = item.product.transportType || 'MOTO'
      const cost = transport === 'TAXI'
        ? Number(selectedNeighborhood.taxiPrice ?? 0)
        : Number(selectedNeighborhood.motoPrice ?? 0)
      return Math.max(max, cost)
    }, 0)
  }, [hasDelivery, selectedNeighborhood, cart])

  const orderTotal = cartTotal + deliveryCost
  const availableSlots = timeSlots.filter((s) => s.available > 0)
  const hasProducts = cart.length > 0
  const hasCustomer = customerName.trim().length > 0 && customerPhone.trim().length > 0
  const hasDeliveryReady = hasDelivery
    ? deliveryAddress.trim().length > 0 && neighborhoodId.length > 0 && deliveryDate.length > 0 && deliveryTimeSlot.length > 0
    : true

  useEffect(() => {
    Promise.all([getAdminProducts(), getAdminNeighborhoods()])
      .then(([prods, neighs]) => {
        setProducts(prods)
        setNeighborhoods(neighs.filter((n) => n.active))
      })
      .catch(() => showToast('error', 'Error al cargar datos'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!deliveryDate) { setTimeSlots([]); return }
    fetch(`/api/delivery/slots?date=${deliveryDate}`)
      .then((r) => r.json())
      .then(setTimeSlots)
      .catch(() => {})
  }, [deliveryDate])

  const canHaveStock = (product: Product) => product.inventoryType !== 'MADE_TO_ORDER'

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        if (canHaveStock(product) && existing.quantity >= product.stock) return prev
        return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) => prev.map((i) => {
      if (i.product.id !== productId) return i
      const next = i.quantity + delta
      if (next <= 0) return null
      if (canHaveStock(i.product) && next > i.product.stock) return i
      return { ...i, quantity: next }
    }).filter(Boolean) as CartItem[])
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId))
  }

  const handleSubmit = async () => {
    if (!hasProducts) { showToast('error', 'Agrega al menos un producto'); return }
    if (!customerName.trim()) { showToast('error', 'Nombre del cliente requerido'); return }
    if (!customerPhone.trim()) { showToast('error', 'Teléfono del cliente requerido'); return }
    if (hasDelivery) {
      if (!deliveryAddress.trim()) { showToast('error', 'Dirección de entrega requerida'); return }
      if (!neighborhoodId) { showToast('error', 'Selecciona un barrio'); return }
      if (!deliveryDate) { showToast('error', 'Selecciona una fecha'); return }
      if (!deliveryTimeSlot) { showToast('error', 'Selecciona un horario'); return }
    }

    setSubmitting(true)
    try {
      const giftData = giftEnabled && (giftFrom || giftTo || giftMessage)
        ? { giftFrom: giftFrom.trim() || undefined, giftTo: giftTo.trim() || undefined, giftMessage: giftMessage.trim() || undefined }
        : {}
      const order = await createManualOrder({
        items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        paymentMethod,
        ...giftData,
        ...(hasDelivery ? {
          deliveryAddress: deliveryAddress.trim(),
          deliveryInstructions: deliveryInstructions.trim() || undefined,
          neighborhoodId,
          deliveryDate,
          deliveryTimeSlot,
          deliveryCost,
        } : {
          deliveryAddress: 'Recoge en tienda',
        }),
      })
      showToast('success', 'Pedido creado exitosamente')
      navigate(`/admin/ordenes/${order.id}`)
    } catch {
      showToast('error', 'Error al crear el pedido')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/ordenes" className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Nuevo pedido manual</h1>
            <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary uppercase tracking-wide">POS</span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">Crea un pedido directamente desde el punto de venta físico</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
            <div className="px-5 lg:px-6 pt-5 lg:pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <Package size={17} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-800">Productos</h2>
                  <p className="text-[11px] text-gray-400">Busca y agrega productos al pedido</p>
                </div>
              </div>
              {cartCount > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">{cartCount} en carrito</span>
              )}
            </div>

            <div className="p-5 lg:p-6">
              <div className="relative mb-4">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar producto por nombre..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 focus:bg-white transition-all duration-200"
                  autoFocus
                />
              </div>

              <div className="divide-y divide-gray-50 max-h-[440px] overflow-y-auto -mx-1">
                {!showResults && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                      <Search size={22} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">Busca un producto</p>
                    <p className="text-xs text-gray-300 mt-1">Escribe el nombre del producto para agregarlo</p>
                  </div>
                )}
                {showResults && filtered.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-3">
                      <AlertCircle size={22} className="text-orange-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">Sin resultados</p>
                    <p className="text-xs text-gray-300 mt-1">No encontramos productos con ese nombre</p>
                  </div>
                )}
                {filtered.map((product, idx) => {
                  const inCart = cart.find((i) => i.product.id === product.id)
                  const showStock = product.inventoryType !== 'MADE_TO_ORDER'
                  const isOutOfStock = showStock && product.stock <= 0
                  return (
                    <div key={product.id} className={`flex items-center gap-3 p-3 hover:bg-gray-50/60 transition-colors ${idx > 0 ? '' : ''}`}>
                      <div className="w-11 h-11 rounded-xl bg-gray-50 shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                        {product.images?.[0]?.url ? (
                          <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package size={16} className="text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
                        <div className="flex items-center gap-2.5 mt-0.5">
                          <span className="text-xs font-medium text-gray-700">{formatCurrency(Number(product.price))}</span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            product.inventoryType === 'MADE_TO_ORDER'
                              ? 'bg-purple-50 text-purple-600'
                              : product.inventoryType === 'HYBRID' && product.stock <= 0
                                ? 'bg-blue-50 text-blue-600'
                                : 'bg-gray-100 text-gray-500'
                          }`}>
                            {product.inventoryType === 'MADE_TO_ORDER'
                              ? 'Bajo pedido'
                              : product.inventoryType === 'HYBRID' && product.stock <= 0
                                ? 'Bajo pedido'
                                : `Stock: ${product.stock}`}
                          </span>
                          <span className={`text-[10px] flex items-center gap-0.5 px-1.5 py-0.5 rounded ${product.transportType === 'TAXI' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'}`}>
                            {product.transportType === 'TAXI' ? <Car size={8} /> : <Bike size={8} />}
                            {product.transportType === 'TAXI' ? 'Taxi' : 'Moto'}
                          </span>
                        </div>
                      </div>
                      {inCart ? (
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => updateQty(product.id, -1)} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"><Minus size={13} /></button>
                          <span className="w-9 text-center text-sm font-bold text-gray-800">{inCart.quantity}</span>
                          <button onClick={() => updateQty(product.id, 1)} disabled={showStock && inCart.quantity >= product.stock} className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors disabled:opacity-30"><Plus size={13} /></button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(product)}
                          disabled={isOutOfStock}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-br from-primary/90 to-primary text-white hover:from-primary hover:to-primary/90 shadow-sm hover:shadow-md transition-all duration-200 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {isOutOfStock ? 'Sin stock' : 'Agregar'}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
            <div className="px-5 lg:px-6 pt-5 lg:pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center">
                  <User size={17} className="text-accent" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-800">Cliente</h2>
                  <p className="text-[11px] text-gray-400">Información del comprador</p>
                </div>
              </div>
            </div>
            <div className="p-5 lg:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nombre del cliente" className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent/30 focus:bg-white transition-all duration-200" />
                </div>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Teléfono" className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent/30 focus:bg-white transition-all duration-200" />
                </div>
                <div className="sm:col-span-2 relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="Email (opcional)" className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent/30 focus:bg-white transition-all duration-200" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
            <div className="px-5 lg:px-6 pt-5 lg:pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-50 flex items-center justify-center">
                  <MapPin size={17} className="text-yellow-700" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-800">Entrega</h2>
                  <p className="text-[11px] text-gray-400">Tipo de entrega para este pedido</p>
                </div>
              </div>
            </div>
            <div className="p-5 lg:p-6">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => { setHasDelivery(false); setNeighborhoodId(''); setDeliveryAddress(''); setDeliveryDate(''); setDeliveryTimeSlot('') }} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border-2 transition-all duration-200 ${!hasDelivery ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200 hover:text-gray-600'}`}>
                  <Store size={16} />
                  Recoge en tienda
                </button>
                <button onClick={() => setHasDelivery(true)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border-2 transition-all duration-200 ${hasDelivery ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200 hover:text-gray-600'}`}>
                  <Home size={16} />
                  A domicilio
                </button>
              </div>

              {hasDelivery && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Barrio</label>
                    <div className="relative">
                      <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                      <select value={neighborhoodId} onChange={(e) => setNeighborhoodId(e.target.value)} className="w-full pl-10 pr-10 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 focus:bg-white transition-all duration-200 appearance-none cursor-pointer">
                        <option value="">Seleccionar barrio</option>
                        {neighborhoods.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                    </div>
                    {selectedNeighborhood && (
                      <div className="flex items-center gap-4 mt-2.5 px-1">
                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-primary"><Bike size={13} /> Moto: {formatCurrency(Number(selectedNeighborhood.motoPrice ?? 0))}</span>
                        <span className="text-gray-200">|</span>
                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-accent"><Car size={13} /> Taxi: {formatCurrency(Number(selectedNeighborhood.taxiPrice ?? 0))}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Dirección</label>
                    <input value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Calle 1 # 2-3, Casa 4" className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 focus:bg-white transition-all duration-200" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Fecha de entrega</label>
                      <div className="relative">
                        <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                        <input type="date" value={deliveryDate} onChange={(e) => { setDeliveryDate(e.target.value); setDeliveryTimeSlot('') }} min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 focus:bg-white transition-all duration-200" />
                      </div>
                    </div>

                    {deliveryDate && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Horario</label>
                        <div className="relative">
                          <Clock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                          <select value={deliveryTimeSlot} onChange={(e) => setDeliveryTimeSlot(e.target.value)} className="w-full pl-10 pr-10 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 focus:bg-white transition-all duration-200 appearance-none cursor-pointer">
                            <option value="">Seleccionar horario</option>
                            {availableSlots.map((slot) => (
                              <option key={slot.slot} value={slot.slot} disabled={slot.available <= 0}>
                                {formatSlot(slot.slot)} ({slot.available} cupo{slot.available !== 1 ? 's' : ''})
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                        </div>
                        {availableSlots.length === 0 && <p className="text-[11px] text-red-400 mt-1.5">No hay horarios disponibles para esta fecha</p>}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Instrucciones (opcional)</label>
                    <input value={deliveryInstructions} onChange={(e) => setDeliveryInstructions(e.target.value)} placeholder="Dejar en portería, llamar al llegar, etc." className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 focus:bg-white transition-all duration-200" />
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
                          <Gift size={14} className="text-pink-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Tarjeta de regalo</p>
                          <p className="text-xs text-gray-400">De, Para y mensaje personalizado</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => { setGiftEnabled(!giftEnabled); if (giftEnabled) { setGiftFrom(''); setGiftTo(''); setGiftMessage('') } }} className={`relative inline-flex h-7 w-12 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${giftEnabled ? 'bg-primary' : 'bg-gray-200'}`}>
                        <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ${giftEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                    {giftEnabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">De</label>
                          <input value={giftFrom} onChange={(e) => setGiftFrom(e.target.value)} placeholder="Quién regala" className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 focus:bg-white transition-all duration-200" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Para</label>
                          <input value={giftTo} onChange={(e) => setGiftTo(e.target.value)} placeholder="Quién recibe" className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 focus:bg-white transition-all duration-200" />
                        </div>
                        <div className="sm:col-span-2 relative">
                          <label className="block text-xs font-medium text-gray-500 mb-1.5">Mensaje</label>
                          <textarea value={giftMessage} onChange={(e) => { if (e.target.value.length <= 200) setGiftMessage(e.target.value) }} placeholder="Escribe un mensaje personalizado..." maxLength={200} rows={2} className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 focus:bg-white transition-all duration-200 resize-none" />
                          <span className="absolute right-3 bottom-3 text-[10px] text-gray-300 font-medium">{giftMessage.length}/200</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-1">
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden sticky top-24">
            <div className="px-5 pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
                  <ShoppingCart size={17} className="text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-sm font-bold text-gray-800">Resumen</h2>
                  <p className="text-[11px] text-gray-400">{cartCount > 0 ? `${cartCount} producto${cartCount !== 1 ? 's' : ''}` : 'Carrito vacío'}</p>
                </div>
                {cartCount > 0 && (
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shadow-sm">{cartCount}</span>
                )}
              </div>
            </div>

            <div className="max-h-[280px] overflow-y-auto p-3 space-y-1.5">
              {cart.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-2">
                    <ShoppingCart size={18} className="text-gray-300" />
                  </div>
                  <p className="text-xs font-medium text-gray-400">Carrito vacío</p>
                  <p className="text-[10px] text-gray-300 mt-0.5">Agrega productos desde la búsqueda</p>
                </div>
              )}
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100/60 transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center overflow-hidden border border-gray-50">
                    {item.product.images?.[0]?.url ? (
                      <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package size={12} className="text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700 truncate">{item.product.name}</p>
                    <p className="text-[10px] text-gray-400">{item.quantity} x {formatCurrency(Number(item.product.price))}</p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button onClick={() => updateQty(item.product.id, -1)} className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors"><Minus size={10} /></button>
                    <span className="w-7 text-center text-xs font-bold text-gray-800">{item.quantity}</span>
                    <button onClick={() => updateQty(item.product.id, 1)} disabled={item.product.inventoryType !== 'MADE_TO_ORDER' && item.quantity >= item.product.stock} className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors disabled:opacity-30"><Plus size={10} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.product.id)} className="p-1 text-gray-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-gray-100 space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="text-sm font-semibold text-gray-700">{formatCurrency(cartTotal)}</span>
                </div>
                {hasDelivery && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Domicilio</span>
                    {deliveryCost > 0 ? (
                      <span className="text-sm font-semibold text-primary">{formatCurrency(deliveryCost)}</span>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded">Pendiente</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-sm font-bold text-gray-700">Total</span>
                <span className="text-lg font-extrabold text-gray-800">{formatCurrency(orderTotal)}</span>
              </div>
            </div>

            <div className="px-5 pb-5">
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Método de pago</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {paymentMethods.map((pm) => (
                    <button key={pm.value} onClick={() => setPaymentMethod(pm.value)} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${paymentMethod === pm.value ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${paymentMethod === pm.value ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-400'}`}>
                        {paymentMethod === pm.value ? <Check size={13} /> : <pm.icon size={13} />}
                      </div>
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || cart.length === 0}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creando...
                  </span>
                ) : cart.length === 0 ? (
                  'Agrega productos para continuar'
                ) : (
                  `Generar pedido · ${formatCurrency(orderTotal)}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}