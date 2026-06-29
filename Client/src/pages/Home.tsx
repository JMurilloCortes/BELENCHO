import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Star, Shield, Gift, Sparkles, HeartHandshake,
  ChevronRight, Zap, Quote, Heart, ShoppingCart, Truck, Clock,
  BadgeCheck, Palette, Gem, ArrowUpRight, Users, Smile,
  Leaf, Eye, Package, ChevronLeft, Play, Circle,
} from 'lucide-react'
import { getProducts } from '../services/product.service'
import { showToast } from '../lib/sweetalert'
import { useCartStore } from '../store/cart.store'
import { useFavoriteStore } from '../store/favorite.store'
import { useAuthStore } from '../store/auth.store'
import type { Product } from '../types'
import SkeletonCard from '../components/SkeletonCard'

const categories = [
  { name: 'Flores', slug: 'flores', color: '#f43f5e', count: '12', desc: 'Ramos eternos y arreglos florales preservados' },
  { name: 'Hogar', slug: 'hogar', color: '#f97316', count: '8', desc: 'Decoración y detalles para tu espacio' },
  { name: 'Kits', slug: 'kits', color: '#a855f7', count: '5', desc: 'Cajas sorpresa y combos especiales' },
  { name: 'Accesorios', slug: 'accesorios', color: '#14b8a6', count: '20', desc: 'Complementos únicos con personalidad' },
]

const features = [
  { icon: Gift, title: 'Regalos Únicos', desc: 'Productos creativos que no encontrarás en otro lugar', number: '01' },
  { icon: Gem, title: 'Calidad Superior', desc: 'Seleccionamos los mejores materiales para cada producto', number: '02' },
  { icon: Palette, title: 'Diseño Exclusivo', desc: 'Cada pieza es diseñada con dedicación para ofrecerte algo especial', number: '03' },
  { icon: Truck, title: 'Envío Local', desc: 'Entrega rápida en Quibdó y alrededores sin demora', number: '04' },
]

