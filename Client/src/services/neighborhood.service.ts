import api from './api'

export async function getActiveNeighborhoods() {
  const { data } = await api.get('/neighborhoods')
  return data
}
