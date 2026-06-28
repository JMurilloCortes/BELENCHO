import { Link } from 'react-router-dom'
import { Gift, Sparkles, Truck } from 'lucide-react'

export default function Home() {
  return (
    <div>
      <section className="bg-gradient-to-br from-teal-400 via-teal-400 to-coral-400 text-white">
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Regalos Creativos
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
            Encuentra el regalo perfecto para cada ocasión en BELENCHO
          </p>
          <Link
            to="/catalogo"
            className="inline-block bg-white text-primary font-semibold px-8 py-3 rounded-lg text-lg hover:bg-yellow-300 hover:text-gray-800 transition-all"
          >
            Explorar catálogo
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 rounded-2xl bg-gray-50 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-highlight rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Gift size={32} className="text-gray-700" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Regalos Únicos</h3>
            <p className="text-gray-600">Productos creativos y originales que encantarán</p>
          </div>
          <div className="text-center p-8 rounded-2xl bg-gray-50 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-highlight rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles size={32} className="text-gray-700" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Calidad Superior</h3>
            <p className="text-gray-600">Seleccionamos los mejores productos para ti</p>
          </div>
          <div className="text-center p-8 rounded-2xl bg-gray-50 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-highlight rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Truck size={32} className="text-gray-700" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Envío Rápido</h3>
            <p className="text-gray-600">Entrega segura y puntual a todo el país</p>
          </div>
        </div>
      </section>
    </div>
  )
}
