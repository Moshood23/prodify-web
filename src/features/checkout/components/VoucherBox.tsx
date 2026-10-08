import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { TicketPercent, X } from 'lucide-react'
import { checkoutApi } from '../api/checkoutApi'
import { formatNaira } from '../../../lib/format'
import { getErrorMessage } from '../../../services/api/apiError'
import type { VoucherCheck } from '../../../types/order'

interface VoucherBoxProps {
  applied: VoucherCheck | null
  onApply: (voucher: VoucherCheck) => void
  onRemove: () => void
}

// "Have a voucher?" on the checkout summary. The API checks the code again when the order is placed.
export function VoucherBox({ applied, onApply, onRemove }: VoucherBoxProps) {
  const [code, setCode] = useState('')
  const check = useMutation({
    mutationFn: checkoutApi.checkVoucher,
    onSuccess: (voucher) => {
      onApply(voucher)
      setCode('')
    },
  })

  function submit(e: FormEvent) {
    e.preventDefault()
    if (code.trim()) check.mutate(code.trim())
  }

  if (applied) {
    return (
      <div className="flex items-start justify-between gap-2 rounded-lg border border-primary bg-primary-light px-3 py-2 text-sm">
        <div>
          <p className="flex items-center gap-1.5 font-semibold text-primary">
            <TicketPercent className="h-4 w-4" aria-hidden /> {applied.code}: {formatNaira(applied.discount)} off
          </p>
          <p className="text-xs text-muted">{applied.description}</p>
        </div>
        <button onClick={onRemove} className="rounded p-0.5 text-muted hover:text-ink" aria-label={`Remove voucher ${applied.code}`}>
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-1">
      <label htmlFor="voucher-code" className="block text-sm font-medium">
        Voucher code
      </label>
      <div className="flex gap-2">
        <input
          id="voucher-code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase())
            check.reset()
          }}
          maxLength={30}
          placeholder="e.g. WELCOME10"
          aria-invalid={check.error ? true : undefined}
          className="min-w-0 flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm uppercase outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
        />
        <button
          type="submit"
          disabled={!code.trim() || check.isPending}
          className="rounded-lg border border-primary px-3 py-2 text-sm font-semibold text-primary hover:bg-primary-light disabled:opacity-50"
        >
          {check.isPending ? 'Checking...' : 'Apply'}
        </button>
      </div>
      {check.error && <p className="text-xs text-danger">{getErrorMessage(check.error, 'Could not check this code.')}</p>}
    </form>
  )
}
