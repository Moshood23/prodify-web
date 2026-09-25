import { useId, type ComponentProps } from 'react'

interface SelectFieldProps extends ComponentProps<'select'> {
  label: string
  error?: string
  placeholder?: string
  options: readonly string[]
}

export function SelectField({ label, error, placeholder, options, id, className = '', ...selectProps }: SelectFieldProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return (
    <div className={className}>
      <label htmlFor={selectId} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 ${
          error ? 'border-danger focus:ring-red-100' : 'border-border focus:border-primary focus:ring-primary-light'
        }`}
        {...selectProps}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  )
}