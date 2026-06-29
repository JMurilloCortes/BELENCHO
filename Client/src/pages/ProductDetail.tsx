import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, Star, ChevronLeft, ChevronRight, ArrowLeft, Send, Check, BadgeCheck, Shield, Award, Share2, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { getProduct } from '../services/product.service'
import { createReview } from '../services/review.service'
import { useCartStore } from '../store/cart.store'
import { useFavoriteStore } from '../store/favorite.store'
import { useAuthStore } from '../store/auth.store'
import type { Product } from '../types'

const features = [
  { icon: BadgeCheck, text: 'Entregas cumplidas' },
  { icon: Shield, text: 'Pago seguro' },
  { icon: Award, text: 'Calidad premium' },
]

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [currentImage, setCurrentImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [addedToCart, setAddedToCart] = useState(false)
  const addItem = useCartStore((s) => s.addItem)
  const { toggleFavorite, isFavorite } = useFavoriteStore()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const navigate = useNavigate()

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
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2000)
      toast.success('Agregado al carrito')
    } catch {
      toast.error('Error al agregar al carrito')
    }
  }

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) { window.location.href = '/login'; return }
    if (!product) return
    try {
      const wasFavorite = isFavorite(product.id)
      await toggleFavorite(product.id)
      toast.success(wasFavorite ? 'Eliminado de favoritos' : 'Agregado a favoritos')
    } catch {
      toast.error('Error al actualizar favoritos')
    }
  }

  const handleBuyNow = async () => {
    if (!isAuthenticated) { window.location.href = '/login'; return }
    if (!product) return
    try {
      await addItem(product.id)
      navigate('/checkout')
    } catch {
      toast.error('Error al procesar la compra')
    }
  }

  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const handleSubmitReview = async () => {
    if (!isAuthenticated) { window.location.href = '/login'; return }
    if (!product || reviewRating === 0) return
    setSubmittingReview(true)
    try {
      await createReview(product.id, reviewRating, reviewComment || undefined)
      toast.success('Reseña publicada')
      setReviewRating(0)
      setReviewComment('')
      const updated = await getProduct(product.id)
      setProduct(updated)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al publicar reseña')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-gray-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-t-primary border-r-accent border-b-transparent border-l-transparent rounded-full animate-spin" />
          </div>
          <p className="text-gray-400 text-sm">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <ShoppingCart size={40} className="text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Producto no encontrado</h2>
          <p className="text-gray-400 text-sm mb-8">El producto que buscas no existe o ha sido eliminado</p>
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <ArrowLeft size={16} />
            Volver al catálogo
          </Link>
        </div>
      </div>
    )
  }

  const images = product.images?.length ? product.images : [{ id: '0', url: 'https://placehold.co/600x600/e2e8f0/94a3b8?text=Sin+imagen', alt: 'Sin imagen', order: 0 }]
  const avgRating = product.reviews?.length
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : 0
  const fav = isFavorite(product.id)

  return (
    <div className="min-h-screen">
      {/* Back link */}
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <Link
          to="/catalogo"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-primary transition-colors group"
        >
          <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
            <ArrowLeft size={16} />
          </div>
          Volver al catálogo
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* ===== LEFT: Image Gallery ===== */}
          <div>
            {/* Main image */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100/50 group">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,_transparent_0%,_rgba(0,0,0,0.02)_100%)]" />
              <img
                src={images[currentImage]?.url}
                alt={product.name}
                className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Category badge */}
              <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                {product.category?.name}
              </span>
              {/* Stock badge */}
              {product.stock <= 3 && product.stock > 0 && (
                <span className="absolute top-4 right-4 bg-accent text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg shadow-accent/30">
                  Últimas {product.stock}
                </span>
              )}
              {product.stock === 0 && (
                <span className="absolute top-4 right-4 bg-gray-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
                  Agotado
                </span>
              )}
              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage((i) => (i === 0 ? images.length - 1 : i - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm hover:bg-white rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
                  >
                    <ChevronLeft size={18} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => setCurrentImage((i) => (i === images.length - 1 ? 0 : i + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm hover:bg-white rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0"
                  >
                    <ChevronRight size={18} className="text-gray-600" />
                  </button>
                </>
              )}
              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-3 py-1 rounded-full">
                  {currentImage + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 mt-4">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImage(i)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      i === currentImage
                        ? 'border-primary ring-2 ring-primary/20 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ===== RIGHT: Product Info ===== */}
          <div className="flex flex-col">
            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    fill={star <= Math.round(avgRating) ? 'currentColor' : 'none'}
                    className={star <= Math.round(avgRating) ? 'text-highlight' : 'text-gray-200'}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-400">
                {avgRating > 0 ? avgRating.toFixed(1) : '—'} ({product.reviews?.length || 0} reseñas)
              </span>
            </div>

            {/* Name */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 leading-tight mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ${Number(product.price).toLocaleString()}
              </span>
              {product.stock > 0 && (
                <span className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                  <Check size={12} className="inline mr-1" />
                  En stock
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-500 leading-relaxed mb-8 text-base sm:text-lg">
              {product.description}
            </p>

            {/* Stock info */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 flex items-center justify-between">
              <span className="text-sm text-gray-500">Disponibilidad</span>
              <span className={`text-sm font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock > 0
                  ? `${product.stock} unidad${product.stock !== 1 ? 'es' : ''} disponible${product.stock !== 1 ? 's' : ''}`
                  : 'Agotado'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 active:scale-95 bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Zap size={18} />
                Comprar ahora
              </button>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`p-3.5 rounded-xl border-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
                  addedToCart
                    ? 'border-green-200 bg-green-50 text-green-600 hover:bg-green-500 hover:text-white hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20'
                    : 'border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:shadow-primary/20'
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                title="Agregar al carrito"
              >
                {addedToCart ? <Check size={22} /> : <ShoppingCart size={22} />}
              </button>
              <button
                onClick={handleToggleFavorite}
                className={`p-3.5 rounded-xl border-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
                  fav
                    ? 'border-accent bg-accent text-white shadow-lg shadow-accent/30'
                    : 'border-accent/20 bg-accent/5 text-accent hover:bg-accent hover:text-white hover:border-accent hover:shadow-lg hover:shadow-accent/20'
                }`}
              >
                <Heart size={22} fill={fav ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: product.name, url: window.location.href }).catch(() => {})
                  } else {
                    navigator.clipboard.writeText(window.location.href).then(() => toast.success('Enlace copiado')).catch(() => {})
                  }
                }}
                className="p-3.5 rounded-xl border-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:scale-105 active:scale-95"
                title="Compartir"
              >
                <Share2 size={22} />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {features.map(({ icon: Icon, text }) => (
                <div key={text} className="bg-white border border-gray-100 rounded-xl p-3 text-center hover:border-primary/20 hover:shadow-sm transition-all duration-300">
                  <Icon size={18} className="text-primary mx-auto mb-1.5" />
                  <p className="text-[10px] sm:text-xs text-gray-500 leading-tight">{text}</p>
                </div>
              ))}
            </div>

            {/* ===== REVIEWS SECTION ===== */}
            <div className="border-t border-gray-100 pt-10 mt-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-8">
                Reseñas{' '}
                <span className="text-gray-400 font-normal text-lg">
                  ({product.reviews?.length || 0})
                </span>
              </h2>

              {/* Review form */}
              {isAuthenticated && (
                <div className="bg-gradient-to-br from-primary/[0.03] to-accent/[0.03] rounded-2xl border border-primary/10 p-6 mb-8">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Send size={14} className="text-white" />
                    </div>
                    Escribe tu reseña
                  </h3>
                  <div className="flex gap-1.5 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="transition-all duration-200 hover:scale-110"
                      >
                        <Star
                          size={28}
                          fill={star <= reviewRating ? 'currentColor' : 'none'}
                          className={star <= reviewRating ? 'text-highlight' : 'text-gray-200 hover:text-highlight/50'}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Comparte tu experiencia con este producto (opcional)..."
                    className="w-full p-4 border border-gray-200 rounded-xl resize-none h-24 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleSubmitReview}
                      disabled={reviewRating === 0 || submittingReview}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <Send size={16} />
                      {submittingReview ? 'Publicando...' : 'Publicar reseña'}
                    </button>
                  </div>
                </div>
              )}

              {/* Reviews list */}
              {(!product.reviews || product.reviews.length === 0) ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Star size={24} className="text-gray-300" />
                  </div>
                  <p className="text-gray-400 text-sm">No hay reseñas aún</p>
                  <p className="text-gray-300 text-xs mt-1">Sé el primero en opinar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {product.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-gray-200 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {review.user?.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{review.user?.name || 'Usuario'}</p>
                            <p className="text-[10px] text-gray-400">{new Date(review.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              fill={star <= review.rating ? 'currentColor' : 'none'}
                              className={star <= review.rating ? 'text-highlight' : 'text-gray-200'}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed ml-12">
                        {review.comment || 'Sin comentario'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
