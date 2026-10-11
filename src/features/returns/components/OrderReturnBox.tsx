import { useState, type FormEvent } from 'react'
import { RotateCcw } from 'lucide-react'
import { useEscalateReturn, useRequestReturn } from '../hooks'
import { reasonOptions } from '../returnLabels'
import { ReturnStatusBadge } from './ReturnStatusBadge'
import { ReturnSummary } from './ReturnSummary'
import { Button } from '../../../components/ui/Button'
import { SelectField } from '../../../components/ui/SelectField'
import { TextArea } from '../../../components/ui/TextArea'
import { ErrorAlert } from '../../../components/ui/Alert'
import { useToastStore } from '../../../store/toastStore'
import { formatDate, formatNaira } from '../../../lib/format'
import { getErrorMessage, getFieldErrors } from '../../../services/api/apiError'
import type { SellerOrder } from '../../../types/order'
import type { ReturnReason } from '../../../types/returns'

// Choose the items, how many, and why.
function ReturnForm({ part, onDone }: { part: SellerOrder; onDone: () => void }) {
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [reason, setReason] = useState<ReturnReason | ''>('')
  const [details, setDetails] = useState('')
  const [error, setError] = useState<string>()
  const request = useRequestReturn()
  const showToast = useToastStore((s) => s.show)

  const chosen = part.items.filter((i) => (quantities[i.productVariantId] ?? 0) > 0)
  const value = chosen.reduce((sum, i) => sum + i.unitPrice * quantities[i.productVariantId], 0)

  function setQuantity(variantId: string, quantity: number) {
    setQuantities((q) => ({ ...q, [variantId]: quantity }))
    setError(undefined)
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (chosen.length === 0) return setError('Choose at least one item to return.')
    if (!reason) return setError('Choose why you are returning it.')
    if (reason === 'Other' && !details.trim()) return setError("Tell us what's wrong.")

    request.mutate(
      {
        sellerOrderId: part.id,
        reason,
        details: details.trim() || undefined,
        items: chosen.map((i) => ({ productVariantId: i.productVariantId, quantity: quantities[i.productVariantId] })),
      },
      {
        onSuccess: () => {
          showToast({ kind: 'success', message: 'Return requested. The seller will reply soon.' })
          onDone()
        },
        onError: (err) => setError(Object.values(getFieldErrors(err))[0]?.[0] ?? getErrorMessage(err)),
      },
    )
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-3 rounded-lg border border-border p-3">
      <fieldset className="space-y-2">
        <legend className="mb-1 text-sm font-semibold">Which items?</legend>
        {part.items.map((item) => {
          const quantity = quantities[item.productVariantId] ?? 0
          return (
            <div key={item.productVariantId} className="flex flex-wrap items-center gap-2 text-sm">
              <label className="flex min-w-0 flex-1 items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={quantity > 0}
                  onChange={(e) => setQuantity(item.productVariantId, e.target.checked ? item.quantity : 0)}
                />
                <span className="min-w-0">{item.productName}</span>
              </label>
              {quantity > 0 && item.quantity > 1 && (
                <select
                  aria-label={`How many ${item.productName}`}
                  className="rounded-md border border-border bg-white px-2 py-1 text-sm"
                  value={quantity}
                  onChange={(e) => setQuantity(item.productVariantId, Number(e.target.value))}
                >
                  {Array.from({ length: item.quantity }, (_, n) => n + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} of {item.quantity}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )
        })}
      </fieldset>

      <SelectField
        label="Why are you returning it?"
        placeholder="Choose a reason"
        options={reasonOptions}
        value={reason}
        onChange={(e) => {
          setReason(e.target.value as ReturnReason)
          setError(undefined)
        }}
      />
      <TextArea
        label={reason === 'Other' ? 'What is wrong?' : 'Anything else the seller should know? (optional)'}
        rows={3}
        maxLength={1000}
        value={details}
        onChange={(e) => setDetails(e.target.value)}
      />

      {error && <ErrorAlert>{error}</ErrorAlert>}
      {value > 0 && <p className="text-sm text-muted">Items worth {formatNaira(value)}. Delivery is not refunded.</p>}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" isLoading={request.isPending}>
          Request return
        </Button>
        <Button type="button" variant="outline" onClick={onDone} disabled={request.isPending}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

// After the seller says no, the customer can ask Prodify to decide.
function EscalateForm({ returnId }: { returnId: string }) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const escalate = useEscalateReturn()
  const showToast = useToastStore((s) => s.show)

  if (!open) {
    return (
      <Button variant="outline" className="py-1.5" onClick={() => setOpen(true)}>
        Ask Prodify to review
      </Button>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        escalate.mutate(
          { id: returnId, note: note.trim() || undefined },
          { onSuccess: () => showToast({ kind: 'success', message: "Sent to Prodify. We'll let you know what we decide." }) },
        )
      }}
      className="space-y-2"
    >
      <TextArea label="Why do you disagree? (optional)" rows={3} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
      {escalate.error && <ErrorAlert>{getErrorMessage(escalate.error, 'Could not send it to Prodify.')}</ErrorAlert>}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" isLoading={escalate.isPending}>
          Send to Prodify
        </Button>
        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={escalate.isPending}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

// Shown under a delivered part of an order: start a return, or follow one.
export function OrderReturnBox({ part }: { part: SellerOrder }) {
  const [returning, setReturning] = useState(false)

  if (part.return) {
    return (
      <div className="mt-3 space-y-2 rounded-lg bg-surface p-3">
        <p className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold">
          <span className="flex items-center gap-1.5">
            <RotateCcw className="h-4 w-4 text-primary" aria-hidden /> Return
          </span>
          <ReturnStatusBadge status={part.return.status} />
        </p>
        <ReturnSummary request={part.return} />
        {part.return.status === 'Rejected' && <EscalateForm returnId={part.return.id} />}
      </div>
    )
  }

  if (!part.canReturn) return null

  return (
    <div className="mt-3 space-y-2">
      {returning ? (
        <ReturnForm part={part} onDone={() => setReturning(false)} />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="text-muted">
            {part.returnDeadline && `You can return these items until ${formatDate(part.returnDeadline)}.`}
          </span>
          <button onClick={() => setReturning(true)} className="flex items-center gap-1 font-semibold text-primary hover:underline">
            <RotateCcw className="h-4 w-4" aria-hidden /> Return items
          </button>
        </div>
      )}
    </div>
  )
}
