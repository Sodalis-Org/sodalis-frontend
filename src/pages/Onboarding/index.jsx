import { useState } from 'react'
import { flushSync } from 'react-dom'
import { Navigate, useNavigate } from 'react-router-dom'
import { Home, LogIn, UserPlus, Key, Plus, AlertCircle, Copy, Check } from 'lucide-react'
import { clsx } from 'clsx'
import { useAuthContext } from '../../context/AuthContext'
import { useAuth } from '../../hooks/useAuth'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import InputField from '../../components/InputField'
import LoadingSpinner from '../../components/LoadingSpinner'

// ─── Shared primitives ────────────────────────────────────────────────────────

function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <div role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
      <AlertCircle size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
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
      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? <LoadingSpinner size={16} /> : children}
    </button>
  )
}

function TabToggle({ options, value, onChange }) {
  return (
    <div className="flex bg-muted p-1 rounded-xl gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={clsx(
            'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all',
            value === opt.value
              ? 'bg-card text-primary shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
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
          { value: 'login',    label: 'Se connecter', icon: <LogIn size={14} aria-hidden="true" /> },
          { value: 'register', label: "S'inscrire",   icon: <UserPlus size={14} aria-hidden="true" /> },
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

function ColocStep({ createdColoc, setCreatedColoc }) {
  const navigate = useNavigate()
  const [mode, setMode] = useState('create')
  const { createColoc, joinColoc, error, setError, loading } = useAuth()
  const { logout, refreshUser } = useAuthContext()

  const [colocName, setColocName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [continuing, setContinuing] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (mode === 'create') {
      const coloc = await createColoc(colocName.trim())
      if (!coloc) return
      // Pose l'écran invite avant refreshUser pour que le garde Onboarding ne redirige pas.
      flushSync(() => setCreatedColoc(coloc))
      await refreshUser()
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

  const handleContinue = async () => {
    setContinuing(true)
    setError(null)
    try {
      const result = await refreshUser()
      const colocId = result?.data?.me?.coloc_id
      if (!colocId) {
        setError('Session incomplète — reconnectez-vous ou réessayez.')
        return
      }
      navigate('/')
    } finally {
      setContinuing(false)
    }
  }

  if (createdColoc) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Colocation créée : <strong className="text-foreground">{createdColoc.name}</strong>
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Partagez ce code d&apos;invitation avec vos colocataires pour qu&apos;ils rejoignent l&apos;espace.
        </p>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-muted border border-border">
          <code className="flex-1 min-w-0 font-mono text-sm font-semibold text-foreground tracking-tight truncate">
            {createdColoc.invite_code}
          </code>
          <button
            type="button"
            onClick={copyInvite}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-card border border-border text-xs font-semibold text-foreground hover:bg-muted transition"
          >
            {copied ? <Check size={14} aria-hidden="true" className="text-secondary" /> : <Copy size={14} aria-hidden="true" />}
            {copied ? 'Copié' : 'Copier'}
          </button>
        </div>
        <ErrorBanner message={error} />
        <PrimaryButton type="button" loading={continuing} onClick={handleContinue}>
          Continuer
        </PrimaryButton>
        <button
          type="button"
          onClick={logout}
          className="text-center text-xs text-muted-foreground hover:text-foreground transition mt-1"
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
          { value: 'create', label: 'Créer une coloc', icon: <Plus size={14} aria-hidden="true" /> },
          { value: 'join',   label: 'Rejoindre',        icon: <Key size={14} aria-hidden="true" /> },
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
        className="text-center text-xs text-muted-foreground hover:text-foreground transition mt-1"
      >
        Se déconnecter
      </button>
    </form>
  )
}

// ─── Page shell ───────────────────────────────────────────────────────────────

export default function Onboarding({ colocStep = false }) {
  useDocumentTitle(colocStep ? 'Configurer ma colocation' : 'Connexion')
  const { user, loading } = useAuthContext()
  // Lifted so the redirect guard can keep the invite screen visible after refreshUser().
  const [createdColoc, setCreatedColoc] = useState(null)

  if (loading) return null
  if (user?.coloc_id && !createdColoc) return <Navigate to="/" replace />
  if (colocStep && !user) return <Navigate to="/onboarding" replace />
  if (!colocStep && user && !user.coloc_id) return <Navigate to="/onboarding/coloc" replace />

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-12">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-xl"
      >
        Aller au contenu principal
      </a>
      <main id="main-content" tabIndex={-1} className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
            <Home size={28} aria-hidden="true" className="text-primary-foreground" strokeWidth={2} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Sodalis</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {colocStep
                ? 'Dernière étape — configurez votre espace'
                : 'Votre maison, gérée intelligemment'}
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-card rounded-3xl shadow-sm border border-border p-6">
          {colocStep ? (
            <>
              <h2 className="text-base font-semibold text-foreground mb-4">Votre colocation</h2>
              <ColocStep createdColoc={createdColoc} setCreatedColoc={setCreatedColoc} />
            </>
          ) : (
            <>
              <h2 className="text-base font-semibold text-foreground mb-4">Bienvenue</h2>
              <AuthStep />
            </>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className={clsx('h-1.5 rounded-full transition-all', colocStep ? 'w-3 bg-primary/30' : 'w-6 bg-primary')} />
          <div className={clsx('h-1.5 rounded-full transition-all', colocStep ? 'w-6 bg-primary' : 'w-3 bg-primary/30')} />
        </div>
      </main>
    </div>
  )
}
