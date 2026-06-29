import { useEffect, useState, useCallback } from 'react'
import { Heart, ShoppingCart, Search, X, SlidersHorizontal, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { showToast } from '../lib/sweetalert'
import { useCartStore } from '../store/cart.store'
import { useFavoriteStore } from '../store/favorite.store'
import { useAuthStore } from '../store/auth.store'
import { getProducts, getCategories } from '../services/product.service'
import type { Product, Category } from '../types'
import SkeletonCard from '../components/SkeletonCard'

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
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
      showToast('error', 'Error al cargar productos')
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

  const handleAddToCart = (productId: string) => {
    if (!isAuthenticated) { window.location.href = '/login'; return }
    const product = products.find((p) => p.id === productId)
    showToast('success', 'Agregado al carrito')
    addItem(productId, 1, product).catch(() => {
      showToast('error', 'Error al agregar al carrito')
    })
  }

  const handleToggleFavorite = (productId: string) => {
    if (!isAuthenticated) { window.location.href = '/login'; return }
    const wasFavorite = isFavorite(productId)
    const product = products.find((p) => p.id === productId)
    showToast('success', wasFavorite ? 'Eliminado de favoritos' : 'Agregado a favoritos')
    toggleFavorite(productId, product).catch(() => {
      showToast('error', 'Error al actualizar favoritos')
    })
  }

  const clearFilters = () => {
    setSearch('')
    setCategoryId('')
    setMinPrice('')
    setMaxPrice('')
  }

  const hasFilters = search || categoryId || minPrice || maxPrice

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Top bar */}
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20">
              <Sparkles size={17} />
            </div>
            <span className="font-bold text-gray-800 text-lg">Catálogo</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="inline-flex items-center gap-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-xl px-3.5 py-2 hover:border-primary/30 hover:text-primary transition-all duration-300"
            >
              <SlidersHorizontal size={14} />
              Filtros
              {hasFilters && (
                <span className="w-2 h-2 rounded-full bg-accent" />
              )}
            </button>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Sparkles size={12} />
              {loading ? '...' : `${products.length} producto${products.length !== 1 ? 's' : ''}`}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Filters panel */}
        <div
          className={`transition-all duration-400 ease-in-out overflow-hidden ${
            filtersOpen ? 'max-h-96 opacity-100 mb-8' : 'max-h-0 opacity-0 mb-0'
          }`}
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden p-5 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative sm:col-span-2">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar productos..."
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-gray-50"
                />
              </div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="p-2.5 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-gray-50"
              >
                <option value="">Todas las categorías</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="flex gap-3">
                <input
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Precio mín."
                  type="number"
                  className="w-full p-2.5 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-gray-50"
                />
                <input
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Precio máx."
                  type="number"
                  className="w-full p-2.5 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-gray-50"
                />
              </div>
            </div>
            {hasFilters && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors px-2 py-1"
                >
                  <X size={15} /> Limpiar filtros
                </button>
                <span className="text-xs text-gray-400">
                  {products.length} resultado{products.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <Search size={40} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No se encontraron productos</h2>
              <p className="text-gray-400 text-sm mb-8">Intenta con otros filtros o términos de búsqueda</p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <Sparkles size={16} />
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => {
              const fav = isFavorite(product.id)
              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg shadow-gray-200/50 hover:shadow-2xl hover:shadow-gray-200/60 transition-all duration-500 hover:-translate-y-2 border border-gray-100 hover:border-transparent"
                >
                {/* Image */}
                <Link to={`/producto/${product.id}`} className="block relative aspect-[4/5] overflow-hidden">
                  <img
                    src={product.images?.[0]?.url || 'https://placehold.co/400x500/e2e8f0/94a3b8?text=No'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Category badge */}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm z-10">
                    {product.category?.name}
                  </span>
                  {/* Favorite button */}
                  <button
                    onClick={(e) => { e.preventDefault(); handleToggleFavorite(product.id) }}
                    className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-300 ${
                      fav
                        ? 'bg-accent text-white shadow-lg shadow-accent/30'
                        : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:bg-accent hover:text-white hover:shadow-lg hover:shadow-accent/30'
                    }`}
                  >
                    <Heart size={16} fill={fav ? 'currentColor' : 'none'} />
                  </button>
                  {/* Stock badges */}
                  {product.stock <= 3 && product.stock > 0 && (
                    <span className="absolute bottom-3 left-3 bg-accent text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-lg shadow-accent/30 z-10">
                      Últimas {product.stock}
                    </span>
                  )}
                  {product.stock === 0 && (
                    <span className="absolute bottom-3 left-3 bg-gray-900/90 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm z-10">
                      Agotado
                    </span>
                  )}
                </Link>

                {/* Info */}
                <div className="p-3 sm:p-5">
                  <Link to={`/producto/${product.id}`}>
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  {product.description && (
                    <p className="text-xs sm:text-sm text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3 sm:mt-4">
                    <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      ${Number(product.price).toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={product.stock === 0}
                      className={`p-2.5 rounded-xl transition-all duration-300 ${
                        product.stock === 0
                          ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                          : 'bg-primary/10 text-primary hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/20'
                      }`}
                    >
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      </div>
    </div>
  )
}
