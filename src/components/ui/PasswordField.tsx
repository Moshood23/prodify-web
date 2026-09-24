import { useState, type ComponentProps } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { TextField } from './TextField'

type PasswordFieldProps = Omit<ComponentProps<typeof TextField>, 'type' | 'endAdornment'>

export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      endAdornment={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="rounded p-1 text-muted hover:text-ink"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
    />
  )
}