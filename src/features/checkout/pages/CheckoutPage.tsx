import { useState, type ReactNode } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Banknote, CreditCard, MapPin, Plus } from 'lucide-react'
import { checkoutApi } from '../api/checkoutApi'
import { AddressForm } from '../components/AddressForm'
import type { AddressFormValues } from '../validation/address.schema'
import { useCart } from '../../cart/hooks/useCart'
import { ProductImage } from '../../catalog/components/ProductImage'
import { Button } from '../../../components/ui/Button'
import { ErrorAlert } from '../../../components/ui/Alert'
import { formatNaira } from '../../../lib/format'
import { getErrorMessage } from '../../../services/api/apiError'
import type { CustomerAddress, PaymentMethod } from '../../../types/order'

const paymentOptions: { value: PaymentMethod; title: string; description: string; icon: typeof CreditCard }[] = [
  { value: 'Card', title: 'Pay now with card', description: 'Pay securely online right after placing your order.', icon: CreditCard },
  { value: 'PayOnDelivery', title: 'Pay on delivery', description: 'Pay with cash or transfer when your order arrives.', icon: Banknote },
]

function StepCard({ step, title, children }: { step: number; title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-white p-4 sm:p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm text-white">{step}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

function AddressText({ address }: { address: CustomerAddress }) {
  return (
    <span className="text-sm text-muted">
      {address.addressLine1}
      {address.addressLine2 ? `, ${address.addressLine2}` : ''}, {address.city}, {address.state}
      <br />
      {address.phoneNumber}
    </span>
  )
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: cart, isLoading: loadingCart } = useCart()
  const { data: me, isLoading: loadingMe, error: meError } = useQuery({ queryKey: ['me'], queryFn: checkoutApi.getMe })

  const [chosenAddressId, setChosenAddressId] = useState<string | null>(null)
  const [addingAddress, setAddingAddress] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Card')

  const addAddress = useMutation({
    mutationFn: (values: AddressFormValues) =>
      checkoutApi.addAddress({ ...values, addressLine2: values.addressLine2 || undefined, country: 'Nigeria' }),
    onSuccess: async (newId) => {
      await queryClient.invalidateQueries({ queryKey: ['me'] })
      setChosenAddressId(newId)
      setAddingAddress(false)
    },
  })

  const placeOrder = useMutation({
    mutationFn: checkoutApi.placeOrder,
    onSuccess: (orderId) => {
      void queryClient.invalidateQueries({ queryKey: ['cart'] })
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
      // Card orders go straight to payment; pay-on-delivery orders are done.
      navigate(paymentMethod === 'Card' ? `/orders/${orderId}?pay=1` : `/orders/${orderId}?placed=1`, { replace: true })
    },
    // Stock or prices may have changed since the cart was loaded.
    onError: () => void queryClient.invalidateQueries({ queryKey: ['cart'] }),
  })

  if (loadingCart || loadingMe) {
    return (
      <div className="grid animate-pulse gap-6 lg:grid-cols-[1fr_22rem]" aria-busy="true" aria-label="Loading checkout">
        <div className="h-80 rounded-xl bg-white" />
        <div className="h-64 rounded-xl bg-white" />
      </div>
    )
  }

  if (meError) return <ErrorAlert>{getErrorMessage(meError, 'Could not load your account.')}</ErrorAlert>

  // Nothing to buy (or something to fix first): back to the cart.
  if (!placeOrder.isPending && !placeOrder.isSuccess && (!cart || cart.items.length === 0 || cart.hasProblems)) {
    return <Navigate to="/cart" replace />
  }

  const addresses = me?.addresses ?? []
  const selectedAddress =
    addresses.find((a) => a.id === chosenAddressId) ?? addresses.find((a) => a.isDefault) ?? addresses[0]
  const showAddressForm = addingAddress || addresses.length === 0

  function handlePlaceOrder() {
    if (!selectedAddress) return
    placeOrder.mutate({
      recipientName: selectedAddress.recipientName,
      addressLine1: selectedAddress.addressLine1,
      addressLine2: selectedAddress.addressLine2,
      city: selectedAddress.city,
      state: selectedAddress.state,
      postalCode: selectedAddress.postalCode,
      country: selectedAddress.country,
      phoneNumber: selectedAddress.phoneNumber,
      paymentMethod,
    })
  }

  return (
    <div className="space-y-4">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link to="/cart" className="hover:text-primary">
          Cart
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">Checkout</span>
      </nav>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          <StepCard step={1} title="Delivery address">
            {!showAddressForm && (
              <div className="space-y-3">
                <div role="radiogroup" aria-label="Delivery address" className="space-y-2">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`flex cursor-pointer gap-3 rounded-lg border p-3 ${
                        address.id === selectedAddress?.id ? 'border-primary bg-primary-light' : 'border-border hover:border-primary'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        className="mt-1 accent-primary"
                        checked={address.id === selectedAddress?.id}
                        onChange={() => setChosenAddressId(address.id)}
                      />
                      <span className="space-y-0.5">
                        <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                          {address.recipientName}
                          <span className="rounded bg-surface px-1.5 py-0.5 text-xs font-medium text-muted">{address.label}</span>
                          {address.isDefault && <span className="text-xs font-medium text-primary">Default</span>}
                        </span>
                        <AddressText address={address} />
                      </span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={() => setAddingAddress(true)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  <Plus className="h-4 w-4" aria-hidden /> Add a new address
                </button>
              </div>
            )}

            {showAddressForm && (
              <div className="space-y-3">
                {addresses.length === 0 && (
                  <p className="flex items-center gap-2 text-sm text-muted">
                    <MapPin className="h-4 w-4" aria-hidden /> Where should we deliver your order?
                  </p>
                )}
                {addAddress.error && <ErrorAlert>{getErrorMessage(addAddress.error, 'Could not save this address.')}</ErrorAlert>}
                <AddressForm
                  defaultValues={{
                    recipientName: me ? `${me.firstName} ${me.lastName}` : '',
                    phoneNumber: me?.phoneNumber ?? '',
                    label: addresses.length === 0 ? 'Home' : '',
                  }}
                  isSaving={addAddress.isPending}
                  onSubmit={(values) => addAddress.mutate(values)}
                  onCancel={addresses.length > 0 ? () => setAddingAddress(false) : undefined}
                />
              </div>
            )}
          </StepCard>

          <StepCard step={2} title="Payment method">
            <div role="radiogroup" aria-label="Payment method" className="grid gap-2 sm:grid-cols-2">
              {paymentOptions.map(({ value, title, description, icon: Icon }) => (
                <label
                  key={value}
                  className={`flex cursor-pointer gap-3 rounded-lg border p-3 ${
                    paymentMethod === value ? 'border-primary bg-primary-light' : 'border-border hover:border-primary'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    className="mt-1 accent-primary"
                    checked={paymentMethod === value}
                    onChange={() => setPaymentMethod(value)}
                  />
                  <span>
                    <span className="flex items-center gap-1.5 text-sm font-semibold">
                      <Icon className="h-4 w-4 text-primary" aria-hidden /> {title}
                    </span>
                    <span className="text-xs text-muted">{description}</span>
                  </span>
                </label>
              ))}
            </div>
          </StepCard>
        </div>

        <aside className="space-y-4 rounded-xl border border-border bg-white p-4 sm:p-6 lg:sticky lg:top-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted">Order summary</h2>

          <ul className="max-h-72 space-y-3 overflow-y-auto">
            {cart?.items.map((item) => (
              <li key={item.id} className="flex gap-3 text-sm">
                <ProductImage src={item.imageUrl} alt={item.productName} className="h-12 w-12 shrink-0 rounded-md" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1">{item.productName}</p>
                  <p className="text-xs text-muted">
                    {item.variantName ? `${item.variantName} · ` : ''}Qty {item.quantity}
                  </p>
                </div>
                <p className="font-medium">{formatNaira(item.subtotal)}</p>
              </li>
            ))}
          </ul>

          <dl className="space-y-2 border-t border-border pt-3 text-sm">
            <div className="flex justify-between">
              <dt>Items ({cart?.itemCount})</dt>
              <dd className="font-medium">{formatNaira(cart?.total ?? 0)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Delivery</dt>
              <dd className="font-medium text-success">Free</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base">
              <dt className="font-bold">Total</dt>
              <dd className="font-bold">{formatNaira(cart?.total ?? 0)}</dd>
            </div>
          </dl>

          {placeOrder.error && <ErrorAlert>{getErrorMessage(placeOrder.error, 'Could not place your order.')}</ErrorAlert>}

          <Button
            variant="accent"
            className="w-full py-3"
            disabled={!selectedAddress || showAddressForm}
            isLoading={placeOrder.isPending}
            onClick={handlePlaceOrder}
          >
            {paymentMethod === 'Card' ? 'Place order and pay' : 'Place order'}
          </Button>
          {showAddressForm && <p className="text-center text-xs text-muted">Save a delivery address first.</p>}
        </aside>
      </div>
    </div>
  )
}