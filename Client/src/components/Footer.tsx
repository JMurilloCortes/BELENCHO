import { Link } from 'react-router-dom'
import { Heart, Camera, MessageCircle, Globe, Mail, Phone, MapPin, ChevronRight, Sparkles, ArrowUp, Send } from 'lucide-react'
import { useState, useEffect } from 'react'

const socialLinks = [
  { icon: Camera, href: '#', label: 'Instagram', color: 'hover:bg-gradient-to-tr hover:from-pink-500 hover:via-purple-500 hover:to-orange-400' },
  { icon: MessageCircle, href: '#', label: 'WhatsApp', color: 'hover:bg-green-500' },
  { icon: Globe, href: '#', label: 'TikTok', color: 'hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500' },
  { icon: Heart, href: '#', label: 'Pinterest', color: 'hover:bg-red-600' },
]

const quickLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/favoritos', label: 'Favoritos' },
  { to: '/carrito', label: 'Carrito' },
]

const contactInfo = [
  { icon: MapPin, label: 'Quibdó, Colombia' },
  { icon: Phone, label: '+57 316 749 8990', href: 'tel:+573167498990' },
  { icon: Mail, label: 'belencho.regalos@gmail.com', href: 'mailto:belencho.regalos@gmail.com' },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  useEffect(() => {
    const handleScroll = () => setShowScrollBtn(window.scrollY > 400)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEmail('')
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative mt-auto overflow-hidden">
      {/* Decorative top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      {/* Background layers */}
      <div className="absolute inset-0 bg-gray-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent" />

      {/* Decorative blur spheres */}
      <div className="absolute top-20 -left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-40 -right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiKDI1NSwyNTUsMjU1LDAuMDIpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main content */}
        <div className="pt-16 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

            {/* Brand column */}
            <div className="sm:col-span-2 lg:col-span-4">
              <Link to="/" className="inline-block mb-5 group">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
                    B
                  </div>
                  <div>
                    <span className="text-white font-bold text-lg tracking-tight">BELENCHO</span>
                    <span className="block text-[10px] text-gray-500 uppercase tracking-[0.2em] font-medium">Regalos Creativos</span>
                  </div>
                </div>
              </Link>
              <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-xs">
                Transformamos momentos especiales en recuerdos inolvidables con regalos únicos y personalizados.
              </p>

              {/* Social icons */}
              <div className="flex gap-2.5">
                {socialLinks.map(({ icon: Icon, href, label, color }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-gray-400 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:border-transparent hover:text-white ${color}`}
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="lg:col-span-2">
              <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-[0.15em]">
                <span className="inline-block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Enlaces</span>
              </h4>
              <ul className="space-y-3">
                {quickLinks.map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-sm text-gray-400 hover:text-white transition-all duration-300 flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/50 group-hover:bg-primary group-hover:scale-125 transition-all duration-300" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="lg:col-span-3">
              <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-[0.15em]">
                <span className="inline-block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Contacto</span>
              </h4>
              <ul className="space-y-4">
                {contactInfo.map(({ icon: Icon, label, href }) => (
                  <li key={label}>
                    {href ? (
                      <a href={href} className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-all duration-300 group">
                        <span className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:border-primary/30 group-hover:text-primary transition-all duration-300">
                          <Icon size={15} />
                        </span>
                        {label}
                      </a>
                    ) : (
                      <span className="flex items-center gap-3 text-sm text-gray-400">
                        <span className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <Icon size={15} className="text-primary" />
                        </span>
                        {label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="lg:col-span-3">
              <h4 className="text-white font-semibold mb-6 text-sm uppercase tracking-[0.15em]">
                <span className="inline-block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Newsletter</span>
              </h4>
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">
                Suscríbete y recibe novedades, lanzamientos y ofertas exclusivas directamente en tu correo.
              </p>
              <form onSubmit={handleSubmit} className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:bg-white/10 focus:ring-1 focus:ring-primary/30 transition-all duration-300"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-105 shrink-0"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </form>
              <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                <Sparkles size={14} className="text-highlight" />
                <span>Hecho con <Heart size={12} className="inline text-accent mx-0.5" /> en Quibdó</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} BELENCHO Regalos Creativos. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors duration-300 relative after:absolute after:-bottom-0.5 after:left-0 after:w-0 after:h-px after:bg-primary after:transition-all after:duration-300 hover:after:w-full">Términos</a>
            <a href="#" className="hover:text-white transition-colors duration-300 relative after:absolute after:-bottom-0.5 after:left-0 after:w-0 after:h-px after:bg-primary after:transition-all after:duration-300 hover:after:w-full">Privacidad</a>
          </div>
        </div>
      </div>

      {/* Back to top - fixed position */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center hover:scale-110 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 shadow-lg shadow-primary/20 ${
          showScrollBtn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Volver arriba"
      >
        <ArrowUp size={18} className="group-hover:-translate-y-0.5 transition-transform" />
      </button>
    </footer>
  )
}
