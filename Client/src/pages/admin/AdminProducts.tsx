import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Power, PowerOff, Search, Package, X } from 'lucide-react'
import { showToast, showConfirm } from '../../lib/sweetalert'
import { getAdminProducts, createProduct, updateProduct, deleteProduct, toggleProductActive, getCategories } from '../../services/admin.service'
import type { Product, Category } from '../../types'

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', categoryId: '', images: '' })

  const load = async () => {
    const [p, c] = await Promise.all([getAdminProducts(), getCategories()])
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
      images: '',
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.price || !form.categoryId) {
      showToast('error', 'Nombre, precio y categoría son requeridos')
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
        showToast('success', 'Producto actualizado')
      } else {
        await createProduct(data)
        showToast('success', 'Producto creado')
      }
      setShowForm(false)
      load()
    } catch {
      showToast('error', 'Error al guardar producto')
    }
  }

  const handleToggleActive = async (id: string) => {
    const target = products.find((p) => p.id === id)
    const currentlyActive = (target as any)?.active !== false
    const newActive = !currentlyActive
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active: newActive } : p)))
    showToast('success', newActive ? 'Producto activado' : 'Producto desactivado')
    try {
      await toggleProductActive(id)
    } catch {
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active: currentlyActive } : p)))
      showToast('error', 'Error al cambiar estado')
    }
  }

  const handleDelete = async (id: string) => {
    const result = await showConfirm({ title: '¿Eliminar producto?', text: 'Esta acción no se puede deshacer', confirmText: 'Sí, eliminar' })
    if (!result.isConfirmed) return
    try {
      await deleteProduct(id)
      showToast('success', 'Producto eliminado')
      load()
    } catch {
      showToast('error', 'Error al eliminar')
    }
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p as any).category?.name?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  )

  const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
          <p className="text-sm text-gray-400 mt-1">{products.length} productos · {products.filter((p) => (p as any).active !== false).length} activos</p>
        </div>
        <button onClick={openCreate} className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-primary/30 flex items-center gap-2 w-full sm:w-auto justify-center">
          <Plus size={18} /> Nuevo producto
        </button>
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar productos..." className={`${inputClass} pl-11`} />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center"><Package size={20} className="text-primary" /></div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{editing ? 'Editar' : 'Nuevo'} producto</h2>
                  <p className="text-xs text-gray-400">Completa los campos del producto</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={18} /></button>
            </div>
            <div className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Nombre</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre del producto" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Descripción</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descripción" className={`${inputClass} h-24 resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Precio</label>
                  <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} type="number" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Stock</label>
                  <input value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} type="number" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Categoría</label>
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={inputClass}>
                  <option value="">Seleccionar</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {!editing && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">URLs de imágenes (una por línea)</label>
                  <textarea value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} placeholder="https://..." className={`${inputClass} h-20 resize-none`} />
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-end p-5 sm:p-6 border-t border-gray-100">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancelar</button>
              <button onClick={handleSave} className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* --- Mobile card list --- */}
      <div className="sm:hidden space-y-3">
        {filtered.map((p) => {
          const isActive = (p as any).active !== false
          return (
            <div key={p.id} className={`bg-white rounded-2xl shadow-sm border p-4 ${isActive ? 'border-gray-100' : 'border-gray-200/50 opacity-70'}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm leading-snug">{p.name}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-base font-bold text-primary">${Number(p.price).toLocaleString()}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      p.stock > 5 ? 'bg-green-50 text-green-600' : p.stock > 0 ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {p.stock} uds
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {isActive ? 'Activo' : 'Inactivo'}
                  </span>
                  <span className="text-xs text-gray-400">{(p as any).category?.name || '-'}</span>
                </div>
              </div>
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border border-primary/20 bg-primary/5 text-primary hover:text-white hover:bg-primary hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-200">
                  <Edit2 size={16} /> Editar
                </button>
                <button onClick={() => handleToggleActive(p.id)} className={`flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-sm font-medium border transition-all duration-200 ${
                  isActive
                    ? 'border-orange-200 bg-orange-50 text-orange-600 hover:text-white hover:bg-orange-500 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/20'
                    : 'border-green-200 bg-green-50 text-green-600 hover:text-white hover:bg-green-500 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20'
                }`}>
                  {isActive ? <PowerOff size={16} /> : <Power size={16} />}
                </button>
                <button onClick={() => handleDelete(p.id)} className="flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-medium border border-red-200 bg-red-50 text-red-500 hover:text-white hover:bg-red-500 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-200">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Package size={48} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">No se encontraron productos</p>
          </div>
        )}
      </div>

      {/* --- Desktop table --- */}
      <div className="hidden sm:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left p-3 lg:p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Producto</th>
              <th className="text-left p-3 lg:p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Precio</th>
              <th className="text-center p-3 lg:p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Stock</th>
              <th className="text-left p-3 lg:p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Categoría</th>
              <th className="text-center p-3 lg:p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
              <th className="text-right p-3 lg:p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((p) => {
              const isActive = (p as any).active !== false
              return (
                <tr key={p.id} className={`hover:bg-gray-50/50 transition-colors ${!isActive ? 'opacity-60' : ''}`}>
                  <td className="p-3 lg:p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shrink-0">
                        <Package size={16} className="text-primary" />
                      </div>
                      <span className="text-sm font-medium text-gray-800">{p.name}</span>
                      {!isActive && <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full shrink-0">Inactivo</span>}
                    </div>
                  </td>
                  <td className="p-3 lg:p-4 text-sm font-semibold text-gray-800">${Number(p.price).toLocaleString()}</td>
                  <td className="p-3 lg:p-4 text-center">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      p.stock > 5 ? 'bg-green-50 text-green-600' : p.stock > 0 ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {p.stock} uds
                    </span>
                  </td>
                  <td className="p-3 lg:p-4 text-sm text-gray-500">{(p as any).category?.name || '-'}</td>
                  <td className="p-3 lg:p-4 text-center">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="p-3 lg:p-4">
                    <div className="flex gap-1.5 justify-end">
                      <button onClick={() => openEdit(p)} className="p-2 rounded-xl border border-primary/20 bg-primary/5 text-primary hover:text-white hover:bg-primary hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-200" title="Editar"><Edit2 size={15} /></button>
                      <button onClick={() => handleToggleActive(p.id)} className={`p-2 rounded-xl border transition-all duration-200 ${
                        isActive
                          ? 'border-orange-200 bg-orange-50 text-orange-600 hover:text-white hover:bg-orange-500 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/20'
                          : 'border-green-200 bg-green-50 text-green-600 hover:text-white hover:bg-green-500 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20'
                      }`} title={isActive ? 'Desactivar' : 'Activar'}>
                        {isActive ? <PowerOff size={15} /> : <Power size={15} />}
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 rounded-xl border border-red-200 bg-red-50 text-red-500 hover:text-white hover:bg-red-500 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-200" title="Eliminar"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Package size={48} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">No se encontraron productos</p>
          </div>
        )}
      </div>
    </div>
  )
}
