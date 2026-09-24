import { Check, X } from 'lucide-react'
import { passwordRules } from '../validation/auth.schema'

// Shows each password rule turning green as the user types.
export function PasswordChecklist({ password }: { password: string }) {
  return (
    <ul className="mt-2 grid grid-cols-1 gap-1 text-xs sm:grid-cols-2" aria-label="Password requirements">
      {passwordRules.map((rule) => {
        const passed = rule.test(password)
        return (
          <li key={rule.label} className={`flex items-center gap-1.5 ${passed ? 'text-success' : 'text-muted'}`}>
            {passed ? <Check className="h-3.5 w-3.5" aria-hidden /> : <X className="h-3.5 w-3.5" aria-hidden />}
            {rule.label}
          </li>
        )
      })}
    </ul>
  )
}