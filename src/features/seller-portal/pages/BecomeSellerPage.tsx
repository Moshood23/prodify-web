import { Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BadgeCheck, Store, Truck, Wallet } from 'lucide-react'
import { sellerApi } from '../api/sellerApi'
import { sellerApplicationSchema, type SellerApplicationFormValues } from '../validation/sellerApplication.schema'
import { nigerianStates } from '../../checkout/validation/nigerianStates'
import { useAuthStore } from '../../../store/authStore'
import { Button } from '../../../components/ui/Button'
import { TextField } from '../../../components/ui/TextField'
import { TextArea } from '../../../components/ui/TextArea'
import { SelectField } from '../../../components/ui/SelectField'
import { ErrorAlert } from '../../../components/ui/Alert'
import { applyServerFieldErrors, getErrorMessage, getErrorStatus } from '../../../services/api/apiError'

const benefits = [
  { icon: Store, title: 'Your own store', text: 'A store page with all your products.' },
  { icon: Truck, title: 'Nationwide customers', text: 'Sell to shoppers across all 36 states.' },
  { icon: Wallet, title: 'Simple payouts', text: 'Get paid for every delivered order.' },
]

const fieldNames = ['businessName', 'email', 'phoneNumber', 'description', 'addressLine1', 'addressLine2', 'city', 'state'] as const

export function BecomeSellerPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const setSession = useAuthStore((s) => s.setSession)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SellerApplicationFormValues>({
    resolver: zodResolver(sellerApplicationSchema),
    mode: 'onTouched',
    defaultValues: {
      businessName: '',
      email: user?.email ?? '',
      phoneNumber: '',
      description: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      acceptTerms: false,
    },
  })

  const apply = useMutation({
    mutationFn: (values: SellerApplicationFormValues) =>
      sellerApi.apply({
        businessName: values.businessName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        description: values.description || undefined,
        addressLine1: values.addressLine1,
        addressLine2: values.addressLine2 || undefined,
        city: values.city,
        state: values.state,
      }),
    onSuccess: (result) => {
      // The new token carries the Seller role, so the Seller Centre opens straight away.
      setSession({ token: result.token, refreshToken: result.refreshToken, userId: user?.id ?? '' })
      queryClient.removeQueries({ queryKey: ['seller'] })
      navigate('/seller', { replace: true })
    },
    onError: (error) => {
      if (getErrorStatus(error) === 409) setError('email', { type: 'server', message: getErrorMessage(error) })
      else applyServerFieldErrors(error, fieldNames, setError)
    },
  })

  // Already a seller: nothing to apply for.
  if (user?.roles.includes('Seller')) return <Navigate to="/seller" replace />

  const showGeneralError = apply.error && getErrorStatus(apply.error) !== 409

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
      <section className="rounded-xl border border-border bg-white p-4 sm:p-6">
        <h1 className="text-2xl font-bold">Sell on Prodify</h1>
        <p className="mb-6 mt-1 text-sm text-muted">
          Tell us about your business. Our team reviews every application, usually within 1–2 working days.
        </p>

        <form onSubmit={handleSubmit((values) => apply.mutate(values))} noValidate className="space-y-5">
          {showGeneralError && <ErrorAlert>{getErrorMessage(apply.error, 'Could not send your application.')}</ErrorAlert>}

          <fieldset className="space-y-4">
            <legend className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">Business</legend>
            <TextField label="Business name" autoComplete="organization" error={errors.businessName?.message} {...register('businessName')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Business email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
              <TextField label="Phone number" type="tel" autoComplete="tel" error={errors.phoneNumber?.message} {...register('phoneNumber')} />
            </div>
            <TextArea
              label="What do you sell? (optional)"
              placeholder="e.g. Phones and accessories. Include your CAC number if you have one."
              error={errors.description?.message}
              {...register('description')}
            />
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">Pickup address</legend>
            <TextField label="Street address" autoComplete="address-line1" error={errors.addressLine1?.message} {...register('addressLine1')} />
            <TextField
              label="Landmark (optional)"
              autoComplete="address-line2"
              error={errors.addressLine2?.message}
              {...register('addressLine2')}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="City / town" autoComplete="address-level2" error={errors.city?.message} {...register('city')} />
              <SelectField
                label="State"
                placeholder="Choose a state"
                options={nigerianStates}
                autoComplete="address-level1"
                error={errors.state?.message}
                {...register('state')}
              />
            </div>
          </fieldset>

          <div>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-primary" {...register('acceptTerms')} />
              I confirm these details are correct and agree to the Prodify seller terms.
            </label>
            {errors.acceptTerms && <p className="mt-1 text-xs text-danger">{errors.acceptTerms.message}</p>}
          </div>

          <Button type="submit" variant="accent" className="w-full py-3 sm:w-auto" isLoading={apply.isPending}>
            Send application
          </Button>
        </form>
      </section>

      <aside className="space-y-3 rounded-xl bg-gradient-to-br from-primary to-primary-dark p-6 text-white">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <BadgeCheck className="h-5 w-5 text-accent" aria-hidden /> Why sell with us
        </h2>
        {benefits.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-3">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
            <div>
              <p className="font-semibold">{title}</p>
              <p className="text-sm text-primary-light">{text}</p>
            </div>
          </div>
        ))}
      </aside>
    </div>
  )
}