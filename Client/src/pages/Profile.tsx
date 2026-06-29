import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { User, Lock, Save, Mail, Calendar, Shield, Eye, EyeOff, Check, X } from 'lucide-react'
import { useAuthStore } from '../store/auth.store'
import { getProfile, updateProfile, changePassword } from '../services/user.service'

export default function Profile() {
  const { user, login, isAuthenticated } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return
    getProfile()
      .then((u) => {
        setName(u.name)
        setEmail(u.email)
      })
      .catch(() => toast.error('Error al cargar perfil'))
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  const handleSaveProfile = async () => {
    if (!name) { toast.error('El nombre es requerido'); return }
    setSaving(true)
    try {
      const updated = await updateProfile({ name, email })
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      login({ ...storedUser, ...updated }, localStorage.getItem('token') || '')
      toast.success('Perfil actualizado')
    } catch {
      toast.error('Error al actualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) { toast.error('Ambos campos son requeridos'); return }
    if (newPassword.length < 6) { toast.error('La nueva contraseña debe tener al menos 6 caracteres'); return }
    setSaving(true)
    try {
      await changePassword(currentPassword, newPassword)
      toast.success('Contraseña actualizada')
      setCurrentPassword('')
      setNewPassword('')
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Error al cambiar contraseña')
    } finally {
      setSaving(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <User size={36} className="text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Inicia sesión</h1>
          <p className="text-gray-500 mb-6">Necesitas iniciar sesión para ver tu perfil</p>
          <a href="/login" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-dark transition-all duration-300 hover:shadow-lg hover:shadow-primary/30">
            Ir a iniciar sesión
          </a>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  const isGoogleUser = !user?.email?.includes('@') || false

  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-lg shadow-primary/20">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <h1 className="text-2xl font-bold text-gray-800">{user?.name}</h1>
        <p className="text-sm text-gray-400">{user?.email}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {[
          { icon: Shield, label: 'Rol', value: user?.role },
          { icon: Calendar, label: 'Miembro desde', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="col-span-2 sm:col-span-2 bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
              <Icon size={18} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
            <User size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Información personal</h2>
            <p className="text-xs text-gray-400">Actualiza tus datos básicos</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Nombre completo</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={name} onChange={(e) => setName(e.target.value)} className={`${inputClass} pl-10`} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Correo electrónico</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={`${inputClass} pl-10`} />
            </div>
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
            ) : (
              <><Save size={18} /> Guardar cambios</>
            )}
          </button>
        </div>
      </div>

      {!isGoogleUser && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center">
              <Lock size={20} className="text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Cambiar contraseña</h2>
              <p className="text-xs text-gray-400">Mínimo 6 caracteres</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Contraseña actual</label>
              <div className="relative">
                <input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type={showCurrent ? 'text' : 'password'} className={`${inputClass} pr-10`} />
                <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg border border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white hover:border-primary transition-all duration-200">
                  {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Nueva contraseña</label>
              <div className="relative">
                <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type={showNew ? 'text' : 'password'} className={`${inputClass} pr-10`} />
                <button onClick={() => setShowNew(!showNew)} className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg border border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white hover:border-primary transition-all duration-200">
                  {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            {newPassword && (
              <div className="flex items-center gap-2 text-xs">
                {newPassword.length >= 6 ? (
                  <><Check size={14} className="text-green-500" /> <span className="text-green-600">Contraseña segura</span></>
                ) : (
                  <><X size={14} className="text-red-400" /> <span className="text-red-400">Mínimo 6 caracteres</span></>
                )}
              </div>
            )}
            <button
              onClick={handleChangePassword}
              disabled={saving}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
    </div>
  )
}
