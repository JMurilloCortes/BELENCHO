import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { X, Package, Users, Tag, LayoutDashboard, ShoppingCart, ArrowLeft, MapPin, Bell, X as XIcon, Clock, CheckCheck, Trash2, ChevronRight, Menu } from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'
import { useState, useEffect, useRef } from 'react'
import { connectSocket } from '../../services/socket.service'

interface Notification {
  id: string
  customerName: string
  total: number
  createdAt: string
  read: boolean
}

interface NavItem {
  path: string
  icon: any
  label: string
  short?: string
}

const navItems: NavItem[] = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', short: 'Inicio' },
  { path: '/admin/productos', icon: Package, label: 'Productos', short: 'Prod.' },
  { path: '/admin/ordenes', icon: ShoppingCart, label: 'Órdenes', short: 'Ordenes' },
  { path: '/admin/categorias', icon: Tag, label: 'Categorías', short: 'Categ.' },
  { path: '/admin/barrios', icon: MapPin, label: 'Barrios', short: 'Barrios' },
]

const adminOnlyItem: NavItem = { path: '/admin/usuarios', icon: Users, label: 'Usuarios', short: 'Usuarios' }

function timeAgo(dateStr: string) {
  const now = Date.now()
  const diff = now - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Ahora'
  if (mins < 60) return `Hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Hace ${hrs}h`
  const days = Math.floor(hrs / 24)
  return `Hace ${days}d`
}

function isActive(pathname: string, item: NavItem) {
  return pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path))
}

