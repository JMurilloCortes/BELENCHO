import { Link, Outlet, useLocation } from 'react-router-dom'
import { Package, Users, Tag, LayoutDashboard, ShoppingCart, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'

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

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <Link to="/admin" className="flex items-center gap-2 text-white font-bold text-sm">
            <LayoutDashboard size={18} />
            Admin BELENCHO
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path))
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-800'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <>
              <div className="border-t border-gray-800 my-3" />
              {adminNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    pathname === item.path ? 'bg-primary text-white' : 'hover:bg-gray-800'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              ))}
            </>
          )}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <Link to="/" className="flex items-center gap-2 text-sm hover:text-white transition-colors">
            <ArrowLeft size={16} />
            Volver a la tienda
          </Link>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 p-8">
        <Outlet />
      </main>
    </div>
  )
}
