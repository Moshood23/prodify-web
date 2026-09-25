import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TextField } from '../../../components/ui/TextField'
import { Button } from '../../../components/ui/Button'
import { addressSchema, type AddressFormValues } from '../validation/address.schema'
import { nigerianStates } from '../validation/nigerianStates'

interface AddressFormProps {
  defaultValues: Partial<AddressFormValues>
  isSaving: boolean
  onSubmit: (values: AddressFormValues) => void
  onCancel?: () => void
}

export function AddressForm({ defaultValues, isSaving, onSubmit, onCancel }: AddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    mode: 'onTouched',
    defaultValues: {
      label: 'Home',
      recipientName: '',
      phoneNumber: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      setAsDefault: false,
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Full name" autoComplete="name" error={errors.recipientName?.message} {...register('recipientName')} />
        <TextField label="Phone number" type="tel" autoComplete="tel" error={errors.phoneNumber?.message} {...register('phoneNumber')} />
      </div>

      <TextField
        label="Street address"
        autoComplete="address-line1"
        placeholder="House number and street"
        error={errors.addressLine1?.message}
        {...register('addressLine1')}
      />
      <TextField
        label="Landmark or extra directions (optional)"
        autoComplete="address-line2"
        placeholder="e.g. Opposite First Bank"
        error={errors.addressLine2?.message}
        {...register('addressLine2')}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="City / town" autoComplete="address-level2" error={errors.city?.message} {...register('city')} />

        <div>
          <label htmlFor="address-state" className="mb-1 block text-sm font-medium">
            State
          </label>
          <select
            id="address-state"
            autoComplete="address-level1"
            aria-invalid={errors.state ? true : undefined}
            className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 ${
              errors.state ? 'border-danger focus:ring-red-100' : 'border-border focus:border-primary focus:ring-primary-light'
            }`}
            {...register('state')}
          >
            <option value="">Choose a state</option>
            {nigerianStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {errors.state && <p className="mt-1 text-xs text-danger">{errors.state.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Address name" placeholder="Home, Office, ..." error={errors.label?.message} {...register('label')} />
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-primary" {...register('setAsDefault')} />
          Make this my default address
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" isLoading={isSaving}>
          Save and use this address
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}