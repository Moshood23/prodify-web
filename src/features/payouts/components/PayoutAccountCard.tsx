import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Landmark, Pencil } from 'lucide-react'
import { useSavePayoutAccount } from '../hooks'
import { payoutAccountSchema, type PayoutAccountValues } from '../payout.schema'
import { Button } from '../../../components/ui/Button'
import { TextField } from '../../../components/ui/TextField'
import { ErrorAlert } from '../../../components/ui/Alert'
import { useToastStore } from '../../../store/toastStore'
import { applyServerFieldErrors, getErrorMessage } from '../../../services/api/apiError'
import type { PayoutAccount } from '../../../types/payout'

function AccountForm({ account, onDone }: { account: PayoutAccount | null; onDone: () => void }) {
  const showToast = useToastStore((s) => s.show)
  const save = useSavePayoutAccount()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<PayoutAccountValues>({
    resolver: zodResolver(payoutAccountSchema),
    mode: 'onTouched',
    defaultValues: account ?? { bankName: '', accountNumber: '', accountName: '' },
  })

  function submit(values: PayoutAccountValues) {
    save.mutate(values, {
      onSuccess: () => {
        showToast({ kind: 'success', message: 'Bank account saved' })
        onDone()
      },
      onError: (e) => applyServerFieldErrors(e, ['bankName', 'accountNumber', 'accountName'] as const, setError),
    })
  }

  const fieldError = errors.bankName || errors.accountNumber || errors.accountName

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-3">
      {save.error && !fieldError && <ErrorAlert>{getErrorMessage(save.error, 'Could not save the bank account.')}</ErrorAlert>}
      <TextField label="Bank" placeholder="e.g. GTBank" error={errors.bankName?.message} {...register('bankName')} />
      <TextField
        label="Account number"
        inputMode="numeric"
        maxLength={10}
        placeholder="10 digits"
        error={errors.accountNumber?.message}
        {...register('accountNumber')}
      />
      <TextField
        label="Account name"
        hint="As it appears on the account. Payouts to a different name may be refused."
        error={errors.accountName?.message}
        {...register('accountName')}
      />
      <div className="flex flex-wrap gap-3">
        <Button type="submit" isLoading={save.isPending}>
          Save bank account
        </Button>
        {account && (
          <Button type="button" variant="outline" onClick={onDone}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}

export function PayoutAccountCard({ account }: { account: PayoutAccount | null }) {
  const [editing, setEditing] = useState(false)

  return (
    <section className="space-y-3 rounded-xl border border-border bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-bold">
          <Landmark className="h-4 w-4 text-primary" aria-hidden /> Bank account
        </h2>
        {account && !editing && (
          <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            <Pencil className="h-3.5 w-3.5" aria-hidden /> Change
          </button>
        )}
      </div>

      {account && !editing ? (
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Bank</dt>
            <dd className="font-medium">{account.bankName}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Account number</dt>
            <dd className="font-medium tabular-nums">{account.accountNumber}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Account name</dt>
            <dd className="text-right font-medium">{account.accountName}</dd>
          </div>
        </dl>
      ) : (
        <>
          {!account && <p className="text-sm text-muted">Add the account your earnings should be paid into.</p>}
          <AccountForm account={account} onDone={() => setEditing(false)} />
        </>
      )}
    </section>
  )
}