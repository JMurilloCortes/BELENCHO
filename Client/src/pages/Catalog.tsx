import { useEffect, useState, useCallback } from 'react'
import { Heart, ShoppingCart, Search, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCartStore } from '../store/cart.store'
import { useFavoriteStore } from '../store/favorite.store'
import { useAuthStore } from '../store/auth.store'
import { getProducts, getCategories } from '../services/product.service'
import type { Product, Category } from '../types'

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const addItem = useCartStore((s) => s.addItem)
  const { toggleFavorite, isFavorite, loadFavorites } = useFavoriteStore()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (search) params.search = search
      if (categoryId) params.categoryId = categoryId
      if (minPrice) params.minPrice = minPrice
      if (maxPrice) params.maxPrice = maxPrice
      const [p, c] = await Promise.all([getProducts(params), getCategories()])
      setProducts(p)
      setCategories(c)
    } catch {
      toast.error('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }, [search, categoryId, minPrice, maxPrice])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    if (isAuthenticated) loadFavorites()
  }, [isAuthenticated])

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) { window.location.href = '/login'; return }
    try {
      await addItem(productId)
      toast.success('Agregado al carrito')
    } catch {
      toast.error('Error al agregar al carrito')
    }
  }

  const handleToggleFavorite = async (productId: string) => {
    if (!isAuthenticated) { window.location.href = '/login'; return }
    try {
      const wasFavorite = isFavorite(productId)
      await toggleFavorite(productId)
      toast.success(wasFavorite ? 'Eliminado de favoritos' : 'Agregado a favoritos')
    } catch {
      toast.error('Error al actualizar favoritos')
    }
  }

  const clearFilters = () => {
    setSearch('')
    setCategoryId('')
    setMinPrice('')
    setMaxPrice('')
  }

  const hasFilters = search || categoryId || minPrice || maxPrice

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Catálogo</h1>

      <div className="bg-white rounded-xl shadow-sm border p-4 mb-8 space-y-3">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="p-2.5 border rounded-lg text-sm min-w-[180px]"
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Precio mín."
            type="number"
            className="p-2.5 border rounded-lg text-sm w-32"
          />
          <input
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Precio máx."
            type="number"
            className="p-2.5 border rounded-lg text-sm w-32"
          />
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 px-2">
              <X size={16} /> Limpiar
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No se encontraron productos</p>
          {hasFilters && (
            <button onClick={clearFilters} className="text-primary hover:underline mt-2 text-sm">Limpiar filtros</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const fav = isFavorite(product.id)
            return (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                <Link to={`/producto/${product.id}`} className="block relative">
                  <img
                    src={product.images?.[0]?.url || 'https://placehold.co/400x400/e2e8f0/94a3b8?text=No'}
                    alt={product.name}
                    className="w-full aspect-square object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-primary text-white text-xs font-medium px-2.5 py-1 rounded-full">
                    {product.category?.name}
                  </span>
                </Link>
                <div className="p-4">
                  <Link to={`/producto/${product.id}`}>
                    <h3 className="font-semibold text-gray-800 mb-1 hover:text-primary transition-colors">{product.name}</h3>
                  </Link>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-primary">${Number(product.price).toLocaleString()}</span>
                    <span className="text-xs text-gray-400">{product.stock} disponibles</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ShoppingCart size={16} />
                      Agregar
                    </button>
                    <button
                      onClick={() => handleToggleFavorite(product.id)}
                      className={`p-2 border rounded-lg transition-colors ${
                        fav
                          ? 'border-accent text-accent'
                          : 'border-gray-200 text-gray-400 hover:text-accent hover:border-accent'
                      }`}
                    >
                      <Heart size={20} fill={fav ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
