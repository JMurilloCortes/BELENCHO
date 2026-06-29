import { useEffect, useState } from 'react'
import { User, Lock, Save, Calendar, Eye, EyeOff, Check, X, LogOut, ShoppingBag, Heart, ChevronRight, Phone, MapPin, Shield, Mail } from 'lucide-react'
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

  const inputClass = 'w-full pl-11 pr-4 py-3.5 bg-white border-2 border-gray-100 rounded-xl text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all duration-300 hover:border-gray-200'
  const selectClass = 'w-full pl-11 pr-4 py-3.5 bg-white border-2 border-gray-100 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all duration-300 hover:border-gray-200 appearance-none'

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-[fadeIn_0.6s_ease-out]">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shadow-lg">
            <User size={40} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Inicia sesión</h1>
          <p className="text-gray-400 text-sm mb-8">Accede a tu perfil para gestionar tus datos</p>
          <a href="/login" className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all duration-300 hover:scale-105">
            Ir a iniciar sesión <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Top bar */}
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20">
              {initials}
            </div>
            <span className="font-bold text-gray-800 text-lg">Mi perfil</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Shield size={12} />
            {profile?.role === 'ADMINISTRADOR' ? 'Administrador' : profile?.role === 'COLABORADOR' ? 'Colaborador' : 'Cliente'}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* LEFT — Forms */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile header */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
              <div className="p-5 sm:p-7 lg:p-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shadow-lg shadow-primary/20">
                      {initials}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center shadow-sm">
                      <Check size={13} className="text-white" />
                    </div>
                  </div>
                  <div className="text-center sm:text-left flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{user?.name}</h1>
                    <p className="text-sm text-gray-400 mt-0.5">{user?.email}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-3 mt-3">
                      <span className="text-xs font-medium text-primary/70 bg-primary/5 px-3 py-1 rounded-full inline-flex items-center gap-1">
                        <Shield size={11} />
                        {profile?.role === 'ADMINISTRADOR' ? 'Admin' : profile?.role === 'COLABORADOR' ? 'Staff' : 'Cliente'}
                      </span>
                      <span className="text-xs text-gray-400">
                        <Calendar size={11} className="inline mr-1 -mt-0.5" />
                        {memberSince}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal info */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
              <div className="p-5 sm:p-7 lg:p-8">
                <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-50">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                    <User size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-800">Información personal</h2>
                    <p className="text-xs text-gray-400">Actualiza tus datos de cuenta</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative group">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors duration-300" />
                    <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                  </div>
                  <div className="relative group">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors duration-300" />
                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={inputClass} />
                  </div>
                  <div className="relative group">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors duration-300" />
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" placeholder="+57 300 000 0000" className={inputClass} />
                  </div>
                  <div className="relative group">
                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors duration-300" />
                    <input value={defaultAddress} onChange={(e) => setDefaultAddress(e.target.value)} placeholder="Calle 1 # 2-3" className={inputClass} />
                  </div>
                  <div className="relative group">
                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors duration-300" />
                    <select value={defaultNeighborhoodId} onChange={(e) => setDefaultNeighborhoodId(e.target.value)} className={selectClass}>
                      <option value="">Seleccionar barrio</option>
                      {neighborhoods.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="px-5 sm:px-7 lg:px-8 pb-5 sm:pb-7 lg:pb-8">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="group w-full bg-gradient-to-br from-primary to-accent text-white py-3.5 rounded-xl text-sm font-bold transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
                  ) : (
                    <><Save size={18} /> Guardar cambios</>
                  )}
                </button>
              </div>
            </div>

            {/* Password */}
            {!isGoogleUser && (
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="p-5 sm:p-7 lg:p-8">
                  <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-50">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-lg">
                      <Lock size={18} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-gray-800">Contraseña</h2>
                      <p className="text-xs text-gray-400">Mínimo 6 caracteres</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="relative group">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors duration-300" />
                      <input
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        type={showCurrent ? 'text' : 'password'}
                        placeholder="Contraseña actual"
                        className={inputClass + ' pr-11'}
                      />
                      <button
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-300 hover:text-primary transition-colors"
                      >
                        {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <div className="relative group">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors duration-300" />
                      <input
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        type={showNew ? 'text' : 'password'}
                        placeholder="Nueva contraseña"
                        className={inputClass + ' pr-11'}
                      />
                      <button
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-300 hover:text-primary transition-colors"
                      >
                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {newPassword && (
                      <div className={`flex items-center gap-2 text-xs px-4 py-3 rounded-xl border ${newPassword.length >= 6 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                        {newPassword.length >= 6 ? <><Check size={14} className="shrink-0" /> <span className="font-medium">Contraseña válida</span></> : <><X size={14} className="shrink-0" /> <span className="font-medium">Debe tener al menos 6 caracteres</span></>}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 sm:px-7 lg:px-8 pb-5 sm:pb-7 lg:pb-8">
                  <button
                    onClick={handleChangePassword}
                    disabled={saving}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-xl text-sm font-bold transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Cambiando...</> : <><Lock size={18} /> Cambiar contraseña</>}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden lg:sticky lg:top-24">
              <div className="p-5 sm:p-7 lg:p-8">
                <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-50">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-highlight/20 to-highlight/10 flex items-center justify-center">
                    <ShoppingBag size={18} className="text-yellow-700" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-800">Actividad</h2>
                    <p className="text-xs text-gray-400">Resumen de tu cuenta</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 border border-gray-50 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                        <ShoppingBag size={16} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Pedidos</p>
                        <p className="text-sm font-bold text-gray-900">{orderCount}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 border border-gray-50 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center">
                        <Heart size={16} className="text-pink-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Favoritos</p>
                        <p className="text-sm font-bold text-gray-900">{favoriteCount}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 border border-gray-50 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Calendar size={16} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Miembro desde</p>
                        <p className="text-sm font-bold text-gray-900">{memberSince}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-gray-50">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50/50 transition-all duration-200"
                  >
                    <LogOut size={16} />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
