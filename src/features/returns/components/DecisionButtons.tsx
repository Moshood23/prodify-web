import { useState, type FormEvent } from 'react'
import { Button } from '../../../components/ui/Button'
import { TextField } from '../../../components/ui/TextField'
import { getErrorMessage, getFieldErrors } from '../../../services/api/apiError'

interface DecisionButtonsProps {
  yesLabel: string
  noLabel: string
  // The "yes" note is optional (admins can add one); the "no" note is required.
  yesNote?: string
  noNote: string
  noPlaceholder: string
  isPending: boolean
  onDecide: (yes: boolean, note: string | undefined, done: { onError: (error: unknown) => void }) => void
}

// "Accept / Reject" for sellers and "Approve / Decline" for admins.
export function DecisionButtons({ yesLabel, noLabel, yesNote, noNote, noPlaceholder, isPending, onDecide }: DecisionButtonsProps) {
  const [mode, setMode] = useState<'yes' | 'no' | null>(null)
  const [note, setNote] = useState('')
  const [error, setError] = useState<string>()

  const onError = (err: unknown) => setError(Object.values(getFieldErrors(err))[0]?.[0] ?? getErrorMessage(err))

  function submit(e: FormEvent) {
    e.preventDefault()
    if (mode === 'no' && !note.trim()) return setError('Give a reason. The customer will see it.')
    onDecide(mode === 'yes', note.trim() || undefined, { onError })
  }

  if (!mode) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          className="py-1.5"
          onClick={() => (yesNote ? setMode('yes') : onDecide(true, undefined, { onError }))}
          isLoading={isPending && !mode}
        >
          {yesLabel}
        </Button>
        <Button variant="outline" className="py-1.5" onClick={() => setMode('no')} disabled={isPending}>
          {noLabel}
        </Button>
        {error && <p className="w-full text-sm text-danger">{error}</p>}
      </div>
    )
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className={`flex w-full flex-wrap items-start gap-2 rounded-lg p-3 ${mode === 'yes' ? 'bg-primary-light/40' : 'bg-red-50'}`}
    >
      <TextField
        label={mode === 'yes' ? (yesNote ?? '') : noNote}
        placeholder={mode === 'yes' ? 'Optional' : noPlaceholder}
        maxLength={500}
        value={note}
        onChange={(e) => {
          setNote(e.target.value)
          setError(undefined)
        }}
        error={error}
        className="min-w-0 flex-1"
        autoFocus
      />
      <div className="flex gap-2 sm:mt-6">
        <Button type="submit" variant={mode === 'yes' ? 'primary' : 'danger'} isLoading={isPending}>
          {mode === 'yes' ? yesLabel : noLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setMode(null)
            setError(undefined)
          }}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
