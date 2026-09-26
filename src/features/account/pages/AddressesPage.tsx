import { useState } from 'react'
import { MapPin, Plus } from 'lucide-react'
import { useDeleteAddress, useMe, useSaveAddress, useSetDefaultAddress } from '../hooks'
import { AddressForm } from '../../checkout/components/AddressForm'
import type { AddressFormValues } from '../../checkout/validation/address.schema'
import { Button } from '../../../components/ui/Button'
import { ErrorAlert } from '../../../components/ui/Alert'
import { getErrorMessage } from '../../../services/api/apiError'
import type { CustomerAddress } from '../../../types/order'

// null = no form open, 'new' = adding, otherwise the address being edited.
type Editing = null | 'new' | CustomerAddress

function AddressCard({ address, onEdit }: { address: CustomerAddress; onEdit: () => void }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const deleteAddress = useDeleteAddress()
  const setDefault = useSetDefaultAddress()

  return (
    <li className={`flex flex-col gap-3 rounded-xl border bg-white p-4 ${address.isDefault ? 'border-primary' : 'border-border'}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold">{address.label}</span>
        {address.isDefault && <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs font-semibold text-primary">Default</span>}
      </div>
      <p className="flex-1 text-sm">
        {address.recipientName}
        <br />
        {address.addressLine1}
        {address.addressLine2 && (
          <>
            <br />
            {address.addressLine2}
          </>
        )}
        <br />
        {address.city}, {address.state}
        <br />
        <span className="text-muted">{address.phoneNumber}</span>
      </p>

      {confirmingDelete ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-red-50 p-2 text-sm">
          <span className="font-medium text-danger">Delete this address?</span>
          <Button variant="danger" className="px-3 py-1.5" isLoading={deleteAddress.isPending} onClick={() => deleteAddress.mutate(address.id)}>
            Delete
          </Button>
          <Button variant="outline" className="px-3 py-1.5" onClick={() => setConfirmingDelete(false)}>
            Keep
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
          <button onClick={onEdit} className="text-primary hover:underline">
            Edit
          </button>
          {!address.isDefault && (
            <button onClick={() => setDefault.mutate(address.id)} disabled={setDefault.isPending} className="text-primary hover:underline disabled:opacity-50">
              Set as default
            </button>
          )}
          <button onClick={() => setConfirmingDelete(true)} className="text-danger hover:underline">
            Delete
          </button>
        </div>
      )}
    </li>
  )
}

export function AddressesPage() {
  const { data: me, isLoading, error } = useMe()
  const save = useSaveAddress()
  const [editing, setEditing] = useState<Editing>(null)

  if (isLoading) return <div className="h-48 animate-pulse rounded-xl bg-white" aria-busy="true" aria-label="Loading addresses" />
  if (error || !me) return <ErrorAlert>{getErrorMessage(error, 'Could not load your addresses.')}</ErrorAlert>

  function handleSubmit(values: AddressFormValues) {
    const { setAsDefault, ...rest } = values
    const address = { ...rest, addressLine2: rest.addressLine2 || undefined, country: 'Nigeria' }
    save.mutate(
      { id: editing && editing !== 'new' ? editing.id : undefined, address, setAsDefault },
      { onSuccess: () => setEditing(null) },
    )
  }

  function open(target: Editing) {
    save.reset()
    setEditing(target)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isEditing = editing && editing !== 'new'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Addresses</h1>
        {!editing && (
          <Button onClick={() => open('new')}>
            <Plus className="h-4 w-4" aria-hidden /> Add address
          </Button>
        )}
      </div>

      {editing && (
        <section className="space-y-3 rounded-xl border border-border bg-white p-4 sm:p-6">
          <h2 className="font-bold">{isEditing ? `Edit “${editing.label}”` : 'New address'}</h2>
          {save.error && <ErrorAlert>{getErrorMessage(save.error, 'Could not save this address.')}</ErrorAlert>}
          <AddressForm
            // A new key resets the form when switching between addresses.
            key={isEditing ? editing.id : 'new'}
            defaultValues={
              isEditing
                ? {
                    label: editing.label,
                    recipientName: editing.recipientName,
                    phoneNumber: editing.phoneNumber,
                    addressLine1: editing.addressLine1,
                    addressLine2: editing.addressLine2 ?? '',
                    city: editing.city,
                    state: editing.state,
                  }
                : { recipientName: `${me.firstName} ${me.lastName}`, phoneNumber: me.phoneNumber ?? '', label: me.addresses.length === 0 ? 'Home' : '' }
            }
            submitLabel={isEditing ? 'Save changes' : 'Save address'}
            showDefaultOption={!isEditing}
            isSaving={save.isPending}
            onSubmit={handleSubmit}
            onCancel={() => setEditing(null)}
          />
        </section>
      )}

      {me.addresses.length === 0 && !editing ? (
        <div className="rounded-xl border border-border bg-white px-6 py-12 text-center">
          <MapPin className="mx-auto mb-3 h-10 w-10 text-muted" aria-hidden />
          <p className="font-semibold">No saved addresses</p>
          <p className="mt-1 text-sm text-muted">Save an address to check out faster.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {me.addresses.map((address) => (
            <AddressCard key={address.id} address={address} onEdit={() => open(address)} />
          ))}
        </ul>
      )}
    </div>
  )
}