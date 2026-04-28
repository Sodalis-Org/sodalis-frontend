import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Home, LogIn, UserPlus, Key, Plus, AlertCircle, Loader2, Eye, EyeOff, Copy, Check } from 'lucide-react'
import { clsx } from 'clsx'
import { useAuthContext } from '../../context/AuthContext'
import { useAuth } from '../../hooks/useAuth'

// ─── Shared primitives ────────────────────────────────────────────────────────

function InputField({ label, type = 'text', value, onChange, placeholder, autoComplete, required }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  )
}

function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

function PrimaryButton({ children, loading, disabled, type = 'submit', onClick }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : children}
    </button>
  )
}

function TabToggle({ options, value, onChange }) {
  return (
    <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={clsx(
            'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all',
            value === opt.value
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ─── Step 1 : Auth ────────────────────────────────────────────────────────────

function AuthStep() {
  const [mode, setMode] = useState('login')
  const { login, register, error, setError, loading } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (mode === 'register') {
      if (password !== confirm) return setError('Les mots de passe ne correspondent pas.')
      if (password.length < 8) return setError('Le mot de passe doit contenir au moins 8 caractères.')
      await register(name, email, password)
    } else {
      await login(email, password)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TabToggle
        value={mode}
        onChange={(v) => { setMode(v); setError(null) }}
        options={[
          { value: 'login',    label: 'Se connecter', icon: <LogIn size={14} /> },
          { value: 'register', label: "S'inscrire",   icon: <UserPlus size={14} /> },
        ]}
      />

      {mode === 'register' && (
        <InputField
          label="Prénom & nom"
          value={name}
          onChange={setName}
          placeholder="Alice Martin"
          autoComplete="name"
          required
        />
      )}

      <InputField
        label="Adresse e-mail"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="alice@exemple.com"
        autoComplete="email"
        required
      />

      <InputField
        label="Mot de passe"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder={mode === 'register' ? '8 caractères minimum' : '••••••••'}
        autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
        required
      />

      {mode === 'register' && (
        <InputField
          label="Confirmer le mot de passe"
          type="password"
          value={confirm}
          onChange={setConfirm}
          placeholder="••••••••"
          autoComplete="new-password"
          required
        />
      )}

      <ErrorBanner message={error} />

      <PrimaryButton loading={loading}>
        {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
      </PrimaryButton>
    </form>
  )
}

// ─── Step 2 : Coloc setup ─────────────────────────────────────────────────────

function ColocStep() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('create')
  const { createColoc, joinColoc, error, setError, loading } = useAuth()
  const { logout } = useAuthContext()

  const [colocName, setColocName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [createdColoc, setCreatedColoc] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (mode === 'create') {
      const coloc = await createColoc(colocName.trim())
      if (coloc) setCreatedColoc(coloc)
    } else {
      await joinColoc(inviteCode.trim())
    }
  }

  const copyInvite = async () => {
    if (!createdColoc?.invite_code) return
    try {
      await navigator.clipboard.writeText(createdColoc.invite_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  if (createdColoc) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">
          Colocation créée : <strong className="text-gray-900">{createdColoc.name}</strong>
        </p>
        <p className="text-xs text-gray-500 leading-relaxed">
          Partagez ce code d&apos;invitation avec vos colocataires pour qu&apos;ils rejoignent l&apos;espace.
        </p>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200">
          <code className="flex-1 min-w-0 font-mono text-sm font-semibold text-gray-900 tracking-tight truncate">
            {createdColoc.invite_code}
          </code>
          <button
            type="button"
            onClick={copyInvite}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
            {copied ? 'Copié' : 'Copier'}
          </button>
        </div>
        <PrimaryButton type="button" onClick={() => navigate('/')}>
          Continuer
        </PrimaryButton>
        <button
          type="button"
          onClick={logout}
          className="text-center text-xs text-gray-400 hover:text-gray-600 transition mt-1"
        >
          Se déconnecter
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TabToggle
        value={mode}
        onChange={(v) => {
          setMode(v)
          setError(null)
          setCreatedColoc(null)
        }}
        options={[
          { value: 'create', label: 'Créer une coloc', icon: <Plus size={14} /> },
          { value: 'join',   label: 'Rejoindre',        icon: <Key size={14} /> },
        ]}
      />

      {mode === 'create' ? (
        <InputField
          label="Nom de la colocation"
          value={colocName}
          onChange={setColocName}
          placeholder="Appart Lyon Centre"
          required
        />
      ) : (
        <InputField
          label="Code d'invitation"
          value={inviteCode}
          onChange={setInviteCode}
          placeholder="appart-lyon-3f9a"
          autoComplete="off"
          required
        />
      )}

      <ErrorBanner message={error} />

      <PrimaryButton loading={loading}>
        {mode === 'create' ? 'Créer ma colocation' : 'Rejoindre la colocation'}
      </PrimaryButton>

      <button
        type="button"
        onClick={logout}
        className="text-center text-xs text-gray-400 hover:text-gray-600 transition mt-1"
      >
        Se déconnecter
      </button>
    </form>
  )
}

// ─── Page shell ───────────────────────────────────────────────────────────────

export default function Onboarding({ colocStep = false }) {
  const { user, token } = useAuthContext()

  if (token && user?.coloc_id) return <Navigate to="/" replace />
  if (colocStep && !token) return <Navigate to="/onboarding" replace />
  if (!colocStep && token && !user?.coloc_id) return <Navigate to="/onboarding/coloc" replace />

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg">
            <Home size={28} className="text-white" strokeWidth={2} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sodalis</h1>
            <p className="text-sm text-gray-500 mt-1">
              {colocStep
                ? 'Dernière étape — configurez votre espace'
                : 'Votre maison, gérée intelligemment'}
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {colocStep ? (
            <>
              <h2 className="text-base font-semibold text-gray-800 mb-4">Votre colocation</h2>
              <ColocStep />
            </>
          ) : (
            <>
              <h2 className="text-base font-semibold text-gray-800 mb-4">Bienvenue</h2>
              <AuthStep />
            </>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className={clsx('h-1.5 rounded-full transition-all', colocStep ? 'w-3 bg-indigo-300' : 'w-6 bg-indigo-600')} />
          <div className={clsx('h-1.5 rounded-full transition-all', colocStep ? 'w-6 bg-indigo-600' : 'w-3 bg-indigo-200')} />
        </div>
      </div>
    </div>
  )
}
