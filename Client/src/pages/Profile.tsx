import { useEffect, useState } from 'react'
import { User, Lock, Save, Mail, Calendar, Shield, Eye, EyeOff, Check, X, LogOut, ShoppingBag, Heart } from 'lucide-react'
import { showToast } from '../lib/sweetalert'
import { useAuthStore } from '../store/auth.store'
import { getProfile, updateProfile, changePassword } from '../services/user.service'
import { useNavigate } from 'react-router-dom'
import { getUserOrders } from '../services/payment.service'
import { getFavorites } from '../services/favorite.service'

export default function Profile() {
  const { user, login, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [activeTab, setActiveTab] = useState('info')
  const [orderCount, setOrderCount] = useState(0)
  const [favoriteCount, setFavoriteCount] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) return
    Promise.all([
      getProfile(),
      getUserOrders().then((o) => setOrderCount(o.length)).catch(() => {}),
      getFavorites().then((f) => setFavoriteCount(f.length)).catch(() => {}),
    ])
      .then(([u]) => {
        setProfile(u)
        setName(u.name)
        setEmail(u.email)
      })
      .catch(() => showToast('error', 'Error al cargar perfil'))
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  const handleSaveProfile = async () => {
    if (!name) { showToast('error', 'El nombre es requerido'); return }
    setSaving(true)
    try {
      const updated = await updateProfile({ name, email })
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
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long' })
    : '—'
  const roleLabels: Record<string, string> = {
    ADMINISTRADOR: 'Administrador',
    COLABORADOR: 'Colaborador',
    CLIENTE: 'Cliente',
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-primary/5">
            <User size={44} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inicia sesión</h1>
          <p className="text-gray-500 mb-8 text-sm">Accede a tu perfil para gestionar tus datos y pedidos</p>
          <a
            href="/login"
            className="inline-flex items-center gap-2.5 bg-gradient-to-r from-primary to-accent text-white px-8 py-3.5 rounded-2xl font-semibold hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
          >
            Ir a iniciar sesión
          </a>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/80 via-white to-gray-50/40">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-10 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-accent flex items-center justify-center text-white font-bold text-3xl sm:text-4xl shadow-lg shadow-primary/15">
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center">
                <Check size={14} className="text-white" />
              </div>
            </div>
            <div className="text-center sm:text-left flex-1 min-w-0 pt-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user?.name}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 mt-1.5">
                <p className="text-sm text-gray-400 flex items-center justify-center sm:justify-start gap-1.5">
                  <Mail size={14} className="shrink-0" />
                  {user?.email}
                </p>
                <span className="hidden sm:block text-gray-200">|</span>
                <span className="text-xs font-medium text-primary bg-primary/5 px-3 py-1 rounded-full inline-flex items-center gap-1.5 w-fit mx-auto sm:mx-0">
                  <Shield size={12} />
                  {roleLabels[profile?.role || user?.role] || profile?.role || user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-gray-50">
            {[
              { icon: Calendar, label: 'Miembro desde', value: memberSince },
              { icon: ShoppingBag, label: 'Pedidos', value: `${orderCount}` },
              { icon: Heart, label: 'Favoritos', value: `${favoriteCount}` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center sm:text-left p-3 sm:p-4 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors duration-200">
                <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center mx-auto sm:mx-0 mb-2.5">
                  <Icon size={16} className="text-primary" />
                </div>
                <p className="text-[11px] sm:text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1 border border-gray-100 mb-6 overflow-x-auto shadow-sm">
          {[
            { id: 'info', label: 'Información personal', icon: User },
            { id: 'password', label: 'Contraseña', icon: Lock, disabled: isGoogleUser },
          ].map(({ id, label, icon: Icon, disabled }) => (
            <button
              key={id}
              onClick={() => !disabled && setActiveTab(id)}
              disabled={disabled}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap flex-1 justify-center ${
                activeTab === id
                  ? 'bg-gray-900 text-white shadow-md'
                  : disabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-10">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Información personal</h2>
            <p className="text-sm text-gray-400 mb-8">Actualiza tus datos básicos de cuenta</p>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 focus:bg-white transition-all duration-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Correo electrónico</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 focus:bg-white transition-all duration-200"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
                ) : (
                  <><Save size={18} /> Guardar cambios</>
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'password' && !isGoogleUser && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-10">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Cambiar contraseña</h2>
            <p className="text-sm text-gray-400 mb-8">Mínimo 6 caracteres para mayor seguridad</p>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña actual</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    type={showCurrent ? 'text' : 'password'}
                    className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 focus:bg-white transition-all duration-200"
                  />
                  <button
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nueva contraseña</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    type={showNew ? 'text' : 'password'}
                    className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 focus:bg-white transition-all duration-200"
                  />
                  <button
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {newPassword && (
                <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl ${newPassword.length >= 6 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-500'}`}>
                  {newPassword.length >= 6 ? (
                    <><Check size={16} className="shrink-0" /> <span>Contraseña segura</span></>
                  ) : (
                    <><X size={16} className="shrink-0" /> <span>Mínimo 6 caracteres</span></>
                  )}
                </div>
              )}
              <button
                onClick={handleChangePassword}
                disabled={saving}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Cambiando...</>
                ) : (
                  <><Lock size={18} /> Cambiar contraseña</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-gray-200 bg-white text-gray-400 text-sm font-medium hover:text-red-500 hover:border-red-200 hover:bg-red-50/50 transition-all duration-200"
        >
          <LogOut size={17} />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
