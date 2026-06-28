import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Star, Shield, Truck, Gift, Sparkles, HeartHandshake, ChevronRight } from 'lucide-react'
import { getProducts } from '../services/product.service'
import type { Product } from '../types'

const stats = [
  { value: '500+', label: 'Productos únicos' },
  { value: '98%', label: 'Clientes satisfechos' },
  { value: '24h', label: 'Envío exprés' },
  { value: '4.9', label: 'Calificación promedio' },
]

const categories = [
  { name: 'Flores', slug: 'flores', image: 'https://placehold.co/600x600/49b8a7/ffffff?text=Flores', count: '12' },
  { name: 'Hogar', slug: 'hogar', image: 'https://placehold.co/600x600/fc8a80/ffffff?text=Hogar', count: '8' },
  { name: 'Kits', slug: 'kits', image: 'https://placehold.co/600x600/f8e694/333333?text=Kits', count: '5' },
  { name: 'Accesorios', slug: 'accesorios', image: 'https://placehold.co/600x600/49b8a7/ffffff?text=Acc', count: '20' },
]

const testimonials = [
  { name: 'María García', text: 'Los regalos de BELENCHO son únicos. Compré un ramo eterno y fue el detalle perfecto.', rating: 5, role: 'Cliente frecuente' },
  { name: 'Carlos López', text: 'Excelente calidad y servicio. El envío llegó antes de lo esperado. Muy recomendados.', rating: 5, role: 'Comprador verificado' },
  { name: 'Ana Martínez', text: 'Personalizaron una taza para mi mamá y le encantó. Los detalles marcan la diferencia.', rating: 5, role: 'Cliente recurrente' },
]

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    getProducts().then(setProducts).catch(() => {})
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-[url('https://placehold.co/1920x1080/1a1a2e/ffffff?text=')] bg-cover bg-center opacity-10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 py-20 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6 animate-fadeIn">
              <Sparkles size={14} className="text-highlight" />
              <span className="text-sm text-gray-300">Nueva colección 2026</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-tight mb-6 animate-fadeIn">
              Regalos que
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                enamoran
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-xl leading-relaxed animate-fadeIn">
              En BELENCHO creamos experiencias únicas a través de regalos creativos y personalizados. Encuentra el detalle perfecto para cada ocasión.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fadeIn">
              <Link
                to="/catalogo"
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/30"
              >
                Explorar catálogo
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/catalogo"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white px-8 py-3.5 rounded-xl text-base font-semibold transition-all duration-300"
              >
                Ver ofertas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative -mt-16 z-10 max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl border p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-primary mb-1">{stat.value}</p>
              <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Categorías</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mt-2">Explora por categoría</h2>
          </div>
          <Link to="/catalogo" className="hidden sm:flex items-center gap-1 text-primary font-medium text-sm hover:underline">
            Ver todo <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/catalogo?categoria=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-square bg-gray-100"
            >
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                <h3 className="text-white font-bold text-lg sm:text-xl">{cat.name}</h3>
                <p className="text-white/70 text-sm">{cat.count} productos</p>
              </div>
            </Link>
          ))}
        </div>
        <Link to="/catalogo" className="sm:hidden flex items-center justify-center gap-1 mt-6 text-primary font-medium text-sm">
          Ver todas las categorías <ChevronRight size={16} />
        </Link>
      </section>

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-primary text-sm font-semibold uppercase tracking-wider">Destacados</span>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mt-2">Productos populares</h2>
              </div>
              <Link to="/catalogo" className="hidden sm:flex items-center gap-1 text-primary font-medium text-sm hover:underline">
                Ver todo <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.slice(0, 4).map((product) => (
                <Link
                  key={product.id}
                  to={`/producto/${product.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.images?.[0]?.url || 'https://placehold.co/400x400/e2e8f0/94a3b8?text=No'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-4">
                    <span className="text-xs text-primary font-medium bg-primary/5 px-2 py-0.5 rounded-full">{product.category?.name}</span>
                    <h3 className="font-semibold text-gray-800 mt-2 text-sm sm:text-base group-hover:text-primary transition-colors">{product.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-bold text-primary">${Number(product.price).toLocaleString()}</span>
                      <span className="text-xs text-gray-400">{product.stock} disp.</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                to="/catalogo"
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-primary-dark transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
              >
                Ver catálogo completo <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">Por qué elegirnos</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mt-2">La mejor experiencia de compra</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Gift, title: 'Regalos Únicos', desc: 'Productos creativos y originales que no encontrarás en otro lugar' },
            { icon: Star, title: 'Calidad Superior', desc: 'Seleccionamos los mejores materiales para cada producto' },
            { icon: Truck, title: 'Envío Rápido', desc: 'Entrega segura y puntual a todo el país en 24-48 horas' },
            { icon: Shield, title: 'Compra Segura', desc: 'Pagos protegidos y atención al cliente personalizada' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group text-center p-6 sm:p-8 rounded-2xl bg-white border border-gray-100 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
              <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <Icon size={28} className="text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-br from-primary/5 via-white to-accent/5 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">Testimonios</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mt-2">Lo que dicen nuestros clientes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={16} className="fill-highlight text-highlight" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-dark to-primary" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">¿Listo para encontrar el regalo perfecto?</h2>
          <p className="text-lg text-white/80 mb-8">Descubre nuestra colección y haz de cada ocasión un momento inolvidable</p>
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3.5 rounded-xl font-semibold hover:bg-highlight hover:text-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            Comprar ahora <HeartHandshake size={20} />
          </Link>
        </div>
      </section>
    </div>
  )
}
