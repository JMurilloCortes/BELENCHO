import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCategories, createCategory } from '../../services/admin.service'
import type { Category } from '../../types'

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
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

  if (loading) return <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mt-20" />

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Categorías</h1>
        <button onClick={() => setShowForm(true)} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors flex items-center gap-1.5">
          <Plus size={18} /> Nueva categoría
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Nueva categoría</h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la categoría" className="w-full p-2.5 border rounded-lg mb-3" />
            <button onClick={handleCreate} className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-dark">Crear</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="bg-white rounded-xl p-4 shadow-sm border">
            <h3 className="font-semibold text-gray-800">{c.name}</h3>
            <p className="text-xs text-gray-400 mt-1">{c.slug}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
