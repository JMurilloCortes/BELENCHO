import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as favoriteService from '../services/favorite.service'
import type { Product } from '../types'

interface FavoriteState {
  items: Product[]
  loading: boolean
  loadFavorites: () => Promise<void>
  toggleFavorite: (productId: string) => Promise<void>
  isFavorite: (productId: string) => boolean
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,

      loadFavorites: async () => {
        set({ loading: true })
        try {
          const favorites = await favoriteService.getFavorites()
          const items = favorites?.map((f: any) => f.product) || []
          set({ items })
        } catch {
          set({ items: [] })
        } finally {
          set({ loading: false })
        }
      },

      toggleFavorite: async (productId) => {
        const { items } = get()
        const exists = items.some((p) => p.id === productId)
        if (exists) {
          await favoriteService.removeFavorite(productId)
          set({ items: items.filter((p) => p.id !== productId) })
        } else {
          await favoriteService.addFavorite(productId)
          const favorites = await favoriteService.getFavorites()
          set({ items: favorites?.map((f: any) => f.product) || [] })
        }
      },

      isFavorite: (productId) => get().items.some((p) => p.id === productId),
    }),
    { name: 'belencho-favorites' }
  )
)
