import { Link } from 'react-router-dom'
import { Heart, Camera, Globe, MessageCircle, Mail, Phone, MapPin, ChevronRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <img
                src="https://res.cloudinary.com/dtarklm7p/image/upload/v1782689025/BELENCHO/Logos/Logo_belencho_hm2kbc.jpg"
                alt="BELENCHO"
                className="h-10 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Regalos creativos para momentos especiales. En BELENCHO encuentras el detalle perfecto que convierte cualquier ocasión en un recuerdo inolvidable.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Camera, href: '#', label: 'Instagram' },
                { icon: MessageCircle, href: '#', label: 'WhatsApp' },
                { icon: Globe, href: '#', label: 'Web' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-primary flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Enlaces</h4>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'Inicio' },
                { to: '/catalogo', label: 'Catálogo' },
                { to: '/favoritos', label: 'Favoritos' },
                { to: '/carrito', label: 'Carrito' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-gray-400 hover:text-highlight transition-colors flex items-center gap-1.5 group">
                    <ChevronRight size={12} className="text-primary group-hover:translate-x-1 transition-transform" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-gray-400">Medellín, Colombia</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-primary shrink-0" />
                <a href="tel:+573000000000" className="text-sm text-gray-400 hover:text-highlight transition-colors">+57 300 000 0000</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-primary shrink-0" />
                <a href="mailto:info@belencho.com" className="text-sm text-gray-400 hover:text-highlight transition-colors">info@belencho.com</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Newsletter</h4>
            <p className="text-sm text-gray-400 mb-4">Recibe ofertas exclusivas y novedades</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
              />
              <button className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 shrink-0">
                <Mail size={18} />
              </button>
            </form>
            <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
              <Heart size={14} className="text-accent" />
              <span>Hecho con amor en Colombia</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} BELENCHO Regalos Creativos. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-highlight transition-colors">Términos</a>
            <a href="#" className="hover:text-highlight transition-colors">Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
