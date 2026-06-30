import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Heart, User, LogOut, ChevronDown, LayoutDashboard, UserCircle, Menu, X, Sparkles, Search, Package } from 'lucide-react'
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
  const [drawerOpen, setDrawerOpen] = useState(false)
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
    setDrawerOpen(false)
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const handleLogout = () => {
    logout()
    clearCart()
    resetFavorites()
    setMenuOpen(false)
  }

  const isAdmin = user?.role === 'ADMINISTRADOR' || user?.role === 'COLABORADOR'

  const navLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/catalogo', label: 'Catálogo' },
  ]

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-white/80 backdrop-blur-xl ${
          scrolled ? 'shadow-[0_1px_0_rgba(0,0,0,0.05)]' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative">
              <img
                src="https://res.cloudinary.com/dtarklm7p/image/upload/v1782689025/BELENCHO/Logos/Logo_belencho_hm2kbc.jpg"
                alt="BELENCHO"
                className="h-10 w-auto md:h-12 rounded-xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-lg"
              />
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500 -z-10" />
            </div>

          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 group ${
                  pathname === link.to
                    ? 'text-primary'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {link.label}
                <span
                  className={`absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ${
                    pathname === link.to ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Cart */}
            <Link
              to="/carrito"
              className="relative p-2.5 text-gray-500 hover:text-primary rounded-xl hover:bg-primary/5 transition-all duration-300 group"
            >
              <ShoppingCart size={20} className="group-hover:scale-110 transition-transform duration-300" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[10px] font-bold rounded-full min-w-[18px] min-h-[18px] flex items-center justify-center shadow-lg shadow-accent/30 animate-fadeIn">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Favorites */}
            <Link
              to="/favoritos"
              className="hidden sm:flex p-2.5 text-gray-500 hover:text-accent rounded-xl hover:bg-accent/5 transition-all duration-300 group"
            >
              <Heart size={20} className="group-hover:scale-110 transition-transform duration-300" />
            </Link>

            {/* User */}
            {isAuthenticated ? (
              <div className="relative hidden sm:block" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 rounded-full pl-1.5 pr-4 py-1.5 border ${
                    menuOpen
                      ? 'border-primary/30 bg-primary/5 shadow-sm'
                      : 'border-gray-200/70 bg-white/70 hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm'
                  }`}
                >
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary via-accent to-highlight flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                  </div>
                  <span className="max-w-[80px] truncate">{user?.name}</span>
                  <ChevronDown
                    size={12}
                    className={`text-gray-400 transition-all duration-300 ${menuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl shadow-black/5 border border-gray-100/80 overflow-hidden animate-dropdown origin-top-right">
                    <div className="bg-gradient-to-r from-primary/[0.04] to-accent/[0.04] px-5 py-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary via-accent to-highlight flex items-center justify-center text-white font-bold shadow-md">
                          {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                          <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-1.5 px-2">
                      <Link
                        to="/perfil"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <UserCircle size={16} className="text-primary" />
                        </div>
                        <span className="font-medium">Mi perfil</span>
                      </Link>
                      <Link
                        to="/pedidos"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-highlight/5 flex items-center justify-center group-hover:bg-highlight/10 transition-colors">
                          <Package size={16} className="text-yellow-700" />
                        </div>
                        <span className="font-medium">Mis pedidos</span>
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-all duration-200 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-accent/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                            <LayoutDashboard size={16} className="text-accent" />
                          </div>
                          <span className="font-medium">Panel de administración</span>
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-gray-100 px-2 py-1.5">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                          <LogOut size={16} />
                        </div>
                        <span className="font-medium">Cerrar sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-105 active:scale-95"
              >
                <User size={16} />
                Iniciar sesión
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className={`md:hidden p-2.5 rounded-xl border-2 transition-all duration-300 ${
                drawerOpen
                  ? 'border-primary/20 bg-primary/5 text-primary'
                  : 'border-gray-200 text-gray-400 hover:border-primary/20 hover:bg-primary/5 hover:text-primary'
              }`}
            >
              {drawerOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        <div className="h-0.5 bg-gradient-to-r from-primary via-accent to-highlight" />
      </nav>

      {/* Mobile drawer overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-500 ${
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />

        {/* Drawer */}
        <div
          className={`absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transition-all duration-500 ${
            drawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <img
                src="https://res.cloudinary.com/dtarklm7p/image/upload/v1782689025/BELENCHO/Logos/Logo_belencho_hm2kbc.jpg"
                alt="BELENCHO"
                className="h-8 w-auto rounded-lg"
              />
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg border border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {/* User info (if authenticated) */}
              {isAuthenticated && (
                <div className="flex items-center gap-3 px-3 py-3 mb-4 bg-gradient-to-r from-primary/[0.04] to-accent/[0.04] rounded-2xl border border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-accent to-highlight flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                </div>
              )}

              {/* Nav links */}
              <div className="space-y-0.5 mb-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold px-3 mb-2">
                  Navegación
                </p>
                {[
                  ...navLinks,
                  { to: '/favoritos', label: 'Favoritos' },
                ].map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      pathname === link.to
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* User actions */}
              {isAuthenticated ? (
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold px-3 mb-2">
                    Cuenta
                  </p>
                  <Link
                    to="/perfil"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-primary transition-all duration-200"
                  >
                    <UserCircle size={18} className="text-primary" />
                    Mi perfil
                  </Link>
                  <Link
                    to="/pedidos"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-primary transition-all duration-200"
                  >
                    <Package size={18} className="text-yellow-700" />
                    Mis pedidos
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-primary transition-all duration-200"
                    >
                      <LayoutDashboard size={18} className="text-accent" />
                      Panel de administración
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200 mt-2"
                  >
                    <LogOut size={18} />
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-primary to-accent text-white px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
                >
                  <User size={16} />
                  Iniciar sesión
                </Link>
              )}
            </div>

            {/* Drawer footer */}
            <div className="px-5 py-4 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 text-center">
                &copy; 2026 BELENCHO Regalos Creativos
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