export default function AdminLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'ADMINISTRADOR'

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try { return JSON.parse(localStorage.getItem('adminNotifications') || '[]') } catch { return [] }
  })
  const [showNotifications, setShowNotifications] = useState(false)
  const [toast, setToast] = useState<{ id: string; customerName: string; total: number } | null>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('adminNotifications', JSON.stringify(notifications.slice(0, 50)))
  }, [notifications])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    const socket = connectSocket(token)

    socket.on('new-order', (order: { id: string; customerName: string; total: number; createdAt: string }) => {
      setNotifications((prev) => {
        const updated = [
          { ...order, createdAt: order.createdAt || new Date().toISOString(), read: false },
          ...prev,
        ]
        localStorage.setItem('adminNotifications', JSON.stringify(updated.slice(0, 50)))
        return updated
      })
      setToast(order)

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('¡Nuevo pedido!', {
          body: `${order.customerName} — $${Number(order.total).toLocaleString('es-CO')}`,
          icon: 'https://res.cloudinary.com/dtarklm7p/image/upload/v1782689025/BELENCHO/Logos/Logo_belencho_hm2kbc.jpg',
        })
      }
    })

    return () => {
      socket.off('new-order')
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showNotifications])

  const markAllRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }))
      localStorage.setItem('adminNotifications', JSON.stringify(updated))
      return updated
    })
  }

  const clearAll = () => {
    setNotifications([])
    localStorage.removeItem('adminNotifications')
    setShowNotifications(false)
  }

  const handleNotifClick = (notif: Notification) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      localStorage.setItem('adminNotifications', JSON.stringify(updated))
      return updated
    })
    setShowNotifications(false)
    navigate(`/admin/ordenes/${notif.id}`)
  }

  const NavLink = ({ item, collapsed }: { item: NavItem; collapsed?: boolean }) => {
    const active = isActive(pathname, item)
    return (
      <Link
        to={item.path}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 ${
          collapsed ? 'justify-center p-2.5' : 'px-4 py-2.5'
        } ${
          active
            ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary shadow-sm'
            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
        }`}
        title={collapsed ? item.label : undefined}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0 ${
          active ? 'bg-primary text-white shadow-sm' : 'bg-white/5 text-gray-500'
        }`}>
          <item.icon size={16} />
        </div>
        {!collapsed && <span>{item.label}</span>}
      </Link>
    )
  }

  return (
    <div className="min-h-screen flex bg-gray-50 pb-16 lg:pb-0">
      <aside className={`fixed inset-y-0 left-0 z-40 bg-gray-900 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      } ${
        sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className={`p-4 border-b border-gray-800 flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {sidebarCollapsed ? (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xs">
              A
            </div>
          ) : (
            <>
              <Link to="/admin" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                  A
                </div>
                <span className="text-white font-semibold text-sm">Admin</span>
              </Link>
              <div className="flex items-center gap-1">
                <button onClick={() => setSidebarCollapsed(true)} className="hidden lg:flex p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors" aria-label="Colapsar menú">
                  <Menu size={14} />
                </button>
                <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors" aria-label="Cerrar menú">
                  <X size={16} />
                </button>
              </div>
            </>
          )}
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => <NavLink key={item.path} item={item} collapsed={sidebarCollapsed} />)}
          {isAdmin && (
            <NavLink item={adminOnlyItem} collapsed={sidebarCollapsed} />
          )}
        </nav>

        {!sidebarCollapsed && (
          <div className="p-3 border-t border-gray-800 space-y-1">
            <div className="flex items-center gap-3 px-4 py-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.role}</p>
              </div>
            </div>
            <Link to="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-all duration-200">
              <ArrowLeft size={16} />
              Volver a la tienda
            </Link>
          </div>
        )}

        {sidebarCollapsed && (
          <div className="p-2 border-t border-gray-800">
            <Link to="/" className="flex items-center justify-center p-2.5 rounded-xl text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-all duration-200" title="Volver a la tienda">
              <ArrowLeft size={16} />
            </Link>
          </div>
        )}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg" aria-label="Abrir menú">
              <Menu size={20} />
            </button>
            {sidebarCollapsed && (
              <button onClick={() => setSidebarCollapsed(false)} className="hidden lg:flex p-2 text-gray-600 hover:bg-gray-100 rounded-lg" aria-label="Expandir menú">
                <Menu size={20} />
              </button>
            )}
            <span className="lg:hidden text-sm font-semibold text-gray-800">BELENCHO</span>
            <div className="flex items-center gap-3 ml-auto" ref={notifRef}>
              <div className="relative">
                <button
                  onClick={() => setShowNotifications((v) => !v)}
                  className="relative p-2.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
                  aria-label="Notificaciones"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-gradient-to-br from-red-500 to-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm shadow-red-500/30 animate-fadeIn">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-[360px] sm:w-[420px] bg-white rounded-2xl shadow-2xl shadow-gray-900/10 border border-gray-100 animate-dropdown overflow-hidden">
                    <div className="p-4 pb-3 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                          <Bell size={15} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-800">Notificaciones</h3>
                          {unreadCount > 0 && (
                            <p className="text-[11px] text-gray-400 font-medium">{unreadCount} sin leer</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all text-xs font-medium flex items-center gap-1"
                            title="Marcar todo como leído"
                          >
                            <CheckCheck size={14} />
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            onClick={clearAll}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all text-xs font-medium flex items-center gap-1"
                            title="Limpiar todas"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="max-h-[360px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-6">
                          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                            <Bell size={24} className="text-gray-300" />
                          </div>
                          <p className="text-sm font-semibold text-gray-800">Sin notificaciones</p>
                          <p className="text-xs text-gray-400 mt-1 text-center">Los nuevos pedidos aparecerán aquí</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <button
                            key={notif.id}
                            onClick={() => handleNotifClick(notif)}
                            className={`w-full text-left px-4 py-3.5 flex items-start gap-3 transition-all duration-200 border-b border-gray-50 last:border-b-0 hover:bg-gray-50/80 group ${
                              !notif.read ? 'bg-primary/[0.02]' : ''
                            }`}
                          >
                            <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                              !notif.read
                                ? 'bg-gradient-to-br from-primary to-accent text-white shadow-sm shadow-primary/20'
                                : 'bg-gray-100 text-gray-400'
                            }`}>
                              <ShoppingCart size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-sm leading-snug ${!notif.read ? 'font-semibold text-gray-800' : 'font-medium text-gray-600'}`}>
                                  ¡Nuevo pedido!
                                </p>
                                {!notif.read && (
                                  <span className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5 truncate">{notif.customerName}</p>
                              <div className="flex items-center justify-between mt-1.5">
                                <span className="text-xs font-semibold text-gray-700">
                                  ${Number(notif.total).toLocaleString('es-CO')}
                                </span>
                                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                  <Clock size={10} />
                                  {timeAgo(notif.createdAt)}
                                </div>
                              </div>
                            </div>
                            <ChevronRight size={14} className="mt-1 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
                          </button>
                        ))
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-gray-100 bg-gray-50/50">
                        <Link
                          to="/admin/ordenes"
                          onClick={() => setShowNotifications(false)}
                          className="flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                          Ver todas las órdenes
                          <ChevronRight size={12} />
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <img
                src="https://res.cloudinary.com/dtarklm7p/image/upload/v1782689025/BELENCHO/Logos/Logo_belencho_hm2kbc.jpg"
                alt="BELENCHO"
                className="h-8 w-auto"
              />
            </div>
          </div>
        </header>

        {toast && (
          <div className="fixed top-4 right-4 z-50 animate-fadeIn max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
              <ShoppingCart size={18} className="text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">¡Nuevo pedido!</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{toast.customerName} — ${Number(toast.total).toLocaleString('es-CO')}</p>
            </div>
            <button onClick={() => setToast(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 shrink-0" aria-label="Cerrar">
              <XIcon size={14} />
            </button>
          </div>
        )}

        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      <nav className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-center justify-around h-16 px-1">
          {navItems.map((item) => {
            const active = isActive(pathname, item)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
                  active
                    ? 'text-primary'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                  active ? 'bg-primary/10' : ''
                }`}>
                  <item.icon size={18} />
                </div>
                <span className="text-[10px] font-medium truncate max-w-full">{item.short || item.label}</span>
              </Link>
            )
          })}
          {isAdmin && (
            <Link
              to={adminOnlyItem.path}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-xl transition-all duration-200 min-w-0 flex-1 ${
                isActive(pathname, adminOnlyItem)
                  ? 'text-primary'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                isActive(pathname, adminOnlyItem) ? 'bg-primary/10' : ''
              }`}>
                <Users size={18} />
              </div>
              <span className="text-[10px] font-medium truncate max-w-full">{adminOnlyItem.short}</span>
            </Link>
          )}
        </div>
      </nav>
    </div>
  )
}
