import { useEffect, useState } from 'react'
import { Plus, X, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCategories, createCategory } from '../../services/admin.service'
import type { Category } from '../../types'

export default function AdminCategories() {
  const [categories, setCategories] = useState<(Category & { _count?: { products: number } })[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')

  const load = async () => {
    const c = await getCategories()
    setCategories(c)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!name) return
    try {
      await createCategory(name)
      toast.success('Categoría creada')
      setName('')
      setShowForm(false)
      load()
    } catch {
      toast.error('Error al crear categoría')
    }
  }

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
          <p className="text-sm text-gray-400 mt-1">{categories.length} categorías</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-primary/30 flex items-center gap-2">
          <Plus size={18} /> Nueva categoría
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                  <Tag size={20} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Nueva categoría</h2>
                  <p className="text-xs text-gray-400">Agrega una categoría al catálogo</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Nombre</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Flores, Hogar, Kits..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancelar</button>
              <button onClick={handleCreate} className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-primary/30">Crear</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                <Tag size={18} className="text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm">{c.name}</h3>
                <p className="text-xs text-gray-400">{c._count?.products || 0} productos</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
