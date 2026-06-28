import { Link, Outlet, useLocation } from 'react-router-dom'
import { Package, Users, Tag, LayoutDashboard, ShoppingCart, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'
import { useState } from 'react'

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/productos', icon: Package, label: 'Productos' },
  { path: '/admin/ordenes', icon: ShoppingCart, label: 'Órdenes' },
  { path: '/admin/categorias', icon: Tag, label: 'Categorías' },
]

const adminNavItems = [
  { path: '/admin/usuarios', icon: Users, label: 'Usuarios' },
]

export default function AdminLayout() {
  const { pathname } = useLocation()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'ADMIN'
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const active = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path))
    return (
      <Link
        to={item.path}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
          active
            ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-sm'
            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
        }`}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
          active ? 'bg-primary text-white shadow-sm' : 'bg-white/5 text-gray-500'
        }`}>
          <item.icon size={16} />
        </div>
        <span>{item.label}</span>
      </Link>
    )
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-5 border-b border-gray-800">
          <Link to="/admin" className="flex items-center gap-3">
            <img
              src="https://res.cloudinary.com/dtarklm7p/image/upload/v1782689025/BELENCHO/Logos/Logo_belencho_hm2kbc.jpg"
              alt="BELENCHO"
              className="h-8 w-auto brightness-0 invert"
            />
            <span className="text-white font-semibold text-sm">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => <NavLink key={item.path} item={item} />)}
          {isAdmin && (
            <>
              <div className="border-t border-gray-800 my-3" />
              <p className="px-4 text-[10px] uppercase tracking-widest text-gray-600 font-semibold mb-1">Super admin</p>
              {adminNavItems.map((item) => <NavLink key={item.path} item={item} />)}
            </>
          )}
        </nav>

        <div className="p-3 border-t border-gray-800">
          <Link to="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-all duration-200">
            <ArrowLeft size={16} />
            Volver a la tienda
          </Link>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <LayoutDashboard size={20} />
            </button>
            <div className="flex items-center gap-3 ml-auto">
              <div className="flex items-center gap-2.5 text-sm">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <span className="text-gray-700 font-medium hidden sm:block">{user?.name}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
