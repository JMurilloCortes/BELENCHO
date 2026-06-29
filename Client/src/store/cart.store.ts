import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as cartService from '../services/cart.service'
import type { CartItem, Product } from '../types'

interface CartState {
  items: CartItem[]
  loading: boolean
  itemCount: number
  loadCart: () => Promise<void>
  addItem: (productId: string, quantity?: number, product?: Product) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      itemCount: 0,

      loadCart: async () => {
        set({ loading: true })
        try {
          const cart = await cartService.getCart()
          const items = cart?.items || []
          set({ items, itemCount: items.reduce((sum: number, i: CartItem) => sum + i.quantity, 0) })
        } catch {
          set({ items: [], itemCount: 0 })
        } finally {
          set({ loading: false })
        }
      },

      addItem: async (productId, quantity = 1, product) => {
        const prev = get().items
        const prevCount = get().itemCount
        if (product) {
          set((s) => {
            const existing = s.items.find((i) => i.productId === productId)
            if (existing) {
              const items = s.items.map((i) =>
                i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i
              )
              return { items, itemCount: items.reduce((sum, i) => sum + i.quantity, 0) }
            }
            const tempItem: CartItem = {
              id: `temp-${productId}`,
              productId,
              product,
              quantity,
            }
            return { items: [...s.items, tempItem], itemCount: s.itemCount + quantity }
          })
        }
        try {
          const cart = await cartService.addToCart(productId, quantity)
          const items = cart?.items || []
          set({ items, itemCount: items.reduce((sum: number, i: CartItem) => sum + i.quantity, 0) })
        } catch {
          set({ items: prev, itemCount: prevCount })
          throw new Error()
        }
      },

      updateQuantity: async (itemId, quantity) => {
        const prev = get().items
        if (quantity <= 0) {
          set((s) => {
            const items = s.items.filter((i) => i.id !== itemId)
            return { items, itemCount: items.reduce((sum, i) => sum + i.quantity, 0) }
          })
          try {
            await cartService.removeFromCart(itemId)
          } catch {
            set({ items: prev, itemCount: prev.reduce((sum, i) => sum + i.quantity, 0) })
          }
        } else {
          set((s) => {
            const items = s.items.map((i) => (i.id === itemId ? { ...i, quantity } : i))
            return { items, itemCount: items.reduce((sum, i) => sum + i.quantity, 0) }
          })
          try {
            await cartService.updateCartItem(itemId, quantity)
          } catch {
            set({ items: prev, itemCount: prev.reduce((sum, i) => sum + i.quantity, 0) })
          }
        }
      },

      removeItem: async (itemId) => {
        const prev = get().items
        const prevCount = get().itemCount
        set((s) => {
          const items = s.items.filter((i) => i.id !== itemId)
          return { items, itemCount: items.reduce((sum, i) => sum + i.quantity, 0) }
        })
        try {
          await cartService.removeFromCart(itemId)
        } catch {
          set({ items: prev, itemCount: prevCount })
          throw new Error()
        }
      },

      clearCart: () => set({ items: [], itemCount: 0 }),
    }),
    { name: 'belencho-cart' }
  )
)
