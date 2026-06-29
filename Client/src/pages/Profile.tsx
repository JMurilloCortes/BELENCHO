import { useEffect, useState } from 'react'
import { User, Lock, Save, Calendar, Eye, EyeOff, Check, X, LogOut, ShoppingBag, Heart, ChevronRight, Pencil, Phone, MapPin } from 'lucide-react'
import { showToast } from '../lib/sweetalert'
import { useAuthStore } from '../store/auth.store'
import { getProfile, updateProfile, changePassword } from '../services/user.service'
import { getActiveNeighborhoods } from '../services/neighborhood.service'
import { useNavigate } from 'react-router-dom'
import { getUserOrders } from '../services/payment.service'
import { getFavorites } from '../services/favorite.service'
import type { Neighborhood } from '../types'

export default function Profile() {
  const { user, login, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState('')
  const [defaultAddress, setDefaultAddress] = useState('')
  const [defaultNeighborhoodId, setDefaultNeighborhoodId] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [orderCount, setOrderCount] = useState(0)
  const [favoriteCount, setFavoriteCount] = useState(0)
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])

  useEffect(() => {
    if (!isAuthenticated) return
    Promise.all([
      getProfile(),
      getUserOrders().then((o) => setOrderCount(o.length)).catch(() => {}),
      getFavorites().then((f) => setFavoriteCount(f.length)).catch(() => {}),
      getActiveNeighborhoods().then(setNeighborhoods).catch(() => {}),
    ])
      .then(([u]) => {
        setProfile(u)
        setName(u.name)
        setEmail(u.email)
        setPhone(u.phone || '')
        setDefaultAddress(u.defaultAddress || '')
        setDefaultNeighborhoodId(u.defaultNeighborhoodId || '')
      })
      .catch(() => showToast('error', 'Error al cargar perfil'))
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  const handleSaveProfile = async () => {
    if (!name) { showToast('error', 'El nombre es requerido'); return }
    setSaving(true)
    try {
      const updated = await updateProfile({
        name, email, phone: phone || undefined,
        defaultAddress: defaultAddress || undefined,
        defaultNeighborhoodId: defaultNeighborhoodId || undefined,
      })
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      login({ ...storedUser, ...updated }, localStorage.getItem('token') || '')
      showToast('success', 'Perfil actualizado')
    } catch {
      showToast('error', 'Error al actualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) { showToast('error', 'Ambos campos son requeridos'); return }
    if (newPassword.length < 6) { showToast('error', 'La nueva contraseña debe tener al menos 6 caracteres'); return }
    setSaving(true)
    try {
      await changePassword(currentPassword, newPassword)
      showToast('success', 'Contraseña actualizada')
      setCurrentPassword('')
      setNewPassword('')
    } catch (e: any) {
      showToast('error', e.response?.data?.error || 'Error al cambiar contraseña')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => { logout(); navigate('/') }

  const isGoogleUser = !user?.email?.includes('@') || false
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
  const rawDate = profile?.createdAt || user?.createdAt
  const memberSince = rawDate
    ? new Date(rawDate).toLocaleDateString('es-CO', { year: 'numeric', month: 'long' })
    : '—'

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#fafafa]">
        <div className="text-center max-w-sm animate-[fadeIn_0.6s_ease-out]">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center mx-auto mb-8 ring-[6px] ring-white shadow-xl">
            <User size={42} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Inicia sesión</h1>
          <p className="text-gray-400 text-sm mb-10">Accede a tu perfil para gestionar tus datos</p>
          <a href="/login" className="group inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-full font-semibold text-sm transition-all duration-300 hover:bg-gray-800 hover:shadow-2xl hover:shadow-gray-900/20 active:scale-[0.98]">
            Ir a iniciar sesión <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <p className="text-sm text-gray-400 animate-pulse">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafafa] py-8 sm:py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Avatar block */}
        <div className="text-center mb-10">
          <div className="relative inline-block mb-5">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-4xl shadow-xl shadow-primary/20 ring-[6px] ring-white">
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-white shadow-lg shadow-black/5 flex items-center justify-center">
              <Pencil size={15} className="text-gray-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1.5">{user?.name}</h1>
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm text-gray-400">{user?.email}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="text-xs font-medium text-primary/70 bg-primary/5 px-3 py-1 rounded-full">
              {profile?.role === 'ADMINISTRADOR' ? 'Admin' : profile?.role === 'COLABORADOR' ? 'Staff' : 'Cliente'}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: Calendar, label: 'Miembro', value: memberSince, highlight: false },
            { icon: ShoppingBag, label: 'Pedidos', value: `${orderCount}`, highlight: true },
            { icon: Heart, label: 'Favoritos', value: `${favoriteCount}`, highlight: false },
          ].map(({ icon: Icon, label, value, highlight }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100/80 text-center hover:border-gray-200 hover:shadow-sm transition-all duration-200">
              <div className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center ${highlight ? 'bg-gradient-to-br from-primary/10 to-accent/10' : 'bg-gray-50'}`}>
                <Icon size={17} className={highlight ? 'text-primary' : 'text-gray-400'} />
              </div>
              <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">{label}</p>
              <p className={`font-bold truncate ${highlight ? 'text-lg text-gray-900' : 'text-sm text-gray-600'}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Main card */}
        <div className="bg-white rounded-3xl border border-gray-100/80 overflow-hidden shadow-sm">
          {/* Section: Personal info */}
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <User size={18} className="text-primary" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-gray-900">Información personal</h2>
                <p className="text-xs text-gray-400">Tu información básica de cuenta</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Nombre</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-900 border border-gray-100 focus:outline-none focus:border-gray-300 focus:bg-white transition-all duration-200" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Correo electrónico</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-900 border border-gray-100 focus:outline-none focus:border-gray-300 focus:bg-white transition-all duration-200" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Teléfono</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="+57 300 000 0000" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-900 border border-gray-100 focus:outline-none focus:border-gray-300 focus:bg-white transition-all duration-200" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Dirección de entrega</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={defaultAddress} onChange={(e) => setDefaultAddress(e.target.value)} placeholder="Calle 1 # 2-3" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-900 border border-gray-100 focus:outline-none focus:border-gray-300 focus:bg-white transition-all duration-200" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Barrio</label>
                <select value={defaultNeighborhoodId} onChange={(e) => setDefaultNeighborhoodId(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-900 border border-gray-100 focus:outline-none focus:border-gray-300 focus:bg-white transition-all duration-200 appearance-none">
                  <option value="">Seleccionar barrio</option>
                  {neighborhoods.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="mx-6 sm:mx-8 border-t border-gray-50" />

          {/* Section: Password */}
          {!isGoogleUser && (
            <>
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Lock size={18} className="text-gray-600" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-gray-900">Contraseña</h2>
                    <p className="text-xs text-gray-400">Mínimo 6 caracteres</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Actual</label>
                    <div className="relative">
                      <input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type={showCurrent ? 'text' : 'password'} className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-900 border border-gray-100 focus:outline-none focus:border-gray-300 focus:bg-white transition-all duration-200 pr-11" />
                      <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                        {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Nueva</label>
                    <div className="relative">
                      <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type={showNew ? 'text' : 'password'} className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-900 border border-gray-100 focus:outline-none focus:border-gray-300 focus:bg-white transition-all duration-200 pr-11" />
                      <button onClick={() => setShowNew(!showNew)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  {newPassword && (
                    <div className={`flex items-center gap-2 text-xs px-4 py-2.5 rounded-xl ${newPassword.length >= 6 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-500'}`}>
                      {newPassword.length >= 6 ? <><Check size={14} className="shrink-0" /> <span className="font-medium">Contraseña válida</span></> : <><X size={14} className="shrink-0" /> <span className="font-medium">Debe tener al menos 6 caracteres</span></>}
                    </div>
                  )}
                </div>
              </div>
              <div className="mx-6 sm:mx-8 border-t border-gray-50" />
            </>
          )}

          {/* Actions */}
          <div className="p-6 sm:p-8 pt-2 sm:pt-2 pb-8 sm:pb-8 space-y-3">
            <button onClick={handleSaveProfile} disabled={saving} className="group relative w-full overflow-hidden bg-gradient-to-r from-primary to-accent text-white px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/25 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 disabled:hidden" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</> : <><Save size={17} /> Guardar cambios</>}
              </span>
            </button>

            {!isGoogleUser && (
              <button onClick={handleChangePassword} disabled={saving} className="w-full bg-gray-50 text-gray-600 px-6 py-3.5 rounded-xl font-medium text-sm border border-gray-100 transition-all duration-200 hover:bg-gray-100 hover:border-gray-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2">
                {saving ? <><div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /> Cambiando...</> : <><Lock size={17} /> Cambiar contraseña</>}
              </button>
            )}

            <button onClick={handleLogout} className="w-full text-gray-300 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:text-red-400 hover:bg-red-50/50 active:scale-[0.99] flex items-center justify-center gap-2">
              <LogOut size={16} /> Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
