import api from './api'

export async function getHeroSlides() {
  const { data } = await api.get('/hero-slides')
  return data
}
