import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Heart, User, LogOut } from 'lucide-react'
import { useAuthStore } from '../store/auth.store'
import { useCartStore } from '../store/cart.store'
import { useFavoriteStore } from '../store/favorite.store'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const itemCount = useCartStore((s) => s.itemCount)
  const loadCart = useCartStore((s) => s.loadCart)
  const clearCart = useCartStore((s) => s.clearCart)
  const resetFavorites = useFavoriteStore((s) => s.reset)

  useEffect(() => {
    if (isAuthenticated) loadCart()
  }, [isAuthenticated])

  const handleLogout = () => {
    logout()
    clearCart()
    resetFavorites()
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg">
            B
          </div>
          <span className="text-xl font-bold text-gray-800 hidden sm:block">
            BELENCHO
          </span>
        </Link>

        <div className="flex items-center gap-8">
          <Link to="/" className="text-gray-600 hover:text-primary font-medium transition-colors">
            Inicio
          </Link>
          <Link to="/catalogo" className="text-gray-600 hover:text-primary font-medium transition-colors">
            Catálogo
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/favoritos" className="text-gray-500 hover:text-accent transition-colors">
            <Heart size={22} />
          </Link>
          <Link to="/carrito" className="text-gray-500 hover:text-primary transition-colors relative">
            <ShoppingCart size={22} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {itemCount}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 hidden sm:block">
                {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-accent transition-colors"
                title="Cerrar sesión"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors flex items-center gap-1.5"
            >
              <User size={18} />
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
