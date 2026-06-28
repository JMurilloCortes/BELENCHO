import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Heart, User, LogOut, ChevronDown, LayoutDashboard, UserCircle, Menu, X } from 'lucide-react'
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
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()

  useEffect(() => {
    if (isAuthenticated) loadCart()
  }, [isAuthenticated])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setMenuOpen(false)
  }, [pathname])

  const handleLogout = () => {
    logout()
    clearCart()
    resetFavorites()
    setMenuOpen(false)
  }

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'COLLABORATOR'

  const navLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/catalogo', label: 'Catálogo' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/90 backdrop-blur-lg shadow-sm' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img
            src="https://res.cloudinary.com/dtarklm7p/image/upload/v1782689025/BELENCHO/Logos/Logo_belencho_hm2kbc.jpg"
            alt="BELENCHO"
            className="h-10 w-auto"
          />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 ${
                pathname === link.to
                  ? 'text-primary after:w-full'
                  : 'text-gray-600 hover:text-primary after:w-0 hover:after:w-full'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link to="/favoritos" className="text-gray-500 hover:text-accent transition-colors p-1.5">
            <Heart size={20} />
          </Link>
          <Link to="/carrito" className="text-gray-500 hover:text-primary transition-colors relative p-1.5">
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] rounded-full w-4.5 h-4.5 flex items-center justify-center font-medium min-w-[18px] min-h-[18px]">
                {itemCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="relative hidden sm:block" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary transition-colors bg-gray-100 hover:bg-gray-200 rounded-full pl-3 pr-2 py-1.5"
              >
                <span className="font-medium max-w-[100px] truncate">{user?.name}</span>
                <ChevronDown size={14} className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border py-1.5 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/perfil"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
                  >
                    <UserCircle size={18} />
                    Mi perfil
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
                    >
                      <LayoutDashboard size={18} />
                      Panel de administración
                    </Link>
                  )}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
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
              className="hidden sm:flex bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors items-center gap-1.5"
            >
              <User size={18} />
              Iniciar sesión
            </Link>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1.5 text-gray-600 hover:text-primary transition-colors"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <div className={`md:hidden transition-all duration-300 overflow-hidden ${
        mobileOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="bg-white border-t px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.to
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-gray-100 pt-2 mt-2">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 text-sm text-gray-400">{user?.email}</div>
                <Link to="/perfil" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <UserCircle size={18} /> Mi perfil
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    <LayoutDashboard size={18} /> Panel de administración
                  </Link>
                )}
                <button onClick={handleLogout} className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors">
                  <LogOut size={18} /> Cerrar sesión
                </button>
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-primary font-medium hover:bg-primary/5 transition-colors">
                <User size={18} /> Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
