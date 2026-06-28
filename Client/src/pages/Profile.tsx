import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { User, Lock, Save } from 'lucide-react'
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
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Perfil</h1>
        <p className="text-gray-500">Inicia sesión para ver tu perfil</p>
        <a href="/login" className="inline-block mt-4 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium">Iniciar sesión</a>
      </div>
    )
  }

  if (loading) {
    return <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mt-20" />
  }

  const isGoogleUser = !user?.email?.includes('@') || false

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Mi Perfil</h1>

      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <User size={20} /> Información personal
        </h2>
        <div>
          <label className="block text-sm text-gray-500 mb-1">Nombre</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2.5 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full p-2.5 border rounded-lg" />
        </div>
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={18} /> {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

      {!isGoogleUser && (
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
            <Lock size={20} /> Cambiar contraseña
          </h2>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Contraseña actual</label>
            <input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password" className="w-full p-2.5 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Nueva contraseña</label>
            <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" className="w-full p-2.5 border rounded-lg" />
          </div>
          <button
            onClick={handleChangePassword}
            disabled={saving}
            className="bg-gray-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Cambiando...' : 'Cambiar contraseña'}
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>Rol: <span className="font-medium text-gray-600">{user?.role}</span></span>
          <span>Miembro desde: {new Date(user?.createdAt || '').toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}
