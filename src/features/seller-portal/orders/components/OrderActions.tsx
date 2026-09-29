import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, PackageCheck, Truck, XCircle } from 'lucide-react'
import { useChangeSellerOrderStatus } from '../hooks'
import { cancelSchema, shipSchema, type CancelFormValues, type ShipFormValues } from '../../validation/sellerOrder.schema'
import { Button } from '../../../../components/ui/Button'
import { TextField } from '../../../../components/ui/TextField'
import { TextArea } from '../../../../components/ui/TextArea'
import { ErrorAlert } from '../../../../components/ui/Alert'
import { useToastStore } from '../../../../store/toastStore'
import { applyServerFieldErrors, getErrorMessage } from '../../../../services/api/apiError'
import type { SellerOrderDetails, SellerOrderStatusChange } from '../../../../types/sellerOrder'

const carriers = ['Own rider', 'GIG Logistics', 'Kwik Delivery', 'DHL', 'Red Star Express']

function ShipForm({ order }: { order: SellerOrderDetails }) {
  const showToast = useToastStore((s) => s.show)
  const change = useChangeSellerOrderStatus(order.id)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ShipFormValues>({ resolver: zodResolver(shipSchema), mode: 'onTouched', defaultValues: { carrier: '', trackingNumber: '' } })

  function submit(values: ShipFormValues) {
    change.mutate(
      { status: 'Shipped', carrier: values.carrier, trackingNumber: values.trackingNumber || undefined },
      {
        onSuccess: () => showToast({ kind: 'success', message: 'Marked as shipped' }),
        onError: (e) => applyServerFieldErrors(e, ['carrier', 'trackingNumber'] as const, setError),
      },
    )
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-3">
      {change.error && !errors.carrier && !errors.trackingNumber && <ErrorAlert>{getErrorMessage(change.error)}</ErrorAlert>}
      <TextField label="Delivered by" list="carriers" placeholder="e.g. Own rider, GIG Logistics" error={errors.carrier?.message} {...register('carrier')} />
      <datalist id="carriers">
        {carriers.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <TextField label="Tracking number (optional)" error={errors.trackingNumber?.message} {...register('trackingNumber')} />
      <Button type="submit" isLoading={change.isPending} className="w-full">
        <Truck className="h-4 w-4" aria-hidden /> Mark as shipped
      </Button>
    </form>
  )
}

function CancelForm({ order, onClose }: { order: SellerOrderDetails; onClose: () => void }) {
  const showToast = useToastStore((s) => s.show)
  const change = useChangeSellerOrderStatus(order.id)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CancelFormValues>({ resolver: zodResolver(cancelSchema), mode: 'onTouched', defaultValues: { reason: '' } })

  function submit(values: CancelFormValues) {
    change.mutate(
      { status: 'Cancelled', reason: values.reason },
      {
        onSuccess: () => showToast({ kind: 'success', message: 'Order cancelled. The items are back in stock.' }),
        onError: (e) => applyServerFieldErrors(e, ['reason'] as const, setError),
      },
    )
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-3 rounded-lg bg-red-50 p-3">
      {change.error && !errors.reason && <ErrorAlert>{getErrorMessage(change.error)}</ErrorAlert>}
      <TextArea label="Why are you cancelling?" rows={3} placeholder="e.g. Out of stock" hint="The customer will see this." error={errors.reason?.message} {...register('reason')} />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="danger" isLoading={change.isPending}>
          Cancel order
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Keep order
        </Button>
      </div>
    </form>
  )
}

// One button for the next step, e.g. "Confirm order".
function StepButton({ order, change, label, icon, successMessage }: { order: SellerOrderDetails; change: SellerOrderStatusChange; label: string; icon: ReactNode; successMessage: string }) {
  const showToast = useToastStore((s) => s.show)
  const mutation = useChangeSellerOrderStatus(order.id)

  return (
    <div className="space-y-2">
      {mutation.error && <ErrorAlert>{getErrorMessage(mutation.error)}</ErrorAlert>}
      <Button
        className="w-full"
        isLoading={mutation.isPending}
        onClick={() => mutation.mutate(change, { onSuccess: () => showToast({ kind: 'success', message: successMessage }) })}
      >
        {icon} {label}
      </Button>
    </div>
  )
}

const nextStepHelp = {
  Pending: 'Check that you have every item, then confirm the order.',
  Confirmed: 'Pack the items securely, then mark the order as packed.',
  Packed: 'Hand the package to a rider or courier, then mark it as shipped.',
  Shipped: 'Once the customer has received the package, mark it as delivered.',
}

export function OrderActions({ order }: { order: SellerOrderDetails }) {
  const [cancelling, setCancelling] = useState(false)
  const hasStep = order.canConfirm || order.canPack || order.canShip || order.canDeliver
  const help = nextStepHelp[order.status as keyof typeof nextStepHelp]

  if (!hasStep && !order.canCancel) {
    return (
      <section className="rounded-xl border border-border bg-white p-4 text-sm text-muted">
        {order.status === 'Delivered' && 'This order is complete.'}
        {order.status === 'Cancelled' && 'This order was cancelled.'}
      </section>
    )
  }

  return (
    <section className="space-y-3 rounded-xl border-2 border-primary bg-white p-4">
      <h2 className="font-bold">Next step</h2>
      {help && <p className="text-sm text-muted">{help}</p>}

      {order.canConfirm && (
        <StepButton order={order} change={{ status: 'Confirmed' }} label="Confirm order" icon={<CheckCircle2 className="h-4 w-4" aria-hidden />} successMessage="Order confirmed" />
      )}
      {order.canPack && (
        <StepButton order={order} change={{ status: 'Packed' }} label="Mark as packed" icon={<PackageCheck className="h-4 w-4" aria-hidden />} successMessage="Marked as packed" />
      )}
      {order.canShip && <ShipForm order={order} />}
      {order.canDeliver && (
        <StepButton order={order} change={{ status: 'Delivered' }} label="Mark as delivered" icon={<CheckCircle2 className="h-4 w-4" aria-hidden />} successMessage="Marked as delivered" />
      )}

      {order.isPaid && order.canCancel && order.paymentMethod === 'Card' && (
        <p className="text-xs text-muted">This order is paid. If you cancel it, the customer gets their money back automatically.</p>
      )}
      {order.canCancel &&
        (cancelling ? (
          <CancelForm order={order} onClose={() => setCancelling(false)} />
        ) : (
          <button onClick={() => setCancelling(true)} className="flex items-center gap-1.5 text-sm font-semibold text-danger hover:underline">
            <XCircle className="h-4 w-4" aria-hidden /> Can't fulfil this order? Cancel it
          </button>
        ))}
    </section>
  )
}