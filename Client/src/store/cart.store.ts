import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as cartService from '../services/cart.service'
import type { CartItem } from '../types'

interface CartState {
  items: CartItem[]
  loading: boolean
  itemCount: number
  loadCart: () => Promise<void>
  addItem: (productId: string, quantity?: number) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, _get) => ({
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

      addItem: async (productId, quantity = 1) => {
        const cart = await cartService.addToCart(productId, quantity)
        const items = cart?.items || []
        set({ items, itemCount: items.reduce((sum: number, i: CartItem) => sum + i.quantity, 0) })
      },

      updateQuantity: async (itemId, quantity) => {
        const prev = _get().items
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
        const cart = await cartService.removeFromCart(itemId)
        const items = cart?.items || []
        set({ items, itemCount: items.reduce((sum: number, i: CartItem) => sum + i.quantity, 0) })
      },

      clearCart: () => set({ items: [], itemCount: 0 }),
    }),
    { name: 'belencho-cart' }
  )
)
