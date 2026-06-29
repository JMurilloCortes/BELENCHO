import api from './api'

export interface TimeSlot {
  slot: string
  capacity: number
  booked: number
  available: number
}

export async function getTimeSlots(date: string) {
  const { data } = await api.get('/delivery/slots', { params: { date } })
  return data as TimeSlot[]
}
