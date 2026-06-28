import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, Heart, Star, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { getProduct } from '../services/product.service'
import { useCartStore } from '../store/cart.store'
import { useFavoriteStore } from '../store/favorite.store'
import { useAuthStore } from '../store/auth.store'
import type { Product } from '../types'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [currentImage, setCurrentImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore((s) => s.addItem)
  const { toggleFavorite, isFavorite } = useFavoriteStore()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (!id) return
    getProduct(id)
      .then(setProduct)
      .catch(() => toast.error('Error al cargar el producto'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    if (!isAuthenticated) { window.location.href = '/login'; return }
    if (!product) return
    try {
      await addItem(product.id)
      toast.success('Agregado al carrito')
    } catch {
      toast.error('Error al agregar al carrito')
    }
  }

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) { window.location.href = '/login'; return }
    if (!product) return
    try {
      await toggleFavorite(product.id)
      toast.success(isFavorite(product.id) ? 'Eliminado de favoritos' : 'Agregado a favoritos')
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

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Producto no encontrado</h2>
        <Link to="/catalogo" className="text-primary font-medium hover:underline">Volver al catálogo</Link>
      </div>
    )
  }

  const images = product.images?.length ? product.images : [{ id: '0', url: 'https://placehold.co/600x600/e2e8f0/94a3b8?text=Sin+imagen', alt: 'Sin imagen', order: 0 }]
  const avgRating = product.reviews?.length
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : 0
  const fav = isFavorite(product.id)

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Link to="/catalogo" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-primary mb-8 transition-colors">
        <ArrowLeft size={18} />
        Volver al catálogo
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <div className="relative rounded-2xl overflow-hidden bg-gray-50 mb-4">
            <img
              src={images[currentImage]?.url}
              alt={product.name}
              className="w-full aspect-square object-cover"
            />
            <span className="absolute top-4 left-4 bg-primary text-white text-sm font-medium px-3 py-1.5 rounded-full">
              {product.category?.name}
            </span>
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImage((i) => (i === 0 ? images.length - 1 : i - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setCurrentImage((i) => (i === images.length - 1 ? 0 : i + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
          <div className="flex gap-3">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setCurrentImage(i)}
                className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                  i === currentImage ? 'border-primary' : 'border-transparent'
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-yellow-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={20}
                  fill={star <= Math.round(avgRating) ? 'currentColor' : 'none'}
                  className={star <= Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">({product.reviews?.length || 0} reseñas)</span>
          </div>
          <p className="text-4xl font-bold text-primary mb-6">
            ${Number(product.price).toLocaleString()}
          </p>
          <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>
          <div className="flex items-center gap-4 mb-8">
            <span className="text-sm text-gray-500">Stock:</span>
            <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} />
              Agregar al carrito
            </button>
            <button
              onClick={handleToggleFavorite}
              className={`p-3 border-2 rounded-lg transition-colors ${
                fav
                  ? 'border-accent text-accent'
                  : 'border-gray-200 text-gray-400 hover:text-accent hover:border-accent'
              }`}
            >
              <Heart size={24} fill={fav ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Reseñas</h2>
            {(!product.reviews || product.reviews.length === 0) ? (
              <p className="text-gray-400 text-sm">No hay reseñas aún</p>
            ) : (
              <div className="space-y-4">
                {product.reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">{review.user?.name || 'Usuario'}</span>
                      <span className="text-sm text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex text-yellow-400 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          fill={star <= review.rating ? 'currentColor' : 'none'}
                          className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm">{review.comment || 'Sin comentario'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
