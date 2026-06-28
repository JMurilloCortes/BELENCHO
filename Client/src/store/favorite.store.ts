import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as favoriteService from '../services/favorite.service'
import type { Product } from '../types'

interface FavoriteState {
  items: Product[]
  favoriteIds: Set<string>
  loading: boolean
  loadFavorites: () => Promise<void>
  toggleFavorite: (productId: string) => Promise<void>
  isFavorite: (productId: string) => boolean
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      items: [],
      favoriteIds: new Set(),
      loading: false,

      loadFavorites: async () => {
        set({ loading: true })
        try {
          const favorites = await favoriteService.getFavorites()
          const items = favorites?.map((f: any) => f.product) || []
          set({ items, favoriteIds: new Set(items.map((p: Product) => p.id)) })
        } catch {
          set({ items: [], favoriteIds: new Set() })
        } finally {
          set({ loading: false })
        }
      },

      toggleFavorite: async (productId) => {
        const { isFavorite } = get()
        if (isFavorite(productId)) {
          await favoriteService.removeFavorite(productId)
          const items = get().items.filter((p) => p.id !== productId)
          const favoriteIds = new Set(items.map((p) => p.id))
          set({ items, favoriteIds })
        } else {
          await favoriteService.addFavorite(productId)
          const favorites = await favoriteService.getFavorites()
          const items = favorites?.map((f: any) => f.product) || []
          set({ items, favoriteIds: new Set(items.map((p: Product) => p.id)) })
        }
      },

      isFavorite: (productId) => get().favoriteIds.has(productId),
    }),
    { name: 'belencho-favorites' }
  )
)
