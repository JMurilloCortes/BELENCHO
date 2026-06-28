import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'

export default function AuthCallback() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  useEffect(() => {
    const token = params.get('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const user = { id: payload.id, email: payload.email || '', name: payload.name || 'Usuario', role: payload.role, avatar: payload.avatar }
        login(user, token)
      } catch {
        // ignore parse error
      }
    }
    navigate('/')
  }, [])

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  )
}
