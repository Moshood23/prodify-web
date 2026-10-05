import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Percent } from 'lucide-react'
import { usePlatformSettings, useUpdatePlatformSettings } from '../hooks'
import { commissionSchema, type CommissionValues } from '../payout.schema'
import { Button } from '../../../components/ui/Button'
import { TextField } from '../../../components/ui/TextField'
import { ErrorAlert } from '../../../components/ui/Alert'
import { useToastStore } from '../../../store/toastStore'
import { applyServerFieldErrors, getErrorMessage } from '../../../services/api/apiError'

function CommissionForm({ current }: { current: number }) {
  const showToast = useToastStore((s) => s.show)
  const update = useUpdatePlatformSettings()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<CommissionValues>({ resolver: zodResolver(commissionSchema), defaultValues: { commissionRate: String(current) } })

  function submit(values: CommissionValues) {
    const commissionRate = Number(values.commissionRate)
    update.mutate(
      { commissionRate },
      {
        onSuccess: () => showToast({ kind: 'success', message: `Commission set to ${commissionRate}%` }),
        onError: (e) => applyServerFieldErrors(e, ['commissionRate'] as const, setError),
      },
    )
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-3">
      {update.error && !errors.commissionRate && <ErrorAlert>{getErrorMessage(update.error, 'Could not save the commission.')}</ErrorAlert>}
      <TextField
        label="Commission (%)"
        inputMode="decimal"
        className="max-w-48"
        hint="Between 0 and 50. Applies to orders delivered from now on; past earnings keep their rate."
        error={errors.commissionRate?.message}
        {...register('commissionRate')}
      />
      <Button type="submit" isLoading={update.isPending} disabled={!isDirty}>
        Save commission
      </Button>
    </form>
  )
}

export function AdminSettingsPage() {
  const { data, isLoading, error } = usePlatformSettings()

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <section className="space-y-3 rounded-xl border border-border bg-white p-4 sm:p-5">
        <h2 className="flex items-center gap-2 font-bold">
          <Percent className="h-4 w-4 text-primary" aria-hidden /> Seller commission
        </h2>
        <p className="text-sm text-muted">The share of each sale Prodify keeps. Sellers see it on their Earnings page.</p>
        {isLoading ? (
          <div className="h-24 animate-pulse rounded-lg bg-surface" aria-busy="true" aria-label="Loading settings" />
        ) : error || !data ? (
          <ErrorAlert>{getErrorMessage(error, 'Could not load settings.')}</ErrorAlert>
        ) : (
          <CommissionForm key={data.commissionRate} current={data.commissionRate} />
        )}
      </section>
    </div>
  )
}
