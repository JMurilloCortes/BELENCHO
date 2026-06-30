import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Power, PowerOff, X, Image, ArrowUp, ArrowDown } from 'lucide-react'
import { showToast, showConfirm } from '../../lib/sweetalert'
import { getHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide } from '../../services/admin.service'
import type { HeroSlide } from '../../types'

export default function AdminHeroSlides() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<HeroSlide | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [imageUrlMobile, setImageUrlMobile] = useState('')
  const [altText, setAltText] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const load = async () => {
    const s = await getHeroSlides()
    setSlides(s)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setImageUrl('')
    setImageUrlMobile('')
    setAltText('')
    setShowForm(true)
  }

  const openEdit = (s: HeroSlide) => {
    setEditing(s)
    setImageUrl(s.imageUrl)
    setImageUrlMobile(s.imageUrlMobile || '')
    setAltText(s.altText || '')
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!imageUrl.trim()) return showToast('error', 'La URL de la imagen es requerida')
    try {
      if (editing) {
        await updateHeroSlide(editing.id, { imageUrl: imageUrl.trim(), imageUrlMobile: imageUrlMobile.trim() || undefined, altText: altText.trim() || undefined })
        showToast('success', 'Slide actualizado')
      } else {
        await createHeroSlide({ imageUrl: imageUrl.trim(), imageUrlMobile: imageUrlMobile.trim() || undefined, altText: altText.trim() || undefined })
        showToast('success', 'Slide creado')
      }
      setShowForm(false)
      load()
    } catch {
      showToast('error', 'Error al guardar slide')
    }
  }

  const handleToggleActive = async (id: string) => {
    const target = slides.find((s) => s.id === id)
    if (!target) return
    const newActive = !target.active
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, active: newActive } : s)))
    showToast('success', newActive ? 'Slide activado' : 'Slide desactivado')
    try {
      await updateHeroSlide(id, { active: newActive })
    } catch {
      setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, active: !newActive } : s)))
      showToast('error', 'Error al cambiar estado')
    }
  }

  const handleDelete = async (id: string) => {
    const result = await showConfirm({ title: '¿Eliminar slide?', text: 'Esta acción no se puede deshacer', confirmText: 'Sí, eliminar' })
    if (!result.isConfirmed) return
    try {
      await deleteHeroSlide(id)
      showToast('success', 'Slide eliminado')
      load()
    } catch {
      showToast('error', 'Error al eliminar')
    }
  }

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    const idx = slides.findIndex((s) => s.id === id)
    if (idx === -1) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= slides.length) return
    const newSlides = [...slides]
    const temp = newSlides[idx].order
    newSlides[idx] = { ...newSlides[idx], order: newSlides[swapIdx].order }
    newSlides[swapIdx] = { ...newSlides[swapIdx], order: temp }
    newSlides.sort((a, b) => a.order - b.order)
    setSlides(newSlides)
    try {
      await updateHeroSlide(id, { order: slides[swapIdx].order })
      await updateHeroSlide(slides[swapIdx].id, { order: slides[idx].order })
    } catch {
      load()
      showToast('error', 'Error al reordenar')
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
          <h1 className="text-2xl font-bold text-gray-800">Hero Slides</h1>
          <p className="text-sm text-gray-400 mt-1">{slides.length} slides · {slides.filter((s) => s.active).length} activos</p>
        </div>
        <button onClick={openCreate} className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-primary/30 flex items-center gap-2 w-full sm:w-auto justify-center">
          <Plus size={18} /> Nuevo slide
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center"><Image size={20} className="text-primary" /></div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">{editing ? 'Editar' : 'Nuevo'} slide</h2>
                  <p className="text-xs text-gray-400">URL de la imagen del hero</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={18} /></button>
            </div>
            <div className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">URL imagen <span className="text-highlight">Desktop</span></label>
                <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://res.cloudinary.com/..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">URL imagen <span className="text-accent">Móvil</span> <span className="text-gray-400 font-normal">(opcional)</span></label>
                <input value={imageUrlMobile} onChange={(e) => setImageUrlMobile(e.target.value)} placeholder="https://res.cloudinary.com/..." className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Texto alternativo (opcional)</label>
                <input value={altText} onChange={(e) => setAltText(e.target.value)} placeholder="Descripción de la imagen" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              {imageUrl && (
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <img src={imageUrl} alt="Preview" className="w-full h-40 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
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

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {slides.map((s, i) => (
          <div key={s.id} className={`bg-white rounded-2xl shadow-sm border p-4 ${s.active ? 'border-gray-100' : 'border-gray-200/50 opacity-70'}`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-800 text-sm truncate">Slide {i + 1}</h3>
                  {!s.active && <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">Inactivo</span>}
                </div>
                {s.altText && <p className="text-xs text-gray-400 mt-0.5 truncate">{s.altText}</p>}
              </div>
              <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full shrink-0">#{s.order}</span>
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-100 mb-3">
              <img src={s.imageUrl} alt={s.altText || ''} className="w-full h-32 object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x200/e2e8f0/94a3b8?text=Error' }} />
            </div>
            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <button onClick={() => openEdit(s)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border border-primary/20 bg-primary/5 text-primary hover:text-white hover:bg-primary hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-200">
                <Edit2 size={16} /> Editar
              </button>
              <button onClick={() => handleToggleActive(s.id)} className={`flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-sm font-medium border transition-all duration-200 ${
                s.active
                  ? 'border-orange-200 bg-orange-50 text-orange-600 hover:text-white hover:bg-orange-500 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/20'
                  : 'border-green-200 bg-green-50 text-green-600 hover:text-white hover:bg-green-500 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20'
              }`}>
                {s.active ? <PowerOff size={16} /> : <Power size={16} />}
              </button>
              <button onClick={() => handleDelete(s.id)} className="flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-medium border border-red-200 bg-red-50 text-red-500 hover:text-white hover:bg-red-500 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-200">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {slides.length === 0 && (
          <div className="text-center py-16">
            <Image size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">No hay slides aún. ¡Crea el primero!</p>
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left p-3 lg:p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">#</th>
              <th className="text-left p-3 lg:p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Desktop</th>
              <th className="text-left p-3 lg:p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Móvil</th>
              <th className="text-left p-3 lg:p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Texto</th>
              <th className="text-left p-3 lg:p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Orden</th>
              <th className="text-left p-3 lg:p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
              <th className="text-right p-3 lg:p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {slides.map((s, i) => (
              <tr key={s.id} className={`hover:bg-gray-50/50 transition-colors ${!s.active ? 'opacity-60' : ''}`}>
                <td className="p-3 lg:p-4 text-sm text-gray-400">{i + 1}</td>
                <td className="p-3 lg:p-4">
                  <div className="w-24 h-14 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
                    <img src={s.imageUrl} alt={s.altText || ''} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x120/e2e8f0/94a3b8?text=Error' }} />
                  </div>
                </td>
                <td className="p-3 lg:p-4">
                  {s.imageUrlMobile ? (
                    <div className="w-16 h-14 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
                      <img src={s.imageUrlMobile} alt={s.altText || ''} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x120/e2e8f0/94a3b8?text=Error' }} />
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
                <td className="p-3 lg:p-4 text-sm text-gray-600 max-w-[200px] truncate">{s.altText || '-'}</td>
                <td className="p-3 lg:p-4">
                  <div className="flex items-center gap-1">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{s.order}</span>
                    <button onClick={() => handleMove(s.id, 'up')} disabled={i === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"><ArrowUp size={14} /></button>
                    <button onClick={() => handleMove(s.id, 'down')} disabled={i === slides.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"><ArrowDown size={14} /></button>
                  </div>
                </td>
                <td className="p-3 lg:p-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {s.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="p-3 lg:p-4">
                  <div className="flex gap-1.5 justify-end">
                    <button onClick={() => openEdit(s)} className="p-2 rounded-xl border border-primary/20 bg-primary/5 text-primary hover:text-white hover:bg-primary hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-200" title="Editar"><Edit2 size={15} /></button>
                    <button onClick={() => handleToggleActive(s.id)} className={`p-2 rounded-xl border transition-all duration-200 ${
                      s.active
                        ? 'border-orange-200 bg-orange-50 text-orange-600 hover:text-white hover:bg-orange-500 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/20'
                        : 'border-green-200 bg-green-50 text-green-600 hover:text-white hover:bg-green-500 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20'
                    }`} title={s.active ? 'Desactivar' : 'Activar'}>
                      {s.active ? <PowerOff size={15} /> : <Power size={15} />}
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="p-2 rounded-xl border border-red-200 bg-red-50 text-red-500 hover:text-white hover:bg-red-500 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-200" title="Eliminar"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {slides.length === 0 && (
          <div className="text-center py-16">
            <Image size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">No hay slides aún. ¡Crea el primero!</p>
          </div>
        )}
      </div>
    </div>
  )
}
