import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getUsers, updateUserRole } from '../../services/admin.service'

const roles = ['ADMIN', 'COLLABORATOR', 'CLIENT'] as const

const roleColors: Record<string, string> = {
  ADMIN: 'bg-purple-50 text-purple-600',
  COLLABORATOR: 'bg-blue-50 text-blue-600',
  CLIENT: 'bg-gray-100 text-gray-600',
}

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
        <p className="text-sm text-gray-400 mt-1">{users.length} usuarios registrados</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Usuario</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Rol</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Registro</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actividad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {u.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-500">{u.email}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className={`text-xs font-medium px-2.5 py-1.5 rounded-xl border-0 cursor-pointer focus:ring-2 focus:ring-primary/20 ${roleColors[u.role] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="flex gap-3 text-xs text-gray-400">
                      <span>{u._count?.orders || 0} órdenes</span>
                      <span>{u._count?.reviews || 0} reseñas</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
