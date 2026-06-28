import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { getProducts } from '../../services/product.service'
import { createProduct, updateProduct, deleteProduct, getCategories } from '../../services/admin.service'
import type { Product, Category } from '../../types'

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', categoryId: '', images: '' })

  const load = async () => {
    const [p, c] = await Promise.all([getProducts(), getCategories()])
    setProducts(p)
    setCategories(c)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', description: '', price: '', stock: '', categoryId: categories[0]?.id || '', images: '' })
    setShowForm(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      stock: String(p.stock),
      categoryId: p.categoryId,
      images: p.images?.map((i) => i.url).join('\n') || '',
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.price || !form.categoryId) {
      toast.error('Nombre, precio y categoría son requeridos')
      return
    }
    try {
      const data = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0,
        categoryId: form.categoryId,
        images: form.images.split('\n').filter(Boolean),
      }
      if (editing) {
        await updateProduct(editing.id, data)
        toast.success('Producto actualizado')
      } else {
        await createProduct(data)
        toast.success('Producto creado')
      }
      setShowForm(false)
      load()
    } catch {
      toast.error('Error al guardar producto')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar producto?')) return
    try {
      await deleteProduct(id)
      toast.success('Producto eliminado')
      load()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  if (loading) return <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mt-20" />

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
        <button onClick={openCreate} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors flex items-center gap-1.5">
          <Plus size={18} /> Nuevo producto
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editing ? 'Editar' : 'Nuevo'} producto</h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre" className="w-full p-2.5 border rounded-lg" />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción" className="w-full p-2.5 border rounded-lg h-20 resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Precio" type="number" className="w-full p-2.5 border rounded-lg" />
                <input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="Stock" type="number" className="w-full p-2.5 border rounded-lg" />
              </div>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full p-2.5 border rounded-lg">
                <option value="">Seleccionar categoría</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <textarea value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} placeholder="URLs de imágenes (una por línea)" className="w-full p-2.5 border rounded-lg h-16 resize-none" />
              <button onClick={handleSave} className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-dark">
                {editing ? 'Guardar cambios' : 'Crear producto'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3 text-sm font-medium text-gray-600">Producto</th>
              <th className="p-3 text-sm font-medium text-gray-600">Precio</th>
              <th className="p-3 text-sm font-medium text-gray-600">Stock</th>
              <th className="p-3 text-sm font-medium text-gray-600">Categoría</th>
              <th className="p-3 text-sm font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="p-3 flex items-center gap-3">
                  <img src={p.images?.[0]?.url || ''} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  <span className="font-medium text-gray-800">{p.name}</span>
                </td>
                <td className="p-3 text-sm">${Number(p.price).toLocaleString()}</td>
                <td className="p-3 text-sm">{p.stock}</td>
                <td className="p-3 text-sm">{p.category?.name}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-primary"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
