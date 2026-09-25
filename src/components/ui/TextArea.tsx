import { useId, type ComponentProps } from 'react'

interface TextAreaProps extends ComponentProps<'textarea'> {
  label: string
  error?: string
  hint?: string
}

export function TextArea({ label, error, hint, id, className = '', ...textareaProps }: TextAreaProps) {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  const messageId = `${textareaId}-message`
  const message = error ?? hint

  return (
    <div className={className}>
      <label htmlFor={textareaId} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <textarea
        id={textareaId}
        rows={4}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 ${
          error ? 'border-danger focus:border-danger focus:ring-red-100' : 'border-border focus:border-primary focus:ring-primary-light'
        }`}
        {...textareaProps}
      />
      {message && (
        <p id={messageId} className={`mt-1 text-xs ${error ? 'text-danger' : 'text-muted'}`}>
          {message}
        </p>
      )}
    </div>
  )
}