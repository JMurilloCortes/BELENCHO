import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, ArrowLeft } from 'lucide-react'
import { useFavoriteStore } from '../store/favorite.store'
import { useCartStore } from '../store/cart.store'
import { useAuthStore } from '../store/auth.store'
import { showToast } from '../lib/sweetalert'

export default function FavoritesPage() {
  const { items, loading, loadFavorites, toggleFavorite } = useFavoriteStore()
  const addItem = useCartStore((s) => s.addItem)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (isAuthenticated) loadFavorites()
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Heart size={32} className="text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Inicia sesión para ver tus favoritos</h2>
        <p className="text-gray-400 text-sm mb-6">Guarda tus productos favoritos y vuelve a ellos cuando quieras</p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <div className="relative w-12 h-12 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-gray-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
        </div>
        <p className="text-sm text-gray-400">Cargando favoritos...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Heart size={32} className="text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No tienes favoritos</h2>
        <p className="text-gray-400 text-sm mb-6">Guarda productos que te gusten y aparecerán aquí</p>
        <Link
          to="/catalogo"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          Explorar catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Mis favoritos</h1>
          <p className="text-sm text-gray-400 mt-1">{items.length} producto{items.length !== 1 ? 's' : ''} guardado{items.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          to="/catalogo"
          className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Seguir comprando
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {items.map((product) => (
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
              <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
                {product.category?.name}
              </span>
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {/* Quick actions overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    if (!isAuthenticated) { window.location.href = '/login'; return }
                    addItem(product.id).then(() => showToast('success', 'Agregado al carrito')).catch(() => showToast('error', 'Error'))
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold border border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 flex items-center gap-1.5"
                >
                  <ShoppingCart size={14} />
                  Agregar
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); toggleFavorite(product.id) }}
                  className="p-2.5 rounded-xl border-2 border-accent bg-accent text-white shadow-lg shadow-accent/30 transition-all duration-300"
                >
                  <Heart size={18} fill="currentColor" />
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
        ))}
      </div>

      <div className="text-center mt-10 sm:hidden">
        <Link
          to="/catalogo"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Seguir comprando
        </Link>
      </div>
    </div>
  )
}
