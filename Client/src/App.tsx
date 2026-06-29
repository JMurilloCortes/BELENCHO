import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'
import LoginPage from './pages/Login'
import Register from './pages/Register'
import CartPage from './pages/CartPage'
import FavoritesPage from './pages/FavoritesPage'
import Profile from './pages/Profile'
import MyOrders from './pages/MyOrders'
import OrderDetail from './pages/OrderDetail'
import Checkout from './pages/Checkout'
import PaymentConfirmation from './pages/PaymentConfirmation'
import AuthCallback from './pages/AuthCallback'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminOrderDetail from './pages/admin/AdminOrderDetail'
import AdminCategories from './pages/admin/AdminCategories'
import AdminNeighborhoods from './pages/admin/AdminNeighborhoods'
import AdminUsers from './pages/admin/AdminUsers'
import { useAuthStore } from './store/auth.store'

function AppContent() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage)

  useEffect(() => {
    loadFromStorage()
  }, [])

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/favoritos" element={<FavoritesPage />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/pedidos" element={<MyOrders />} />
        <Route path="/pedidos/:id" element={<OrderDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/pago/confirmacion" element={<PaymentConfirmation />} />
      </Route>
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="productos" element={<AdminProducts />} />
        <Route path="ordenes" element={<AdminOrders />} />
        <Route path="ordenes/:id" element={<AdminOrderDetail />} />
        <Route path="categorias" element={<AdminCategories />} />
        <Route path="barrios" element={<AdminNeighborhoods />} />
        <Route path="usuarios" element={<AdminUsers />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