const testimonials = [
  { name: 'María García', text: 'Los regalos de BELENCHO son únicos. Compré un ramo eterno y fue el detalle perfecto.', rating: 5, role: 'Cliente frecuente' },
  { name: 'Carlos López', text: 'Excelente calidad y servicio. El envío llegó antes de lo esperado. Muy recomendados.', rating: 5, role: 'Comprador verificado' },
  { name: 'Ana Martínez', text: 'Personalizaron una taza para mi mamá y le encantó. Los detalles marcan la diferencia.', rating: 5, role: 'Cliente recurrente' },
]

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const addItem = useCartStore((s) => s.addItem)
  const { toggleFavorite, isFavorite, loadFavorites } = useFavoriteStore()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const testimonialInterval = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => { if (isAuthenticated) loadFavorites() }, [isAuthenticated])

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setProductsLoading(false))
  }, [])

  useEffect(() => {
    testimonialInterval.current = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(testimonialInterval.current)
  }, [])

  const handleAddToCart = (productId: string) => {
    if (!isAuthenticated) { window.location.href = '/login'; return }
    const product = products.find((p) => p.id === productId)
    showToast('success', 'Agregado al carrito')
    addItem(productId, 1, product).catch(() => {
      showToast('error', 'Error al agregar al carrito')
    })
  }

  return (
    <div className="overflow-hidden">

      {/* ===== HERO - CENTERED SPOTLIGHT ===== */}
      <section className="relative flex items-center justify-center overflow-hidden bg-gray-900" style={{ borderRadius: '0 0 50% 50% / 0 0 50px 50px', minHeight: '50vh' }}>
        {/* Animated gradient mesh background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-30 animate-[mesh_20s_ease-in-out_infinite]" style={{
            background: 'conic-gradient(from 0deg at 50% 50%, #49b8a7 0deg, #fc8a80 90deg, #f8e694 180deg, #49b8a7 270deg, #49b8a7 360deg)',
            filter: 'blur(120px)',
          }} />
          <div className="absolute -top-1/2 -right-1/2 w-[200%] h-[200%] opacity-20 animate-[mesh_25s_ease-in-out_infinite_reverse]" style={{
            background: 'conic-gradient(from 180deg at 50% 50%, #fc8a80 0deg, #f8e694 120deg, #49b8a7 240deg, #fc8a80 360deg)',
            filter: 'blur(100px)',
          }} />
        </div>

        {/* Particle grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />

        {/* Vignette */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(17,24,39,0.6) 100%)',
        }} />

        <style>{`
          @keyframes mesh {
            0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
            25% { transform: translate(5%, 5%) rotate(90deg) scale(1.1); }
            50% { transform: translate(-5%, 10%) rotate(180deg) scale(0.9); }
            75% { transform: translate(10%, -5%) rotate(270deg) scale(1.05); }
          }
        `}</style>

        <div className="relative w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-14 text-center">
          {/* Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[0.85] mb-3 sm:mb-5 tracking-tight">
            Regalos{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-highlight">que enamoran</span>
          </h1>

          <p className="text-xs sm:text-base lg:text-base text-white/60 mb-4 sm:mb-8 max-w-lg mx-auto leading-relaxed">
            Regalos creativos para momentos inolvidables.
          </p>

          {/* Buttons */}
          <div className="flex flex-row gap-2 sm:gap-3 justify-center">
            <Link
              to="/catalogo"
              className="group inline-flex items-center justify-center gap-1.5 sm:gap-2.5 bg-white text-gray-900 px-5 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-semibold transition-all duration-300 hover:bg-primary hover:text-white hover:scale-105 hover:shadow-xl hover:shadow-primary/20"
            >
              Explorar
              <ArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform" />
            </Link>
            <Link
              to="/catalogo"
              className="group inline-flex items-center justify-center gap-1.5 sm:gap-2.5 bg-white/10 text-white/80 border border-white/20 sm:border-2 px-5 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-semibold transition-all duration-300 hover:bg-white/20 hover:border-white/40 hover:text-white hover:scale-105"
            >
              <Sparkles size={12} />
              Ofertas
            </Link>
          </div>

          {/* Bottom trust indicators */}
          <div className="hidden sm:flex items-center justify-center gap-8 mt-10 pt-6 border-t border-white/10">
            {[
              { icon: Shield, text: 'Pago seguro' },
              { icon: BadgeCheck, text: 'Calidad premium' },
              { icon: Clock, text: 'Entrega rápida' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs lg:text-sm text-white/50">
                <Icon size={11} className="text-primary" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BRAND STRIP ===== */}
      <section className="py-12 bg-gray-50/50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Productos únicos', icon: Package },
              { value: '98%', label: 'Clientes felices', icon: Smile },
              { value: '30min', label: 'Entrega local', icon: Truck },
              { value: '4.9', label: 'Calificación', icon: Star },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES - GRID WITH OVERLAY ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/5 text-primary rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] mb-4">
              <Leaf size={12} />
              Categorías
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Explora por{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">categoría</span>
            </h2>
          </div>
          <Link to="/catalogo" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-primary transition-colors group">
            Ver todo <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/catalogo?categoria=${cat.slug}`}
              className="group relative rounded-3xl overflow-hidden aspect-[4/5] bg-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5"
            >
              <div
                className="absolute inset-0 transition-all duration-700 group-hover:scale-110"
                style={{ backgroundColor: cat.color, opacity: 0.85 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,_white_0%,_transparent_60%)] opacity-10" />
              <div className="absolute top-5 left-5 right-5 flex items-start justify-between z-10">
                <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {cat.count} productos
                </span>
              </div>
              <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-white/30 transition-all duration-500">
                  <span className="text-3xl">{cat.slug === 'flores' ? '🌸' : cat.slug === 'hogar' ? '🏠' : cat.slug === 'kits' ? '🎁' : '✨'}</span>
                </div>
                <h3 className="text-white font-bold text-2xl mb-1.5">{cat.name}</h3>
                <p className="text-white/60 text-sm max-w-[160px]">{cat.desc}</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
          ))}
        </div>

        <Link to="/catalogo" className="sm:hidden flex items-center justify-center gap-1.5 mt-6 text-sm font-medium text-white bg-primary rounded-xl px-4 py-3 hover:bg-primary-dark transition-colors">
          Ver todas las categorías <ChevronRight size={16} />
        </Link>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      {(products.length > 0 || productsLoading) && (
        <section className="py-24 sm:py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50/80 via-white to-gray-50/30" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <div>
                <div className="inline-flex items-center gap-2 bg-accent/5 text-accent rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] mb-4">
                  <Sparkles size={12} />
                  Destacados
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Productos{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">populares</span>
                </h2>
              </div>
              <Link to="/catalogo" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-primary transition-colors group">
                Ver todo <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {productsLoading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              ) : (
                products.slice(0, 4).map((product, idx) => {
                  const fav = isFavorite(product.id)
                  return (
                <div
                  key={product.id}
                  className="group relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
                  style={{ animationDelay: `${idx * 0.1}s` }}
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
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        if (!isAuthenticated) { window.location.href = '/login'; return }
                        const wasFav = isFavorite(product.id)
                        showToast('success', wasFav ? 'Eliminado de favoritos' : 'Agregado a favoritos')
                        toggleFavorite(product.id, product).catch(() => {
                          showToast('error', 'Error al actualizar favoritos')
                        })
                      }}
                      className={`absolute top-3 right-3 z-10 p-2.5 rounded-full transition-all duration-300 ${
                        fav
                          ? 'bg-accent text-white shadow-lg shadow-accent/30'
                          : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:bg-accent hover:text-white hover:shadow-lg hover:shadow-accent/30'
                      }`}
                    >
                      <Heart size={15} fill={fav ? 'currentColor' : 'none'} />
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
              )}))}
            </div>

            <div className="text-center mt-14">
              <Link
                to="/catalogo"
                className="group inline-flex items-center gap-2.5 bg-gradient-to-r from-primary to-accent text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30 hover:scale-105"
              >
                Ver catálogo completo
                <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
              </Link>
          </div>
        </div>
      </section>
      )}

      {/* ===== FEATURES - NUMBERED ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 sm:pb-32">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/5 text-primary rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] mb-4">
            <Gem size={12} />
            Por qué elegirnos
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
            La mejor{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">experiencia</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto">
            Cada detalle está pensado para que tu experiencia de compra sea inolvidable
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {features.map(({ icon: Icon, title, desc, number }) => (
            <div
              key={title}
              className="group relative bg-white rounded-3xl border border-gray-100 p-8 sm:p-10 hover:border-transparent transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-accent/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -top-6 -right-6 text-8xl font-bold text-gray-100/50 group-hover:text-primary/[0.03] transition-colors duration-500 select-none">
                {number}
              </div>
              <div className="relative flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:from-primary group-hover:to-accent transition-all duration-500">
                  <Icon size={26} className="text-primary group-hover:text-white transition-colors duration-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== TESTIMONIALS - CAROUSEL ===== */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-10 left-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/[0.06] rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] mb-4">
              <Users size={12} className="text-white/60" />
              <span className="text-white/60">Testimonios</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              Lo que dicen{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">nuestros clientes</span>
            </h2>
          </div>

          <div className="relative max-w-2xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
              >
                {testimonials.map((t) => (
                  <div key={t.name} className="w-full shrink-0 px-2">
                    <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-3xl p-10 sm:p-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl mx-auto mb-6 shadow-lg shadow-primary/20">
                        {t.name[0]}
                      </div>
                      <Quote size={28} className="text-primary/20 mx-auto mb-6" />
                      <div className="flex gap-1 justify-center mb-5">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} size={16} className="fill-highlight text-highlight" />
                        ))}
                      </div>
                      <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-8 italic">"{t.text}"</p>
                      <div>
                        <p className="font-semibold text-white text-base">{t.name}</p>
                        <p className="text-sm text-gray-500">{t.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`transition-all duration-300 rounded-full ${
                    i === activeTestimonial
                      ? 'w-8 h-2.5 bg-gradient-to-r from-primary to-accent'
                      : 'w-2.5 h-2.5 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA - DUAL ===== */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-accent" />
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjAiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-1.5 mb-8">
                <Zap size={14} className="text-highlight" />
                <span className="text-sm text-white/80">Únete a miles de clientes felices</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                ¿Listo para encontrar el{' '}
                <span className="text-highlight">regalo perfecto</span>?
              </h2>
              <p className="text-base sm:text-lg text-white/70 mb-8 max-w-md mx-auto lg:mx-0">
                Descubre nuestra colección y haz de cada ocasión un momento inolvidable
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  to="/catalogo"
                  className="group inline-flex items-center justify-center gap-2 bg-white text-primary px-8 py-4 rounded-xl font-bold text-base transition-all duration-300 hover:bg-highlight hover:text-gray-900 hover:scale-105 hover:shadow-2xl"
                >
                  Comprar ahora
                  <HeartHandshake size={20} className="group-hover:scale-110 transition-transform" />
                </Link>
                <Link
                  to="/catalogo"
                  className="group inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-4 rounded-xl font-semibold text-sm transition-all duration-300 hover:bg-white/20 hover:scale-105"
                >
                  Ver colección
                  <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Gift, title: 'Envío gratis', desc: 'En Quibdó' },
                  { icon: Sparkles, title: 'Personalizable', desc: 'A tu gusto' },
                  { icon: Shield, title: 'Pago seguro', desc: 'Wompi + MercadoPago' },
                  { icon: BadgeCheck, title: 'Calidad premium', desc: 'Garantizada' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 text-center border border-white/10 hover:bg-white/15 transition-all duration-300">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/20 flex items-center justify-center">
                      <Icon size={24} className="text-white" />
                    </div>
                    <p className="text-white font-semibold text-sm">{title}</p>
                    <p className="text-white/50 text-xs mt-1">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
