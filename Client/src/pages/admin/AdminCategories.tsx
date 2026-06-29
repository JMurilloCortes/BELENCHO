import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Power, PowerOff, FolderOpen, X, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCategories, createCategory, updateCategory, deleteCategory, toggleCategoryActive } from '../../services/admin.service'
import type { Category } from '../../types'

export default function AdminCategories() {
  const [categories, setCategories] = useState<(Category & { _count?: { products: number } })[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [search, setSearch] = useState('')

  const load = async () => {
    const c = await getCategories()
    setCategories(c)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setName('')
    setShowForm(true)
  }

  const openEdit = (c: Category) => {
    setEditing(c)
    setName(c.name)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!name.trim()) return toast.error('El nombre es requerido')
    try {
      if (editing) {
        await updateCategory(editing.id, name.trim())
        toast.success('Categoría actualizada')
      } else {
        await createCategory(name.trim())
        toast.success('Categoría creada')
      }
      setShowForm(false)
      load()
    } catch {
      toast.error('Error al guardar categoría')
    }
  }

  const handleToggleActive = async (id: string) => {
    try {
      const updated = await toggleCategoryActive(id)
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, active: updated.active } : c)))
      toast.success(updated.active ? 'Categoría activada' : 'Categoría desactivada')
    } catch {
      toast.error('Error al cambiar estado')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar categoría permanentemente?')) return
    try {
      await deleteCategory(id)
      toast.success('Categoría eliminada')
      load()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-800">Categorías</h1>
          <p className="text-sm text-gray-400 mt-1">{categories.length} categorías · {categories.filter((c) => (c as any).active !== false).length} activas</p>
        </div>
        <button onClick={openCreate} className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-primary/30 flex items-center gap-2 w-full sm:w-auto justify-center">
          <Plus size={18} /> Nueva categoría
        </button>
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar categorías..." className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200" />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center"><FolderOpen size={20} className="text-primary" /></div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{editing ? 'Editar' : 'Nueva'} categoría</h2>
                  <p className="text-xs text-gray-400">Ingresa el nombre de la categoría</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={18} /></button>
            </div>
            <div className="p-5 sm:p-6">
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Nombre</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la categoría" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" autoFocus />
            </div>
            <div className="flex gap-3 justify-end p-5 sm:p-6 border-t border-gray-100">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancelar</button>
              <button onClick={handleSave} className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {filtered.map((c) => {
          const isActive = (c as any).active !== false
          return (
            <div key={c.id} className={`bg-white rounded-2xl shadow-sm border p-4 ${isActive ? 'border-gray-100' : 'border-gray-200/50 opacity-70'}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800 text-sm">{c.name}</h3>
                    {!isActive && <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">Inactiva</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{c.slug}</p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full shrink-0">{c._count?.products || 0}</span>
              </div>
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button onClick={() => openEdit(c)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border border-primary/20 bg-primary/5 text-primary hover:text-white hover:bg-primary hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-200">
                  <Edit2 size={16} /> Editar
                </button>
                <button onClick={() => handleToggleActive(c.id)} className={`flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-sm font-medium border transition-all duration-200 ${
                  isActive
                    ? 'border-orange-200 bg-orange-50 text-orange-600 hover:text-white hover:bg-orange-500 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/20'
                    : 'border-green-200 bg-green-50 text-green-600 hover:text-white hover:bg-green-500 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20'
                }`}>
                  {isActive ? <PowerOff size={16} /> : <Power size={16} />}
                </button>
                <button onClick={() => handleDelete(c.id)} className="flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-medium border border-red-200 bg-red-50 text-red-500 hover:text-white hover:bg-red-500 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-200">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <FolderOpen size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">No se encontraron categorías</p>
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left p-3 lg:p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Categoría</th>
              <th className="text-left p-3 lg:p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Slug</th>
              <th className="text-left p-3 lg:p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Productos</th>
              <th className="text-left p-3 lg:p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
              <th className="text-right p-3 lg:p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((c) => {
              const isActive = (c as any).active !== false
              return (
                <tr key={c.id} className={`hover:bg-gray-50/50 transition-colors ${!isActive ? 'opacity-60' : ''}`}>
                  <td className="p-3 lg:p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shrink-0">
                        <FolderOpen size={16} className="text-primary" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-800">{c.name}</span>
                        {!isActive && <span className="text-[10px] ml-2 bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">Inactiva</span>}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 lg:p-4 text-sm text-gray-400">{c.slug}</td>
                  <td className="p-3 lg:p-4">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{c._count?.products || 0}</span>
                  </td>
                  <td className="p-3 lg:p-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="p-3 lg:p-4">
                    <div className="flex gap-1.5 justify-end">
                      <button onClick={() => openEdit(c)} className="p-2 rounded-xl border border-primary/20 bg-primary/5 text-primary hover:text-white hover:bg-primary hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-200" title="Editar"><Edit2 size={15} /></button>
                      <button onClick={() => handleToggleActive(c.id)} className={`p-2 rounded-xl border transition-all duration-200 ${
                        isActive
                          ? 'border-orange-200 bg-orange-50 text-orange-600 hover:text-white hover:bg-orange-500 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/20'
                          : 'border-green-200 bg-green-50 text-green-600 hover:text-white hover:bg-green-500 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20'
                      }`} title={isActive ? 'Desactivar' : 'Activar'}>
                        {isActive ? <PowerOff size={15} /> : <Power size={15} />}
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="p-2 rounded-xl border border-red-200 bg-red-50 text-red-500 hover:text-white hover:bg-red-500 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-200" title="Eliminar"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <FolderOpen size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">No se encontraron categorías</p>
          </div>
        )}
      </div>
    </div>
  )
}
