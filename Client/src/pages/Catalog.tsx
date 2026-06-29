import { useEffect, useState, useCallback } from 'react'
import { Heart, ShoppingCart, Search, X, SlidersHorizontal, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { showToast } from '../lib/sweetalert'
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

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) { window.location.href = '/login'; return }
    try {
      await addItem(productId)
      showToast('success', 'Agregado al carrito')
    } catch {
      showToast('error', 'Error al agregar al carrito')
    }
  }

  const handleToggleFavorite = async (productId: string) => {
    if (!isAuthenticated) { window.location.href = '/login'; return }
    try {
      const wasFavorite = isFavorite(productId)
      await toggleFavorite(productId)
      showToast('success', wasFavorite ? 'Eliminado de favoritos' : 'Agregado a favoritos')
    } catch {
      showToast('error', 'Error al actualizar favoritos')
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
            Catálogo
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {loading ? 'Cargando...' : `${products.length} productos encontrados`}
          </p>
        </div>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl px-4 py-2.5 hover:border-primary/30 hover:text-primary transition-all duration-300 self-start sm:self-auto"
        >
          <SlidersHorizontal size={16} />
          Filtros
          {hasFilters && (
            <span className="w-2 h-2 rounded-full bg-accent" />
          )}
        </button>
      </div>

      {/* Filters panel */}
      <div
        className={`transition-all duration-400 ease-in-out overflow-hidden ${
          filtersOpen ? 'max-h-80 opacity-100 mb-8' : 'max-h-0 opacity-0 mb-0'
        }`}
      >
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative sm:col-span-2">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
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
                className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <input
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Precio máx."
                type="number"
                className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-4 border-gray-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm text-gray-400">Cargando productos...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-32">
          <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Search size={32} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No se encontraron productos</h3>
          <p className="text-gray-400 text-sm mb-6">Intenta con otros filtros o términos de búsqueda</p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Sparkles size={16} />
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => {
            const fav = isFavorite(product.id)
            return (
              <div
                key={product.id}
                className="group relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 hover:border-transparent"
              >
                {/* Image */}
                <Link to={`/producto/${product.id}`} className="block relative aspect-square overflow-hidden">
                  <img
                    src={product.images?.[0]?.url || 'https://placehold.co/400x400/e2e8f0/94a3b8?text=No'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Category badge */}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                    {product.category?.name}
                  </span>
                  {/* Stock badges */}
                  {product.stock <= 3 && product.stock > 0 && (
                    <span className="absolute top-3 right-3 bg-accent text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-lg shadow-accent/30">
                      Últimas {product.stock}
                    </span>
                  )}
                  {product.stock === 0 && (
                    <span className="absolute top-3 right-3 bg-gray-900/90 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                      Agotado
                    </span>
                  )}
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {/* Quick action overlay */}
                  <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                    <button
                      onClick={(e) => { e.preventDefault(); handleAddToCart(product.id) }}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold border border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 flex items-center gap-1.5"
                    >
                      <ShoppingCart size={14} />
                      Agregar
                    </button>
                    <button
                      onClick={(e) => { e.preventDefault(); handleToggleFavorite(product.id) }}
                      className={`p-2.5 rounded-xl border-2 transition-all duration-300 ${
                        fav
                          ? 'border-accent bg-accent text-white shadow-lg shadow-accent/30'
                          : 'border-accent/20 bg-accent/5 text-accent hover:bg-accent hover:text-white hover:border-accent hover:shadow-lg hover:shadow-accent/20'
                      }`}
                    >
                      <Heart size={18} fill={fav ? 'currentColor' : 'none'} />
                    </button>
                  </div>
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
                    <span className={`text-[10px] sm:text-xs font-medium ${product.stock > 5 ? 'text-green-600' : 'text-orange-500'}`}>
                      {product.stock > 0 ? `${product.stock} uds` : ''}
                    </span>
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
