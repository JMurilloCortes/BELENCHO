import api from './api'
import type { Product, Category } from '../types'

export async function getProducts(params?: { search?: string; categoryId?: string; minPrice?: string; maxPrice?: string }) {
  const { data } = await api.get('/products', { params })
  return data as Product[]
}

export async function getProduct(id: string) {
  const { data } = await api.get(`/products/${id}`)
  return data as Product
}

export async function getCategories() {
  const { data } = await api.get('/products/categories')
  return data as Category[]
}
