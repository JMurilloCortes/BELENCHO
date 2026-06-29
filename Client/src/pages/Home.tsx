import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Star, Shield, Award, Gift, Package, Sparkles, HeartHandshake, ChevronRight, Zap, Quote, Heart, ShoppingCart } from 'lucide-react'
import { getProducts } from '../services/product.service'
import { showToast } from '../lib/sweetalert'
import { useCartStore } from '../store/cart.store'
import { useFavoriteStore } from '../store/favorite.store'
import { useAuthStore } from '../store/auth.store'
import type { Product } from '../types'
import SkeletonCard from '../components/SkeletonCard'

const stats = [
  { value: '500+', label: 'Productos únicos' },
  { value: '98%', label: 'Clientes felices' },
  { value: '30min', label: 'Entrega local' },
  { value: '4.9', label: 'Calificación' },
]

const categories = [
  { name: 'Flores', slug: 'flores', gradient: 'from-pink-400 to-rose-500', icon: '🌸', count: '12' },
  { name: 'Hogar', slug: 'hogar', gradient: 'from-amber-400 to-orange-500', icon: '🏠', count: '8' },
  { name: 'Kits', slug: 'kits', gradient: 'from-violet-400 to-purple-500', icon: '🎁', count: '5' },
  { name: 'Accesorios', slug: 'accesorios', gradient: 'from-cyan-400 to-teal-500', icon: '✨', count: '20' },
]

