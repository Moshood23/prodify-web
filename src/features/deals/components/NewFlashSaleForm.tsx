import { useState, type FormEvent } from 'react'
import { useManagedProduct, useManagedProducts } from '../../seller-portal/products/hooks'
import { useCreateFlashSale } from '../hooks'
import { Button } from '../../../components/ui/Button'
import { SelectField } from '../../../components/ui/SelectField'
import { TextField } from '../../../components/ui/TextField'
import { useToastStore } from '../../../store/toastStore'
import { formatNaira } from '../../../lib/format'
import { getErrorMessage } from '../../../services/api/apiError'

// Same rules as the API (FlashSale and CartRules).
const MIN_PERCENT_OFF = 5
const MAX_PER_CUSTOMER = 10

const lengths = [
  { value: '1', label: '1 hour' },
  { value: '3', label: '3 hours' },
  { value: '6', label: '6 hours' },
  { value: '12', label: '12 hours' },
  { value: '24', label: '1 day' },
  { value: '48', label: '2 days' },
  { value: '72', label: '3 days' },
  { value: '168', label: '7 days' },
]

const perCustomerOptions = Array.from({ length: MAX_PER_CUSTOMER }, (_, i) => String(i + 1))

// The highest sale price that is still a real discount.
const maxSalePrice = (price: number) => Math.floor((price * (100 - MIN_PERCENT_OFF)) / 100)

// <input type="datetime-local"> works in the shopper's own time, e.g. "2026-10-12T09:00".
function localInputValue(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

export function NewFlashSaleForm({ onDone }: { onDone: () => void }) {
  const [search, setSearch] = useState('')
  const [productId, setProductId] = useState('')
  const [chosenVariantId, setChosenVariantId] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [quantity, setQuantity] = useState('20')
  const [maxPerCustomer, setMaxPerCustomer] = useState('2')
  const [startNow, setStartNow] = useState(true)
  const [startsAt, setStartsAt] = useState(() => localInputValue(new Date(Date.now() + 24 * 3600 * 1000)))
  const [hours, setHours] = useState('24')
  const [error, setError] = useState<string>()

  const products = useManagedProducts({ filter: 'active', search: search.trim() || undefined, pageSize: 50 })
  const product = useManagedProduct(productId || undefined)
  const create = useCreateFlashSale()
  const showToast = useToastStore((s) => s.show)

  const variants = (product.data?.variants ?? []).filter((v) => v.isActive)
  const variant = variants.find((v) => v.id === chosenVariantId) ?? (variants.length === 1 ? variants[0] : undefined)

  function submit(e: FormEvent) {
    e.preventDefault()
    setError(undefined)

    if (!variant) return setError('Choose the product to put on sale.')
    const price = Number(salePrice)
    if (!price || price <= 0) return setError('Enter the sale price.')
    if (price > maxSalePrice(variant.price))
      return setError(
        `The sale price must be at least ${MIN_PERCENT_OFF}% below ${formatNaira(variant.price)}, so at most ${formatNaira(maxSalePrice(variant.price))}.`,
      )

    const start = startNow ? new Date() : new Date(startsAt)
    if (Number.isNaN(start.getTime())) return setError('Choose when the sale starts.')
    const end = new Date(start.getTime() + Number(hours) * 3600 * 1000)

    create.mutate(
      {
        productVariantId: variant.id,
        salePrice: price,
        quantity: Number(quantity),
        maxPerCustomer: Number(maxPerCustomer),
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
      },
      {
        onSuccess: () => {
          showToast({ kind: 'success', message: 'Flash sale sent to Prodify for approval' })
          onDone()
        },
        onError: (err) => setError(getErrorMessage(err, 'Could not set up the flash sale.')),
      },
    )
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-xl border border-border bg-white p-4 sm:p-6">
      <h2 className="text-lg font-bold">New flash sale</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Find a product" placeholder="Type a name" value={search} onChange={(e) => setSearch(e.target.value)} />
        <SelectField
          label="Product"
          placeholder={products.isLoading ? 'Loading...' : 'Choose a product'}
          options={(products.data?.items ?? []).map((p) => ({ value: p.id, label: p.name }))}
          value={productId}
          onChange={(e) => {
            setProductId(e.target.value)
            setChosenVariantId('')
          }}
        />
      </div>

      {variants.length > 1 && (
        <SelectField
          label="Option"
          placeholder="Choose an option"
          options={variants.map((v) => ({ value: v.id, label: `${v.name ?? v.sku} (${formatNaira(v.price)})` }))}
          value={chosenVariantId}
          onChange={(e) => setChosenVariantId(e.target.value)}
        />
      )}

      {variant && (
        <p className="rounded-md bg-surface px-3 py-2 text-sm">
          Price today: <span className="font-semibold">{formatNaira(variant.price)}</span>. The sale price can be at most{' '}
          <span className="font-semibold">{formatNaira(maxSalePrice(variant.price))}</span> ({MIN_PERCENT_OFF}% off). You have{' '}
          {variant.availableQuantity} in stock.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <TextField
          label="Sale price (NGN)"
          type="number"
          min={1}
          inputMode="numeric"
          value={salePrice}
          onChange={(e) => setSalePrice(e.target.value)}
        />
        <TextField
          label="Units at the sale price"
          type="number"
          min={1}
          max={10000}
          inputMode="numeric"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <SelectField
          label="Most one customer can buy"
          options={perCustomerOptions}
          value={maxPerCustomer}
          onChange={(e) => setMaxPerCustomer(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SelectField
          label="Starts"
          options={[
            { value: 'now', label: 'As soon as Prodify approves it' },
            { value: 'later', label: 'At a time I choose' },
          ]}
          value={startNow ? 'now' : 'later'}
          onChange={(e) => setStartNow(e.target.value === 'now')}
        />
        {!startNow && <TextField label="Start time" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />}
        <SelectField label="Lasts" options={lengths} value={hours} onChange={(e) => setHours(e.target.value)} />
      </div>

      <p className="text-xs text-muted">
        You are paid on the sale price. Prodify checks every flash sale before it goes live. Once the units at the sale price are sold, the
        normal price comes back.
      </p>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" isLoading={create.isPending}>
          Send for approval
        </Button>
        <Button type="button" variant="outline" onClick={onDone} disabled={create.isPending}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
