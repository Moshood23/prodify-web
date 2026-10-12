import { useState, type FormEvent } from 'react'
import { Button } from '../../../components/ui/Button'
import { TextField } from '../../../components/ui/TextField'
import { getErrorMessage, getFieldErrors } from '../../../services/api/apiError'

interface ReasonButtonProps {
  label: string
  // The question above the reason box.
  question: string
  placeholder: string
  isPending: boolean
  onConfirm: (reason: string, done: { onError: (error: unknown) => void }) => void
}

// A button that asks for a reason first, e.g. "Reject" or "Stop sale". The seller sees the reason.
export function ReasonButton({ label, question, placeholder, isPending, onConfirm }: ReasonButtonProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string>()

  const onError = (err: unknown) => setError(Object.values(getFieldErrors(err))[0]?.[0] ?? getErrorMessage(err))

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!reason.trim()) return setError('Give a reason. The seller will see it.')
    onConfirm(reason.trim(), { onError })
  }

  if (!open) {
    return (
      <Button variant="outline" className="py-1.5" onClick={() => setOpen(true)} disabled={isPending}>
        {label}
      </Button>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="flex w-full flex-wrap items-start gap-2 rounded-lg bg-red-50 p-3">
      <TextField
        label={question}
        placeholder={placeholder}
        maxLength={500}
        value={reason}
        onChange={(e) => {
          setReason(e.target.value)
          setError(undefined)
        }}
        error={error}
        className="min-w-0 flex-1"
        autoFocus
      />
      <div className="flex gap-2 sm:mt-6">
        <Button type="submit" variant="danger" isLoading={isPending}>
          {label}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setOpen(false)
            setError(undefined)
          }}
          disabled={isPending}
        >
          Back
        </Button>
      </div>
    </form>
  )
}
