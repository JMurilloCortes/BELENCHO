export interface User {
  id: string
  email: string
  name: string
  role: string
  avatar?: string
  createdAt?: string
  phone?: string
  defaultAddress?: string
  defaultNeighborhoodId?: string
  defaultNeighborhood?: { id: string; name: string }
}

export interface Category {
  id: string
  name: string
  slug: string
}

export interface ProductImage {
  id: string
  url: string
  alt?: string
  order: number
}

export interface ProductVideo {
  id: string
  url: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  transportType?: 'MOTO' | 'TAXI'
  categoryId: string
  category: Category
  images: ProductImage[]
  videos: ProductVideo[]
  reviews: Review[]
  createdAt: string
}

export interface Review {
  id: string
  rating: number
  comment?: string
  userId: string
  user: { name: string; avatar?: string }
  productId: string
  createdAt: string
}

export interface CartItem {
  id: string
  productId: string
  product: Product
  quantity: number
}

export interface Order {
  id: string
  userId: string
  user: { id: string; name: string; email: string }
  customerName: string
  customerEmail: string
  customerPhone: string
  deliveryAddress: string
  deliveryInstructions?: string
  neighborhood?: { id: string; name: string }
  neighborhoodId: string
  deliveryDate?: string
  deliveryTimeSlot?: string
  giftFrom?: string
  giftTo?: string
  giftMessage?: string
  status: 'PENDING' | 'PAID' | 'EN_PREPARACION' | 'LISTA' | 'EN_CAMINO' | 'ENTREGADA' | 'CANCELLED' | 'REFUNDED'
  total: number
  deliveryCost?: number | null
  paymentMethod: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'WOMPI' | 'MERCADOPAGO'
  paymentId?: string
  redirectUrl?: string
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  product: Product
  quantity: number
  price: number
}

export interface Neighborhood {
  id: string
  name: string
  active?: boolean
  motoPrice?: number | null
  taxiPrice?: number | null
  _count?: { orders: number }
}

export interface Favorite {
  id: string
  productId: string
  product: Product
}

export interface HeroSlide {
  id: string
  imageUrl: string
  imageUrlMobile?: string
  altText?: string
  order: number
  active: boolean
}
