import { useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function InputField({ label, type = 'text', value, onChange, placeholder, autoComplete, required, error }) {
  const generatedId = useId()
  const inputId = generatedId
  const errorId = `${inputId}-error`
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        <input
          id={inputId}
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-input text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
          >
            {show ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
          </button>
        )}
      </div>
      {error && <p id={errorId} className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
