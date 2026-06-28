import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Heart, User, LogOut, ChevronDown, LayoutDashboard, UserCircle } from 'lucide-react'
import { useAuthStore } from '../store/auth.store'
import { useCartStore } from '../store/cart.store'
import { useFavoriteStore } from '../store/favorite.store'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const itemCount = useCartStore((s) => s.itemCount)
  const loadCart = useCartStore((s) => s.loadCart)
  const clearCart = useCartStore((s) => s.clearCart)
  const resetFavorites = useFavoriteStore((s) => s.reset)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isAuthenticated) loadCart()
  }, [isAuthenticated])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    clearCart()
    resetFavorites()
    setMenuOpen(false)
  }

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'COLLABORATOR'

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
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary transition-colors"
              >
                <span className="hidden sm:block font-medium">{user?.name}</span>
                <ChevronDown size={16} className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border py-1.5">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/perfil"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
                  >
                    <UserCircle size={18} />
                    Mi perfil
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
                    >
                      <LayoutDashboard size={18} />
                      Panel de administración
                    </Link>
                  )}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={18} />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
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
