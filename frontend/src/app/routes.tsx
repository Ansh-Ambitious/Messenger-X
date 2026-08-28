import { useState } from 'react';
import { Bell, LogIn, Mail, Monitor, Search, ShieldCheck, UserPlus } from 'lucide-react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Home from './page';
import { AppShell } from '../components/layout/AppShell';
import { AuthCard, AuthLayout } from '../components/layout/AuthLayout';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { LogoWithText } from '../components/ui/Logo';
import { Toggle } from '../components/ui/Toggle';
import { useApp } from '../context/AppContext';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useApp();
  const location = useLocation();

  return isAuthenticated ? children : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { login } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegister = mode === 'register';

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/auth/${isRegister ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isRegister ? { name, email, password } : { email, password }),
      });
      const data = (await response.json()) as { token?: string; message?: string };

      if (!response.ok || !data.token) {
        throw new Error(data.message ?? 'Authentication failed');
      }

      login(data.token);
      navigate('/app/conversations', { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout showHeaderLogo>
      <AuthCard>
        <div className="mb-8 text-center">
          <div className="mb-5 flex justify-center md:hidden"><LogoWithText className="scale-75" /></div>
          <h1 className="text-2xl font-semibold tracking-tight">{isRegister ? 'Create your account' : 'Welcome back'}</h1>
          <p className="mt-2 text-sm text-text-secondary">{isRegister ? 'Start private conversations with Messenger X.' : 'Continue your conversations in Messenger X.'}</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {isRegister && <label className="flex w-full flex-col gap-1"><span className="text-base font-medium">Full name</span><input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-lg border border-border bg-background px-4 py-3 text-[15px] outline-none focus:border-primary" placeholder="Alex Rivers" required /></label>}
          <InputField label="Email" icon={<Mail className="size-4" />} value={email} onChange={setEmail} type="email" placeholder="you@example.com" />
          <InputField label="Password" value={password} onChange={setPassword} type="password" placeholder="Enter your password" />
          {error && <p role="alert" className="text-sm text-error">{error}</p>}
          <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>{isRegister ? <UserPlus className="size-4" /> : <LogIn className="size-4" />}{isSubmitting ? 'Connecting...' : isRegister ? 'Create account' : 'Sign in'}</Button>
        </form>
        <p className="mt-6 text-center text-sm text-text-secondary">{isRegister ? 'Already have an account?' : 'New to Messenger X?'} <button type="button" onClick={() => navigate(isRegister ? '/login' : '/register')} className="font-semibold text-primary hover:underline">{isRegister ? 'Sign in' : 'Create an account'}</button></p>
      </AuthCard>
    </AuthLayout>
  );
}

function InputField({ label, icon, value, onChange, type, placeholder }: { label: string; icon?: React.ReactNode; value: string; onChange: (value: string) => void; type: string; placeholder: string }) {
  return <label className="flex w-full flex-col gap-1"><span className="text-base font-medium">{label}</span><span className="relative"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">{icon}</span><input className="w-full rounded-lg border border-border bg-background px-4 py-3 pl-10 text-[15px] outline-none focus:border-primary" type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required /></span></label>;
}

function ContactsPage() {
  const { conversations } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const contacts = conversations.filter(({ participant }) => participant.name.toLowerCase().includes(search.toLowerCase()));

  return <AppShell activePath="/app/contacts"><div className="mx-auto w-full max-w-5xl flex-1 p-5 md:p-8"><div className="mb-7"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">People</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Contacts</h1><p className="mt-2 text-text-secondary">Find someone to start a private conversation.</p></div><div className="relative mb-5 max-w-md"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search contacts" className="w-full rounded-xl border border-border/60 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-primary" /></div><div className="grid gap-3 sm:grid-cols-2">{contacts.map(({ id, participant }) => <button key={id} onClick={() => navigate(`/app/chat/${id}`)} className="flex items-center gap-3 rounded-2xl border border-border/50 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><Avatar user={participant} size="md" showOnline isOnline={participant.isOnline} /><span className="min-w-0 flex-1"><strong className="block truncate">{participant.name}</strong><span className="text-sm text-text-secondary">@{participant.username}</span></span><span className="text-xs font-semibold text-primary">Message</span></button>)}</div></div></AppShell>;
}

function SettingsPage() {
  const { currentUser, updateUser, pushNotifications, setPushNotifications, darkMode, setDarkMode, logout } = useApp();
  const navigate = useNavigate();

  function signOut() {
    logout();
    navigate('/login', { replace: true });
  }

  return <AppShell activePath="/app/settings"><div className="mx-auto w-full max-w-3xl flex-1 p-5 md:p-8"><div className="mb-7"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Preferences</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Settings</h1><p className="mt-2 text-text-secondary">Manage your profile and app preferences.</p></div><section className="overflow-hidden rounded-2xl border border-border/50 bg-white"><div className="flex items-center gap-4 border-b border-border/40 p-5"><Avatar user={currentUser} size="lg" showOnline isOnline /><div className="min-w-0 flex-1"><h2 className="text-lg font-semibold">{currentUser.name}</h2><p className="text-sm text-text-secondary">{currentUser.email}</p></div><Button variant="outline" size="sm" onClick={() => updateUser({ bio: currentUser.bio ? '' : 'Product designer passionate about minimalist interfaces.' })}>Edit profile</Button></div><div className="divide-y divide-border/40"><SettingRow icon={<Bell className="size-5" />} title="Push notifications" description="Get notified about new messages" control={<Toggle checked={pushNotifications} onChange={setPushNotifications} label="Push notifications" />} /><SettingRow icon={<ShieldCheck className="size-5" />} title="Privacy first" description="Conversations stay private by default" control={<span className="text-sm font-medium text-online-dark">Protected</span>} /><SettingRow icon={<Monitor className="size-5" />} title="Dark mode" description="Use a darker appearance" control={<Toggle checked={darkMode} onChange={setDarkMode} label="Dark mode" />} /></div></section><button onClick={signOut} className="mt-5 text-sm font-semibold text-error hover:underline">Sign out</button></div></AppShell>;
}

function SettingRow({ icon, title, description, control }: { icon: React.ReactNode; title: string; description: string; control: React.ReactNode }) {
  return <div className="flex items-center gap-3 p-5"><span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</span><span className="min-w-0 flex-1"><strong className="block text-sm">{title}</strong><span className="text-sm text-text-secondary">{description}</span></span>{control}</div>;
}

export default function AppRoutes() {
  return <Routes><Route path="/" element={<Navigate to="/app/conversations" replace />} /><Route path="/login" element={<AuthPage mode="login" />} /><Route path="/register" element={<AuthPage mode="register" />} /><Route path="/app/conversations" element={<RequireAuth><Home /></RequireAuth>} /><Route path="/app/chat/:conversationId" element={<RequireAuth><Home /></RequireAuth>} /><Route path="/app/contacts" element={<RequireAuth><ContactsPage /></RequireAuth>} /><Route path="/app/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} /><Route path="*" element={<Navigate to="/app/conversations" replace />} /></Routes>;
}
