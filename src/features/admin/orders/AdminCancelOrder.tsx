import { useState } from 'react'
import { XCircle } from 'lucide-react'
import { useCancelAdminOrder } from '../hooks'
import { Button } from '../../../components/ui/Button'
import { TextArea } from '../../../components/ui/TextArea'
import { ErrorAlert } from '../../../components/ui/Alert'
import { useToastStore } from '../../../store/toastStore'
import { getErrorMessage } from '../../../services/api/apiError'
import { formatNaira } from '../../../lib/format'
import type { AdminOrder } from '../../../types/admin'

// Stops every part of the order that hasn't shipped. Card payments are refunded.
export function AdminCancelOrder({ data }: { data: AdminOrder }) {
  const { order } = data
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [touched, setTouched] = useState(false)
  const cancel = useCancelAdminOrder(order.id)
  const showToast = useToastStore((s) => s.show)

  if (!data.canCancel) return null
  
    // Everything left is stopped, so the rest of the payment comes back, delivery included.
  const refund = order.isPaid && order.paymentMethod === 'Card' ? order.total - order.refundedAmount : 0
  const reasonError = touched && !reason.trim() ? 'Tell the customer why the order is being cancelled.' : undefined

  function submit() {
    setTouched(true)
    if (!reason.trim()) return
    cancel.mutate(reason.trim(), {
      onSuccess: () => {
        showToast({ kind: 'success', message: refund > 0 ? `Order cancelled and ${formatNaira(refund)} refunded` : 'Order cancelled' })
        setOpen(false)
      },
    })
  }

  return (
    <section className="space-y-3 rounded-xl border border-border bg-white p-4 text-sm">
      <h2 className="flex items-center gap-2 font-bold">
        <XCircle className="h-4 w-4 text-danger" aria-hidden /> Cancel order
      </h2>
      {!open ? (
        <>
          <p className="text-muted">
            Stops every part that hasn't been shipped yet{refund > 0 && ` and refunds ${formatNaira(refund)} to the customer's card`}.
          </p>
          <Button variant="outline" className="w-full border-danger text-danger hover:bg-red-50" onClick={() => setOpen(true)}>
            {refund > 0 ? 'Cancel and refund' : 'Cancel order'}
          </Button>
        </>
      ) : (
        <>
          {cancel.error && <ErrorAlert>{getErrorMessage(cancel.error, 'Could not cancel the order.')}</ErrorAlert>}
          <TextArea
            label="Reason (the customer will see this)"
            rows={3}
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => setTouched(true)}
            error={reasonError}
            placeholder="e.g. The customer asked us to cancel"
          />
          <div className="flex flex-wrap gap-2">
            <Button variant="danger" isLoading={cancel.isPending} onClick={submit}>
              {refund > 0 ? `Cancel and refund ${formatNaira(refund)}` : 'Cancel order'}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={cancel.isPending}>
              Keep order
            </Button>
          </div>
        </>
      )}
    </section>
  )
}