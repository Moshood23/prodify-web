import { useState, type FormEvent } from 'react'
import { Banknote } from 'lucide-react'
import { useRequestPayout } from '../hooks'
import { amountPattern } from '../payout.schema'
import { Button } from '../../../components/ui/Button'
import { TextField } from '../../../components/ui/TextField'
import { useToastStore } from '../../../store/toastStore'
import { formatNaira } from '../../../lib/format'
import { getErrorMessage } from '../../../services/api/apiError'
import type { Earnings } from '../../../types/payout'

// Why a payout can't be requested right now, if it can't.
function blockedReason(earnings: Earnings): string | null {
  if (earnings.hasOpenRequest) return "You have a payout waiting to be paid. You can ask again once it's done."
  if (!earnings.account) return 'Add your bank account first.'
  if (earnings.available < earnings.minimumPayout)
    return `You can withdraw once you have at least ${formatNaira(earnings.minimumPayout)} available.`
  return null
}

export function RequestPayoutCard({ earnings }: { earnings: Earnings }) {
  const showToast = useToastStore((s) => s.show)
  const request = useRequestPayout()
  const [amount, setAmount] = useState(String(Math.floor(earnings.available)))
  const [error, setError] = useState<string>()
  const blocked = blockedReason(earnings)

  function submit(e: FormEvent) {
    e.preventDefault()
    const text = amount.replace(/,/g, '').trim()
    const value = Number(text)
    if (!amountPattern.test(text)) return setError('Enter an amount in naira, e.g. 25000.')
    if (value < earnings.minimumPayout) return setError(`The smallest payout is ${formatNaira(earnings.minimumPayout)}.`)
    if (value > earnings.available) return setError(`You can withdraw up to ${formatNaira(earnings.available)}.`)

    request.mutate(value, {
      onSuccess: () => showToast({ kind: 'success', message: `Payout of ${formatNaira(value)} requested` }),
      onError: (err) => setError(getErrorMessage(err, 'Could not request the payout.')),
    })
  }

  return (
    <section className="space-y-3 rounded-xl border border-border bg-white p-4 sm:p-5">
      <h2 className="flex items-center gap-2 font-bold">
        <Banknote className="h-4 w-4 text-primary" aria-hidden /> Withdraw
      </h2>
      {blocked ? (
        <p className="rounded-md bg-surface px-3 py-2 text-sm text-muted">{blocked}</p>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-3">
          <TextField
            label={'Amount (\u20A6)'}
            inputMode="decimal"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              setError(undefined)
            }}
            hint={`Up to ${formatNaira(earnings.available)}. Paid to ${earnings.account!.bankName} ${earnings.account!.accountNumber}.`}
            error={error}
          />
          <Button type="submit" isLoading={request.isPending}>
            Request payout
          </Button>
        </form>
      )}
      <p className="text-xs text-muted">We usually pay within 2 working days and email you the bank reference.</p>
    </section>
  )
}
