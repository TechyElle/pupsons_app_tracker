import React, { FormEvent, useState } from 'react';
import { Activity, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Sprout } from 'lucide-react';

interface LoginPageProps {
  onSignIn: () => void;
}

export function LoginPage({ onSignIn }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSignIn();
  };

  return (
    <main className="teamhub-login min-h-screen grid lg:grid-cols-[minmax(0,1fr)_minmax(440px,.94fr)]">
      <section className="teamhub-login-form flex items-center justify-center px-6 py-10 sm:px-10 lg:px-16 xl:px-24">
        <div className="w-full max-w-[410px]">
          <div className="flex items-center gap-3 mb-14">
            <div className="teamhub-login-mark">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg leading-none font-extrabold tracking-tight text-[#064a31]">PUP SONs</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">Database Portal</p>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-sm font-semibold text-[#35835e]">Welcome back</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-800 sm:text-[34px]">Sign in to your account</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">Access your cell group records, reports, and ministry workspace.</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-slate-700">Email address</span>
              <span className="teamhub-login-field">
                <Mail className="w-4 h-4" />
                <input required type="email" autoComplete="email" placeholder="name@pup.edu.ph" />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 flex items-center justify-between text-xs font-bold text-slate-700">
                Password
                <button type="button" className="teamhub-login-link">Forgot password?</button>
              </span>
              <span className="teamhub-login-field">
                <LockKeyhole className="w-4 h-4" />
                <input required type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" />
                <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </span>
            </label>

            <label className="flex items-center gap-2.5 text-xs font-medium text-slate-500 cursor-pointer select-none">
              <input type="checkbox" className="teamhub-login-checkbox" />
              Keep me signed in
            </label>

            <button type="submit" className="teamhub-login-submit">
              Sign in <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">Protected workspace for PUP Seeds of the Nations.</p>
        </div>
      </section>

      <aside className="teamhub-login-aside hidden lg:flex flex-col justify-between overflow-hidden p-10 xl:p-14">
        <div className="flex items-center gap-2 text-sm font-bold text-[#c7e1a7]">
          <Sprout className="w-5 h-5" />
          Growing together in faith
        </div>
        <div className="relative z-10 max-w-[480px]">
          <p className="text-sm font-semibold text-[#c7e1a7]">SONs Database</p>
          <h2 className="mt-3 text-[42px] font-extrabold leading-[1.12] tracking-tight text-white">One home for every growing cell group.</h2>
          <p className="mt-5 max-w-md text-sm leading-6 text-emerald-50/70">Manage members, track weekly growth, and help every leader stay connected to the work that matters.</p>
          <div className="teamhub-login-stats mt-10 grid grid-cols-3 divide-x divide-white/10">
            <div><strong>01</strong><span>Shared<br />workspace</span></div>
            <div><strong>02</strong><span>Growth<br />tracking</span></div>
            <div><strong>03</strong><span>Ministry<br />insights</span></div>
          </div>
        </div>
        <p className="relative z-10 text-xs font-medium text-emerald-50/45">PUP Sta. Mesa · Manila</p>
      </aside>
    </main>
  );
}
