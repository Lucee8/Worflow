/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { AlertCircle, Eye, EyeOff, ShieldCheck, Mail, Lock, ShieldAlert } from 'lucide-react';

interface LoginScreenProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
}

export default function LoginScreen({ users, onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [showGoogleModal, setShowGoogleModal] = React.useState(false);
  const [googleEmail, setGoogleEmail] = React.useState('');

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email) {
      setErrorMessage('Please enter your workshop email address.');
      return;
    }

    const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!found) {
      setErrorMessage(`No user account with email "${email}" exists. Please check or use the simulator HUD at the top!`);
      return;
    }

    if (!found.is_active) {
      setErrorMessage(`This account (Initials: ${found.initials}) is currently Deactivated by the Administrator. Access denied.`);
      return;
    }

    // Success! Accept any dummy password
    onLoginSuccess(found);
  };

  const handleGoogleSimulatorLogin = (selectedEmail: string) => {
    setErrorMessage(null);
    setShowGoogleModal(false);

    const found = users.find((u) => u.email.toLowerCase() === selectedEmail.trim().toLowerCase());

    if (!found) {
      setErrorMessage('Access Denied: This Gmail account is not registered in our database. Admins must register user emails first.');
      return;
    }

    if (!found.is_active) {
      setErrorMessage(`Access Denied: The Google account is mapped to ${found.name} but this profile is inactive.`);
      return;
    }

    onLoginSuccess(found);
  };

  const handleGoogleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGoogleSimulatorLogin(googleEmail);
  };

  return (
    <div className="flex-1 min-h-screen bg-[#fcfbf9] flex flex-col justify-between">
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 md:py-16 min-h-[calc(100vh-40px)]">
        {/* Interactive Login Panel Card with smooth spring loading */}
        <motion.div
          initial={{ opacity: 0, y: 35, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 180, damping: 20 }}
          className="bg-white border border-stone-200/80 shadow-xl rounded-2xl max-w-md w-full p-6 md:p-10"
        >
          <div className="w-full space-y-6">
            <div className="flex items-center gap-3 justify-center pb-5 border-b border-stone-100">
              <div className="bg-amber-500 text-stone-950 p-2.5 rounded-xl font-bold text-base shadow-md border border-amber-400 leading-none">
                Bh
              </div>
              <div className="text-left">
                <span className="font-display font-black tracking-wider text-[#593622] text-sm uppercase block leading-none">Bhise'z</span>
                <span className="text-[9px] uppercase font-mono tracking-wider text-stone-400 block mt-1 font-bold">Workshop Order Tracker</span>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-display font-extrabold text-stone-900 tracking-tight">
                Sign in to your account
              </h2>
              <p className="text-stone-500 text-xs mt-1">
                Access your orders and manage workshop operations
              </p>
            </div>

            {/* Quick Demo Login Helper Card */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-amber-700 shrink-0" size={16} />
                <span className="font-bold text-xs text-[#593622]">Quick Demo Credentials</span>
              </div>
              <div className="text-[11px] text-stone-600 leading-normal">
                Explore the Administrator dashboard using these workshop credentials, or sign in instantly with the button below:
                <div className="mt-2 text-stone-800 font-mono bg-stone-50/80 p-2.5 rounded-lg border border-stone-200/60 divide-y divide-stone-100">
                  <div className="pb-1.5 flex justify-between items-center">
                    <span className="font-sans font-semibold text-stone-500 text-[10px] uppercase">Email</span>
                    <code className="text-amber-900 font-bold select-all bg-amber-500/5 px-1 py-0.5 rounded">admin@bhisesworkshop.com</code>
                  </div>
                  <div className="pt-1.5 flex justify-between items-center">
                    <span className="font-sans font-semibold text-stone-500 text-[10px] uppercase">Password</span>
                    <div className="text-right">
                      <code className="text-[#593622] font-bold select-all bg-amber-500/5 px-1 py-0.5 rounded">admin</code>
                      <span className="text-[9px] text-stone-400 font-sans font-normal ml-1">(any accepted)</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@bhisesworkshop.com');
                  setPassword('admin');
                  const foundAdmin = users.find(u => u.email.toLowerCase() === 'admin@bhisesworkshop.com');
                  if (foundAdmin) {
                    onLoginSuccess(foundAdmin);
                  }
                }}
                className="w-full bg-[#593622] hover:bg-[#402414] text-white py-2 px-3 rounded-xl font-bold text-xs shadow-sm transition-all duration-200 flex items-center justify-center gap-1.5 hover:shadow-md active:scale-[0.98]"
              >
                Instant Admin Sign-In →
              </button>
            </div>

            {errorMessage && (
              <div className="bg-rose-50 border-l-4 border-rose-600 p-4 rounded-r-lg flex gap-3 text-stone-800 text-xs">
                <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={16} />
                <div>
                  <span className="font-bold text-rose-800">Authentication Error</span>
                  <p className="mt-1">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Google Sign-In Box */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setShowGoogleModal(true)}
                className="w-full flex items-center justify-center gap-3 bg-white border border-stone-300 hover:border-stone-400 hover:bg-stone-50 text-stone-700 font-semibold py-2.5 px-4 rounded-xl shadow-sm transition text-xs"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.59 5.59 0 0 1 8.4 12.928a5.59 5.59 0 0 1 5.591-5.59c1.554 0 2.943.535 4.043 1.583l3.078-3.078C19.262 3.992 16.824 3.2 13.99 3.2 8.577 3.2 4.185 7.592 4.185 13c0 5.408 4.392 9.8 9.806 9.8 8.136 0 10.37-7.375 9.4-12.515H12.24z"
                  />
                </svg>
                Sign in with Google
              </button>

              <div className="flex items-center justify-center gap-2 py-2">
                <div className="flex-1 h-px bg-stone-200" />
                <span className="text-[10px] text-stone-400 font-mono tracking-wider uppercase bg-white px-2">or Sign in with Email</span>
                <div className="flex-1 h-px bg-stone-200" />
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                    Workshop Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 text-stone-400" size={16} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="entered email, e.g. sagar@bhisesworkshop.com"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-200 focus:border-[#593622] rounded-xl focus:outline-none transition animate-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => alert("Simulation mode: Any password is accepted for valid team emails!")}
                      className="text-[11px] text-[#593622] hover:underline font-semibold"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 text-stone-400" size={16} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-stone-50 border border-stone-200 focus:border-[#593622] rounded-xl focus:outline-none transition animate-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-stone-600 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      className="h-4 w-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500 cursor-pointer"
                    />
                    <span className="text-xs">Remember me</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#593622] hover:bg-[#402414] text-white py-3 px-4 rounded-xl font-bold shadow transition text-xs flex justify-center items-center gap-2 active:scale-[0.985]"
                >
                  Login
                </button>
              </form>
            </div>

            <div className="bg-[#fcf8f2] border border-amber-200/60 p-4 rounded-r-lg rounded-l-md flex gap-2.5 text-[11px] text-[#78350f]">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-amber-600" />
              <div>
                <span className="font-bold">Need floor access?</span>
                <p className="mt-0.5 leading-relaxed text-stone-600">
                  New email registrations and initials assignment must be registered by an administrator profile. Use the simulator bar at the top for quick roles validation.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Google Login Simulation Modal */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ duration: 0.28, type: "spring", stiffness: 320, damping: 25 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-5"
            >
              <div className="text-center space-y-1">
                <div className="flex justify-center mb-1">
                  <svg className="w-8 h-8" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <h3 className="font-display font-black text-stone-950">Choose a Google Account</h3>
                <p className="text-xs text-stone-500">to continue with Bhise'z Workshop Tracker</p>
              </div>

              <div className="space-y-1 bg-stone-50 p-2 rounded-xl border border-stone-200 max-h-[180px] overflow-y-auto">
                <p className="text-[9px] font-mono font-bold tracking-wider text-stone-400 px-3 py-1">REGISTERED TEAM ACCOUNTS</p>
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleGoogleSimulatorLogin(u.email)}
                    className="w-full flex items-center justify-between text-left p-2.5 rounded-lg hover:bg-white border border-transparent hover:border-stone-200 transition text-xs"
                  >
                    <div>
                      <span className="font-bold text-stone-800 block text-[11px]">{u.name}</span>
                      <span className="text-stone-500 font-mono text-[10px] block">{u.email}</span>
                    </div>
                    <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded uppercase font-bold">{u.role}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 py-1">
                <div className="flex-1 h-px bg-stone-200" />
                <span className="text-[9px] text-stone-400 font-bold uppercase font-mono">Simulate Unregistered Email</span>
                <div className="flex-1 h-px bg-stone-200" />
              </div>

              <form onSubmit={handleGoogleCustomSubmit} className="space-y-3">
                <input
                  type="email"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="unknown.tester@gmail.com"
                  className="w-full p-2 text-xs bg-stone-50 border border-stone-200 focus:border-[#593622] focus:outline-none rounded-lg"
                />
                <button
                  type="submit"
                  className="w-full bg-stone-800 hover:bg-stone-900 text-white font-bold py-2 rounded-lg text-xs"
                >
                  Log In with unknown Gmail
                </button>
              </form>

              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="w-full py-1 text-[11px] font-bold text-center text-stone-500 hover:text-stone-800"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="h-10 text-center leading-10 text-[11px] text-stone-400 border-t border-stone-100 bg-[#fafaf9]">
        © 2026 Bhise'z Workshop. All rights reserved.
      </footer>
    </div>
  );
}
