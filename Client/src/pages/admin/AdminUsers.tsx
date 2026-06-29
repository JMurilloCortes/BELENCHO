import { useEffect, useState } from 'react'
import { Edit2, Trash2, Power, PowerOff, Save, Search, Users as UsersIcon, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { getUsers, updateUserRole, toggleUserActive, deleteUser } from '../../services/admin.service'

const roles = ['ADMIN', 'COLLABORATOR', 'CLIENT'] as const

const roleColors: Record<string, string> = {
  ADMIN: 'bg-purple-50 text-purple-600',
  COLLABORATOR: 'bg-blue-50 text-blue-600',
  CLIENT: 'bg-gray-100 text-gray-600',
}

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editUser, setEditUser] = useState<any>(null)

  const load = async () => {
    const u = await getUsers()
    setUsers(u)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await updateUserRole(userId, role)
      toast.success('Rol actualizado')
      load()
    } catch {
      toast.error('Error al actualizar rol')
    }
  }

  const handleToggleActive = async (id: string) => {
    try {
      const updated = await toggleUserActive(id)
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: updated.active } : u)))
      toast.success(updated.active ? 'Usuario activado' : 'Usuario desactivado')
    } catch {
      toast.error('Error al cambiar estado')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar usuario permanentemente?')) return
    try {
      await deleteUser(id)
      toast.success('Usuario eliminado')
      load()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const handleEditSave = async () => {
    if (!editUser) return
    try {
      await api.put(`/admin/users/${editUser.id}`, { name: editUser.name, email: editUser.email })
      toast.success('Usuario actualizado')
      setEditUser(null)
      load()
    } catch {
      toast.error('Error al actualizar')
    }
  }

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
          <p className="text-sm text-gray-400 mt-1">{users.length} usuarios registrados · {users.filter((u) => (u as any).active !== false).length} activos</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar usuarios..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        </div>
      </div>

      {editUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEditUser(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Editar usuario</h2>
              <button onClick={() => setEditUser(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={18} /></button>
            </div>
            <div className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Nombre</label>
                <input value={editUser.name || ''} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
                <input value={editUser.email || ''} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div className="flex gap-3 justify-end p-5 sm:p-6 border-t border-gray-100">
              <button onClick={() => setEditUser(null)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancelar</button>
              <button onClick={handleEditSave} className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2"><Save size={16} /> Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {filtered.map((u) => {
          const isActive = (u as any).active !== false
          return (
            <div key={u.id} className={`bg-white rounded-2xl shadow-sm border p-4 ${isActive ? 'border-gray-100' : 'border-gray-200/50 opacity-70'}`}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {u.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm">{u.name}</h3>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {isActive ? 'Activo' : 'Inactivo'}
                    </span>
                    <span className="text-xs text-gray-400">{u._count?.orders || 0} órdenes · {u._count?.reviews || 0} reseñas</span>
                  </div>
                </div>
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  className={`text-xs font-medium px-2 py-1 rounded-xl border-0 cursor-pointer focus:ring-2 focus:ring-primary/20 shrink-0 ${roleColors[u.role] || 'bg-gray-100 text-gray-600'}`}
                >
                  {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button onClick={() => setEditUser(u)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border border-primary/20 bg-primary/5 text-primary hover:text-white hover:bg-primary hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-200">
                  <Edit2 size={16} /> Editar
                </button>
                <button onClick={() => handleToggleActive(u.id)} className={`flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-sm font-medium border transition-all duration-200 ${
                  isActive
                    ? 'border-orange-200 bg-orange-50 text-orange-600 hover:text-white hover:bg-orange-500 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/20'
                    : 'border-green-200 bg-green-50 text-green-600 hover:text-white hover:bg-green-500 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20'
                }`}>
                  {isActive ? <PowerOff size={16} /> : <Power size={16} />}
                </button>
                <button onClick={() => handleDelete(u.id)} className="flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-medium border border-red-200 bg-red-50 text-red-500 hover:text-white hover:bg-red-500 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-200">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <UsersIcon size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">No se encontraron usuarios</p>
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left p-3 lg:p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Usuario</th>
              <th className="text-left p-3 lg:p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
              <th className="text-left p-3 lg:p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Rol</th>
              <th className="text-left p-3 lg:p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
              <th className="text-left p-3 lg:p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Registro</th>
              <th className="text-left p-3 lg:p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actividad</th>
              <th className="text-right p-3 lg:p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((u) => {
              const isActive = (u as any).active !== false
              return (
                <tr key={u.id} className={`hover:bg-gray-50/50 transition-colors ${!isActive ? 'opacity-60' : ''}`}>
                  <td className="p-3 lg:p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {u.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-3 lg:p-4 text-sm text-gray-500">{u.email}</td>
                  <td className="p-3 lg:p-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className={`text-xs font-medium px-2.5 py-1.5 rounded-xl border-0 cursor-pointer focus:ring-2 focus:ring-primary/20 ${roleColors[u.role] || 'bg-gray-100 text-gray-600'}`}
                    >
                      {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="p-3 lg:p-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="p-3 lg:p-4 text-sm text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 lg:p-4">
                    <div className="flex gap-2 text-xs text-gray-400">
                      <span>{u._count?.orders || 0} órdenes</span>
                      <span>{u._count?.reviews || 0} reseñas</span>
                    </div>
                  </td>
                  <td className="p-3 lg:p-4">
                    <div className="flex gap-1.5 justify-end">
                      <button onClick={() => setEditUser(u)} className="p-2 rounded-xl border border-primary/20 bg-primary/5 text-primary hover:text-white hover:bg-primary hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-200" title="Editar"><Edit2 size={15} /></button>
                      <button onClick={() => handleToggleActive(u.id)} className={`p-2 rounded-xl border transition-all duration-200 ${
                        isActive
                          ? 'border-orange-200 bg-orange-50 text-orange-600 hover:text-white hover:bg-orange-500 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/20'
                          : 'border-green-200 bg-green-50 text-green-600 hover:text-white hover:bg-green-500 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20'
                      }`} title={isActive ? 'Desactivar' : 'Activar'}>
                        {isActive ? <PowerOff size={15} /> : <Power size={15} />}
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="p-2 rounded-xl border border-red-200 bg-red-50 text-red-500 hover:text-white hover:bg-red-500 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-200" title="Eliminar"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <UsersIcon size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">No se encontraron usuarios</p>
          </div>
        )}
      </div>
    </div>
  )
}
