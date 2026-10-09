import { Lock } from 'lucide-react'
import { useStartPaystack } from '../hooks/useOrders'
import { Button } from '../../../components/ui/Button'
import { ErrorAlert } from '../../../components/ui/Alert'
import { formatNaira } from '../../../lib/format'
import { getErrorMessage } from '../../../services/api/apiError'

interface PaystackPaymentProps {
  orderId: string
  amount: number
  testMode: boolean
}

export function PaystackPayment({ orderId, amount, testMode }: PaystackPaymentProps) {
  const start = useStartPaystack(orderId)
  // Once Paystack's page is ready the browser is already leaving, so keep the button busy.
  const leaving = start.isPending || start.isSuccess

  return (
    <div className="space-y-3">
      {start.error && <ErrorAlert>{getErrorMessage(start.error, "We couldn't open Paystack. Please try again.")}</ErrorAlert>}

      <Button variant="accent" className="w-full py-3" isLoading={leaving} onClick={() => start.mutate()}>
        <Lock className="h-4 w-4" aria-hidden /> Pay {formatNaira(amount)} with Paystack
      </Button>

      <p className="text-xs text-muted">
        You'll pay on Paystack's secure page by card, bank transfer or USSD, then come straight back here.
      </p>

      {testMode && (
        <p className="rounded-md bg-accent-light px-3 py-2 text-xs text-accent-dark">
          Test mode: no real money is charged. Use the test card 4084 0840 8408 4081, any future expiry date and CVV 408.
        </p>
      )}
    </div>
  )
}
