import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import { useFavoriteStore } from '../store/favorite.store'
import { useCartStore } from '../store/cart.store'
import { useAuthStore } from '../store/auth.store'

export default function FavoritesPage() {
  const { items, loading, loadFavorites, toggleFavorite } = useFavoriteStore()
  const addItem = useCartStore((s) => s.addItem)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (isAuthenticated) loadFavorites()
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Heart size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Inicia sesión para ver tus favoritos</h2>
        <Link to="/login" className="text-primary font-medium hover:underline">Ir a iniciar sesión</Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Heart size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No tienes favoritos</h2>
        <p className="text-gray-500 mb-4">Guarda productos que te gusten</p>
        <Link to="/catalogo" className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-dark transition-colors">
          Explorar catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Mis favoritos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
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
              <p className="text-lg font-bold text-primary mb-3">${Number(product.price).toLocaleString()}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => addItem(product.id)}
                  className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShoppingCart size={16} />
                  Agregar
                </button>
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className="p-2 border border-accent rounded-lg text-accent transition-colors"
                >
                  <Heart size={20} fill="currentColor" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
