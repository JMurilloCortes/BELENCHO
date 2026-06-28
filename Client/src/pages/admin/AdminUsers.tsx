import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getUsers, updateUserRole } from '../../services/admin.service'

const roles = ['ADMIN', 'COLLABORATOR', 'CLIENT'] as const

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

  if (loading) return <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mt-20" />

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Usuarios</h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3 text-sm font-medium text-gray-600">Nombre</th>
              <th className="p-3 text-sm font-medium text-gray-600">Email</th>
              <th className="p-3 text-sm font-medium text-gray-600">Rol</th>
              <th className="p-3 text-sm font-medium text-gray-600">Registro</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-800">{u.name}</td>
                <td className="p-3 text-sm text-gray-500">{u.email}</td>
                <td className="p-3">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="p-1.5 border rounded-lg text-sm"
                  >
                    {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="p-3 text-sm text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
