export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-3">BELENCHO</h3>
          <p className="text-sm text-gray-400">
            Regalos creativos para momentos especiales. Encuentra el detalle perfecto.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Enlaces</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-highlight transition-colors">Inicio</a></li>
            <li><a href="/catalogo" className="hover:text-highlight transition-colors">Catálogo</a></li>
            <li><a href="/contacto" className="hover:text-highlight transition-colors">Contacto</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Contacto</h4>
          <ul className="space-y-2 text-sm">
            <li>info@belencho.com</li>
            <li>+57 300 000 0000</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} BELENCHO Regalos Creativos. Todos los derechos reservados.
      </div>
    </footer>
  )
}
