import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { getOrder } from '../services/payment.service'

type Status = 'loading' | 'PAID' | 'PENDING' | 'CANCELLED' | 'not_found'

export default function PaymentConfirmation() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    if (!orderId) { setStatus('not_found'); return }
    const timer = setTimeout(async () => {
      try {
        const order = await getOrder(orderId)
        setStatus(order.status)
      } catch {
        setStatus('not_found')
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [orderId])

  if (status === 'loading') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">Confirmando tu pago...</h1>
        <p className="text-gray-500 mt-2">Por favor espera un momento</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      {status === 'PAID' && (
        <>
          <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">¡Pago exitoso!</h1>
          <p className="text-gray-500 mb-6">Tu pedido ha sido confirmado</p>
        </>
      )}
      {status === 'PENDING' && (
        <>
          <Clock size={64} className="mx-auto mb-4 text-yellow-500" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Pago pendiente</h1>
          <p className="text-gray-500 mb-6">Estamos esperando la confirmación del pago</p>
        </>
      )}
      {status === 'CANCELLED' && (
        <>
          <XCircle size={64} className="mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Pago cancelado</h1>
          <p className="text-gray-500 mb-6">El pago no pudo ser procesado</p>
        </>
      )}
      {status === 'not_found' && (
        <>
          <XCircle size={64} className="mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Orden no encontrada</h1>
          <p className="text-gray-500 mb-6">No pudimos encontrar tu orden</p>
        </>
      )}
      <div className="flex gap-3 justify-center">
        <Link to="/" className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium">Volver a inicio</Link>
        <Link to="/carrito" className="border px-6 py-2.5 rounded-lg text-sm font-medium text-gray-600">Ir al carrito</Link>
      </div>
    </div>
  )
}
