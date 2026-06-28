import { useEffect, useState } from 'react'
import { Heart, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCartStore } from '../store/cart.store'
import { useFavoriteStore } from '../store/favorite.store'
import { useAuthStore } from '../store/auth.store'
import { getProducts } from '../services/product.service'
import type { Product } from '../types'

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore((s) => s.addItem)
  const { toggleFavorite, isFavorite } = useFavoriteStore()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => toast.error('Error al cargar productos'))
      .finally(() => setLoading(false))
  }, [])

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
      await toggleFavorite(productId)
      toast.success(isFavorite(productId) ? 'Eliminado de favoritos' : 'Agregado a favoritos')
    } catch {
      toast.error('Error al actualizar favoritos')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Catálogo</h1>
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
                  <h3 className="font-semibold text-gray-800 mb-1 hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-primary">
                    ${Number(product.price).toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-400">
                    {product.stock} disponibles
                  </span>
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
    </div>
  )
}
