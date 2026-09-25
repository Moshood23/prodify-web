import { useState, type FormEvent } from 'react'
import { Lock } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { TextField } from '../../../components/ui/TextField'
import { formatNaira } from '../../../lib/format'

// Test mode: the API uses a simulated gateway, so no card details are sent anywhere.
// This card number makes the simulated payment fail, to try the "declined" path.
export const DECLINED_TEST_CARD = '4000 0000 0000 0002'

interface CardPaymentFormProps {
  amount: number
  isPaying: boolean
  onPay: (paymentMethodToken: string) => void
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, '')
}

export function CardPaymentForm({ amount, isPaying, onPay }: CardPaymentFormProps) {
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242')
  const [expiry, setExpiry] = useState('12/30')
  const [cvv, setCvv] = useState('123')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (digitsOnly(cardNumber).length < 12 || !/^\d{2}\/\d{2}$/.test(expiry) || digitsOnly(cvv).length < 3) {
      setError('Check the card number, expiry date (MM/YY) and CVV.')
      return
    }

    setError(null)
    // A real gateway would turn the card into a token in the browser; we pretend.
    const declined = digitsOnly(cardNumber) === digitsOnly(DECLINED_TEST_CARD)
    onPay(declined ? 'FAIL-test-card' : `tok_test_${digitsOnly(cardNumber).slice(-4)}`)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <TextField
        label="Card number"
        inputMode="numeric"
        autoComplete="cc-number"
        value={cardNumber}
        onChange={(e) => setCardNumber(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Expiry (MM/YY)" autoComplete="cc-exp" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
        <TextField label="CVV" inputMode="numeric" autoComplete="cc-csc" value={cvv} onChange={(e) => setCvv(e.target.value)} />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="submit" variant="accent" className="w-full py-3" isLoading={isPaying}>
        <Lock className="h-4 w-4" aria-hidden /> Pay {formatNaira(amount)}
      </Button>

      <p className="rounded-md bg-accent-light px-3 py-2 text-xs text-accent-dark">
        Test mode: no real money is charged. Use {DECLINED_TEST_CARD} to see a declined payment.
      </p>
    </form>
  )
}