import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, ArrowLeft, Shield } from 'lucide-react'
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-accent/10 to-accent/10 flex items-center justify-center">
            <Heart size={40} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Inicia sesión</h1>
          <p className="text-gray-400 text-sm mb-8">Accede a tu cuenta para ver tus favoritos</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-accent/20">
                <Heart size={17} />
              </div>
              <span className="font-bold text-gray-800 text-lg">Favoritos</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-accent/10 to-accent/10 flex items-center justify-center">
            <Heart size={40} className="text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No tienes favoritos</h2>
          <p className="text-gray-400 text-sm mb-8">Guarda productos que te gusten y aparecerán aquí</p>
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Explorar catálogo
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Top bar */}
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-accent/20">
              <Heart size={17} />
            </div>
            <span className="font-bold text-gray-800 text-lg">Favoritos</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/catalogo" className="text-xs text-gray-400 hover:text-primary transition-colors hidden sm:flex items-center gap-1">
              <ArrowLeft size={14} /> Seguir comprando
            </Link>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Shield size={12} />
              {items.length} producto{items.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {items.map((product) => (
            <div
              key={product.id}
              className="group relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-highlight opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />
              <Link to={`/producto/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-50">
                <img
                  src={product.images?.[0]?.url || 'https://placehold.co/400x500/e2e8f0/94a3b8?text=No'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
                  className="absolute top-3 right-3 z-10 p-2.5 rounded-full bg-accent text-white shadow-lg shadow-accent/30 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-accent/40"
                >
                  <Heart size={15} fill="currentColor" />
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
    </div>
  )
}
