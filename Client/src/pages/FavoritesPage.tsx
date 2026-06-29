import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, ArrowLeft } from 'lucide-react'
import { useFavoriteStore } from '../store/favorite.store'
import { useCartStore } from '../store/cart.store'
import { useAuthStore } from '../store/auth.store'
import { showToast } from '../lib/sweetalert'
import SkeletonCard from '../components/SkeletonCard'

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
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="h-8 bg-gray-100 rounded-xl w-48 mb-2" />
          <div className="h-4 bg-gray-100 rounded-lg w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {items.map((product) => (
          <div
            key={product.id}
            className="group relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 hover:border-transparent"
          >
            {/* Image */}
            <Link to={`/producto/${product.id}`} className="block relative aspect-[4/5] overflow-hidden">
              <img
                src={product.images?.[0]?.url || 'https://placehold.co/400x500/e2e8f0/94a3b8?text=No'}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm z-10">
                {product.category?.name}
              </span>
              {/* Favorite button */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  showToast('success', 'Eliminado de favoritos')
                  toggleFavorite(product.id, product).catch(() => {
                    showToast('error', 'Error al actualizar favoritos')
                  })
                }}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-accent text-white shadow-lg shadow-accent/30 transition-all duration-300 hover:scale-110"
              >
                <Heart size={16} fill="currentColor" />
              </button>
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
              <div className="flex items-center justify-between mt-3 sm:mt-4">
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  ${Number(product.price).toLocaleString()}
                </span>
                <button
                  onClick={() => {
                    if (!isAuthenticated) { window.location.href = '/login'; return }
                    showToast('success', 'Agregado al carrito')
                    addItem(product.id, 1, product).catch(() => showToast('error', 'Error'))
                  }}
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
