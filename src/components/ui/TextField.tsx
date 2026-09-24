import { useId, type ComponentProps, type ReactNode } from 'react'

interface TextFieldProps extends ComponentProps<'input'> {
  label: string
  error?: string
  hint?: string
  // Something shown inside the right edge of the input, e.g. a show/hide password button.
  endAdornment?: ReactNode
}

export function TextField({ label, error, hint, endAdornment, id, className = '', ...inputProps }: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const messageId = `${inputId}-message`
  const message = error ?? hint

  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium">
        {label}
      </label>

      <div className="relative">
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 ${
            error
              ? 'border-danger focus:border-danger focus:ring-red-100'
              : 'border-border focus:border-primary focus:ring-primary-light'
          } ${endAdornment ? 'pr-10' : ''}`}
          {...inputProps}
        />
        {endAdornment && <div className="absolute inset-y-0 right-0 flex items-center pr-2">{endAdornment}</div>}
      </div>

      {message && (
        <p id={messageId} className={`mt-1 text-xs ${error ? 'text-danger' : 'text-muted'}`}>
          {message}
        </p>
      )}
    </div>
  )
}