const testimonials = [
  { name: 'María García', text: 'Los regalos de BELENCHO son únicos. Compré un ramo eterno y fue el detalle perfecto.', rating: 5, role: 'Cliente frecuente' },
  { name: 'Carlos López', text: 'Excelente calidad y servicio. El envío llegó antes de lo esperado. Muy recomendados.', rating: 5, role: 'Comprador verificado' },
  { name: 'Ana Martínez', text: 'Personalizaron una taza para mi mamá y le encantó. Los detalles marcan la diferencia.', rating: 5, role: 'Cliente recurrente' },
]

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const addItem = useCartStore((s) => s.addItem)
  const { toggleFavorite, isFavorite, loadFavorites } = useFavoriteStore()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => { if (isAuthenticated) loadFavorites() }, [isAuthenticated])

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => {})
      .finally(() => setProductsLoading(false))
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
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gray-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />

        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-highlight/5 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-60" />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/40 rounded-full"
              style={{
                top: `${15 + i * 15}%`,
                left: `${10 + i * 16}%`,
                animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl mx-auto lg:mx-0 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-8 animate-fadeIn">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-sm text-gray-400">Nueva colección <span className="text-white font-medium">2026</span></span>
            </div>

            {/* Title */}
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold text-white leading-[0.9] mb-8 animate-fadeIn">
              Regalos que
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-highlight mt-2">
                enamoran
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fadeIn">
              En BELENCHO creamos experiencias únicas a través de regalos creativos y personalizados. 
              Encuentra el detalle perfecto para cada ocasión.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fadeIn">
              <Link
                to="/catalogo"
                className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-8 py-4 rounded-xl text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/40 overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                <span className="relative flex items-center gap-2">
                  Explorar catálogo <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                to="/catalogo"
                className="inline-flex items-center justify-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 text-white px-8 py-4 rounded-xl text-base font-semibold transition-all duration-300 hover:scale-105"
              >
                <Sparkles size={18} className="text-highlight" />
                Ver ofertas
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6 mt-12 justify-center lg:justify-start animate-fadeIn">
              {[
                { icon: Shield, text: 'Pago seguro' },
                { icon: Award, text: 'Calidad premium' },
                { icon: Gift, text: 'Regalos únicos' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-gray-500">
                  <Icon size={14} className="text-primary" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-[10px] text-gray-600 uppercase tracking-[0.2em]">Scroll</span>
          <div className="w-5 h-8 border-2 border-gray-700 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-gray-500 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
        <div className="bg-gray-900/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 sm:p-10 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 shadow-2xl shadow-black/50">
          {stats.map((stat, i) => (
            <div key={stat.label} className="text-center group">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">Categorías</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mt-3">
              Explora por{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">categoría</span>
            </h2>
          </div>
          <Link to="/catalogo" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-primary transition-colors group">
            Ver todo <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/catalogo?categoria=${cat.slug}`}
              className="group relative rounded-3xl overflow-hidden aspect-[3/4] bg-gray-100"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-90 group-hover:scale-110 transition-transform duration-700`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,_white_0%,_transparent_60%)] opacity-20" />
              <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
                <span className="text-5xl mb-4 group-hover:scale-125 transition-transform duration-500">{cat.icon}</span>
                <h3 className="text-white font-bold text-xl sm:text-2xl">{cat.name}</h3>
                <p className="text-white/70 text-sm mt-1">{cat.count} productos</p>
              </div>
              <div className="absolute bottom-4 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
          ))}
        </div>
        <Link to="/catalogo" className="sm:hidden flex items-center justify-center gap-1 mt-6 text-sm font-medium text-primary">
          Ver todas las categorías <ChevronRight size={16} />
        </Link>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      {(products.length > 0 || productsLoading) && (
        <section className="bg-gray-50/80 py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <div>
                <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">Destacados</span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mt-3">
                  Productos{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">populares</span>
                </h2>
              </div>
              <Link to="/catalogo" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-primary transition-colors group">
                Ver todo <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {productsLoading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              ) : (
                products.slice(0, 4).map((product) => {
                const fav = isFavorite(product.id)
                return (
                <div
                  key={product.id}
                  className="group relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 hover:border-transparent"
                >
                  <Link to={`/producto/${product.id}`} className="block relative aspect-[4/5] overflow-hidden">
                    <img
                      src={product.images?.[0]?.url || 'https://placehold.co/400x500/e2e8f0/94a3b8?text=No'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
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
                      className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-300 ${
                        fav
                          ? 'bg-accent text-white shadow-lg shadow-accent/30'
                          : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:bg-accent hover:text-white hover:shadow-lg hover:shadow-accent/30'
                      }`}
                    >
                      <Heart size={16} fill={fav ? 'currentColor' : 'none'} />
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

            <div className="text-center mt-12">
              <Link
                to="/catalogo"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30 hover:scale-105"
              >
                Ver catálogo completo <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== FEATURES ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="text-center mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">Por qué elegirnos</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mt-3">
            La mejor{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">experiencia</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {[
            { icon: Gift, title: 'Regalos Únicos', desc: 'Productos creativos y originales que no encontrarás en otro lugar', gradient: 'from-primary/20 to-primary/5' },
            { icon: Star, title: 'Calidad Superior', desc: 'Seleccionamos los mejores materiales para cada producto', gradient: 'from-accent/20 to-accent/5' },
            { icon: Sparkles, title: 'Diseño Exclusivo', desc: 'Cada producto con diseños originales y creativos que marcan la diferencia', gradient: 'from-highlight/20 to-highlight/5' },
            { icon: Shield, title: 'Compra Segura', desc: 'Pagos protegidos y atención al cliente personalizada', gradient: 'from-primary/20 to-accent/5' },
          ].map(({ icon: Icon, title, desc, gradient }) => (
            <div
              key={title}
              className="group relative bg-white rounded-3xl border border-gray-100 p-8 hover:border-transparent transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
            >
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:from-primary group-hover:to-accent transition-all duration-500">
                  <Icon size={26} className="text-primary group-hover:text-white transition-colors duration-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 group-hover:text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gray-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em]">Testimonios</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3">
              Lo que dicen{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">nuestros clientes</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10"
              >
                <Quote size={24} className="text-primary/30 mb-4" />
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={15} className="fill-highlight text-highlight" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-8 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-dark to-accent" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />

        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-1.5 mb-8">
            <Zap size={14} className="text-highlight" />
            <span className="text-sm text-white/80">Únete a miles de clientes felices</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            ¿Listo para encontrar el{' '}
            <span className="text-highlight">regalo perfecto</span>?
          </h2>
          <p className="text-lg sm:text-xl text-white/70 mb-10 max-w-xl mx-auto">
            Descubre nuestra colección y haz de cada ocasión un momento inolvidable
          </p>
          <Link
            to="/catalogo"
            className="group inline-flex items-center gap-2 bg-white text-primary px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:bg-highlight hover:text-gray-900 hover:scale-105 hover:shadow-2xl"
          >
            Comprar ahora <HeartHandshake size={22} className="group-hover:scale-110 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  )
}
