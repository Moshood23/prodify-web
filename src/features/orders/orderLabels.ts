import type { OrderStatus, PaymentMethod } from '../../types/order'

interface PaymentStatusProps {
  isPaid: boolean
  paymentMethod: PaymentMethod
  status: OrderStatus
}

export function paymentStatusLabel({ isPaid, paymentMethod, status }: PaymentStatusProps): string {
  if (isPaid) return 'Paid'
  if (status === 'Cancelled') return 'Not paid'
  return paymentMethod === 'PayOnDelivery' ? 'Pay on delivery' : 'Awaiting payment'
}