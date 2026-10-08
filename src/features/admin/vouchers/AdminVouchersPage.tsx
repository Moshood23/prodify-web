import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TicketPercent } from 'lucide-react'
import { useCreateVoucher, useUpdateVoucher, useVouchers } from './hooks'
import { voucherSchema, type VoucherValues } from './voucher.schema'
import { Button } from '../../../components/ui/Button'
import { TextField } from '../../../components/ui/TextField'
import { SelectField } from '../../../components/ui/SelectField'
import { ErrorAlert } from '../../../components/ui/Alert'
import { formatNaira } from '../../../lib/format'
import { useToastStore } from '../../../store/toastStore'
import { applyServerFieldErrors, getErrorMessage } from '../../../services/api/apiError'
import type { Voucher } from '../../../types/voucher'

const typeOptions = [
  { value: 'Percent', label: 'Percentage off the items' },
  { value: 'Fixed', label: 'Naira off the items' },
]

const describeDiscount = (v: Voucher) => (v.discountType === 'Percent' ? `${v.value}% off` : `${formatNaira(v.value)} off`)

// Create a new voucher, or edit one (the code can't change once orders use it).
function VoucherForm({ editing, onDone }: { editing: Voucher | null; onDone: () => void }) {
  const showToast = useToastStore((s) => s.show)
  const create = useCreateVoucher()
  const update = useUpdateVoucher()
  const saving = editing ? update : create

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<VoucherValues>({
    resolver: zodResolver(voucherSchema),
    defaultValues: editing
      ? {
          code: editing.code,
          description: editing.description,
          discountType: editing.discountType,
          value: String(editing.value),
          minOrderAmount: String(editing.minOrderAmount),
        }
      : { code: '', description: '', discountType: 'Percent', value: '', minOrderAmount: '0' },
  })
  const isPercent = useWatch({ control, name: 'discountType' }) === 'Percent'

  function submit(values: VoucherValues) {
    const input = {
      description: values.description,
      discountType: values.discountType,
      value: Number(values.value),
      minOrderAmount: Number(values.minOrderAmount),
    }
    const fields = ['code', 'description', 'discountType', 'value', 'minOrderAmount'] as const
    const onError = (e: unknown) => applyServerFieldErrors(e, fields, setError)

    if (editing) {
      update.mutate(
        { id: editing.id, isActive: editing.isActive, ...input },
        { onSuccess: () => (showToast({ kind: 'success', message: `${editing.code} saved` }), onDone()), onError },
      )
    } else {
      const code = values.code.toUpperCase()
      create.mutate(
        { code, ...input },
        { onSuccess: () => (showToast({ kind: 'success', message: `${code} created` }), onDone()), onError },
      )
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-3">
      {saving.error && Object.keys(errors).length === 0 && (
        <ErrorAlert>{getErrorMessage(saving.error, 'Could not save the voucher.')}</ErrorAlert>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          label="Code"
          disabled={!!editing}
          style={{ textTransform: 'uppercase' }}
          hint={editing ? "The code can't be changed." : 'What customers type, e.g. WELCOME10.'}
          error={errors.code?.message}
          {...register('code')}
        />
        <TextField
          label="Description"
          hint="Shown to the customer at checkout."
          error={errors.description?.message}
          {...register('description')}
        />
        <SelectField label="Discount" options={typeOptions} error={errors.discountType?.message} {...register('discountType')} />
        <TextField
          label={isPercent ? 'Percentage (%)' : 'Amount (naira)'}
          inputMode="decimal"
          hint={isPercent ? 'Up to 90.' : 'Never more than the items themselves.'}
          error={errors.value?.message}
          {...register('value')}
        />
        <TextField
          label="Minimum order (naira)"
          inputMode="decimal"
          hint="The items must add up to this. 0 = any order. Delivery doesn't count."
          error={errors.minOrderAmount?.message}
          {...register('minOrderAmount')}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" isLoading={saving.isPending}>
          {editing ? 'Save changes' : 'Create voucher'}
        </Button>
        {editing && (
          <Button type="button" variant="outline" onClick={onDone}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}

export function AdminVouchersPage() {
  const { data: vouchers, isLoading, error } = useVouchers()
  const update = useUpdateVoucher()
  const showToast = useToastStore((s) => s.show)
  const [editing, setEditing] = useState<Voucher | null>(null)

  function toggle(v: Voucher) {
    update.mutate(
      {
        id: v.id,
        description: v.description,
        discountType: v.discountType,
        value: v.value,
        minOrderAmount: v.minOrderAmount,
        isActive: !v.isActive,
      },
      {
        onSuccess: () => showToast({ kind: 'success', message: v.isActive ? `${v.code} switched off` : `${v.code} switched on` }),
        onError: (e) => showToast({ kind: 'error', message: getErrorMessage(e, 'Could not change the voucher.') }),
      },
    )
  }

  return (
    <div className="max-w-4xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Vouchers</h1>
        <p className="text-sm text-muted">
          Codes customers enter at checkout. Prodify pays the discount, so sellers are paid in full. Switch a code off to stop it.
        </p>
      </div>

      <section className="space-y-3 rounded-xl border border-border bg-white p-4 sm:p-5">
        <h2 className="flex items-center gap-2 font-bold">
          <TicketPercent className="h-4 w-4 text-primary" aria-hidden /> {editing ? `Edit ${editing.code}` : 'New voucher'}
        </h2>
        <VoucherForm key={editing?.id ?? 'new'} editing={editing} onDone={() => setEditing(null)} />
      </section>

      <section className="rounded-xl border border-border bg-white">
        {isLoading ? (
          <div className="m-4 h-24 animate-pulse rounded-lg bg-surface" aria-busy="true" aria-label="Loading vouchers" />
        ) : error ? (
          <div className="p-4">
            <ErrorAlert>{getErrorMessage(error, 'Could not load vouchers.')}</ErrorAlert>
          </div>
        ) : !vouchers || vouchers.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted">No vouchers yet. Create one above.</p>
        ) : (
          <ul className="divide-y divide-border">
            {vouchers.map((v) => (
              <li key={v.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold">{v.code}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${v.isActive ? 'bg-primary-light text-primary' : 'bg-surface text-muted'}`}
                    >
                      {v.isActive ? 'Active' : 'Off'}
                    </span>
                  </p>
                  <p className="text-sm text-muted">{v.description}</p>
                </div>
                <div className="text-sm">
                  <p className="font-semibold">{describeDiscount(v)}</p>
                  <p className="text-muted">{v.minOrderAmount > 0 ? `From ${formatNaira(v.minOrderAmount)}` : 'Any order'}</p>
                </div>
                <p className="w-20 text-sm text-muted">
                  Used {v.timesUsed} {v.timesUsed === 1 ? 'time' : 'times'}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setEditing(v)}>
                    Edit
                  </Button>
                  <Button variant={v.isActive ? 'outline' : 'primary'} onClick={() => toggle(v)} disabled={update.isPending}>
                    {v.isActive ? 'Switch off' : 'Switch on'}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
