import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiMoon,
  FiSun,
  FiAlertCircle,
  FiShield,
  FiTrendingUp,
  FiBell,
  FiArrowRight,
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const { login } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const validate = () => {
    if (!email.includes('@')) return 'Enter a valid email';
    if (password.length < 4) return 'Password too short';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError('Invalid credentials');
    }
  };

  const features = [
    { icon: <FiTrendingUp className="w-4 h-4" />, text: "Track loans & interest in real time" },
    { icon: <FiBell className="w-4 h-4" />, text: "Automated payment reminders" },
    { icon: <FiShield className="w-4 h-4" />, text: "Bank-grade security & encryption" },
  ];

  return (
    <div className="relative min-h-[100dvh] flex bg-slate-50 dark:bg-gray-950 transition-colors duration-300">

      {/* ==================== LEFT PANEL (DESKTOP ONLY) ==================== */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-800 to-purple-900 text-white p-12">
        {/* Ambient Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[420px] h-[420px] bg-white/10 blur-[120px] rounded-full -top-40 -left-40" />
          <div className="absolute w-[420px] h-[420px] bg-purple-400/20 blur-[120px] rounded-full -bottom-40 -right-40" />
        </div>

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <div className="relative z-10 flex flex-col justify-between w-full max-w-lg">

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-11 h-11 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center shadow-lg">
              <FiTrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">LendFlow</span>
          </motion.div>

          {/* Hero Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="my-12"
          >
            <h1 className="text-4xl xl:text-5xl font-bold leading-[1.15] tracking-tight">
              Lending made
              <br />
              <span className="bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent">
                simple & smart.
              </span>
            </h1>
            <p className="mt-5 text-base text-indigo-100/80 leading-relaxed max-w-md">
              Manage your borrowers, track payments, and never miss a due date — all in one beautifully crafted dashboard.
            </p>

            {/* Feature List */}
            <div className="mt-8 space-y-3">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3 text-sm text-indigo-100/90"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0">
                    {f.icon}
                  </div>
                  <span>{f.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Testimonial / Trust Footer */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
          >
            <p className="text-sm text-indigo-100/90 leading-relaxed italic">
              "LendFlow replaced my messy spreadsheets. I finally know exactly who owes what, and my reminders go out automatically."
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-300 to-purple-300 flex items-center justify-center text-indigo-900 text-xs font-bold">
                R
              </div>
              <div className="text-xs">
                <p className="font-semibold text-white">Rahul S.</p>
                <p className="text-indigo-200/70">Small business owner</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ==================== RIGHT PANEL (FORM) ==================== */}
      <div className="flex-1 flex flex-col relative overflow-hidden">

        {/* Mobile/Small screen background orbs */}
        <div className="lg:hidden absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-[400px] h-[400px] bg-indigo-500/20 blur-[120px] rounded-full -top-40 -left-40" />
          <div className="absolute w-[400px] h-[400px] bg-purple-500/20 blur-[120px] rounded-full -bottom-40 -right-40" />
        </div>

        {/* Theme Toggle */}
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
            className="p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-slate-600 dark:text-gray-300 shadow-sm active:scale-[0.98] sm:hover:scale-105 transition-all"
          >
            {darkMode ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
          </button>
        </div>

        {/* Form Container */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12 sm:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >

            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-2.5 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <FiTrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                LendFlow
              </span>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Welcome back
              </h2>
              <p className="text-sm text-slate-500 dark:text-gray-400 mt-1.5">
                Sign in to access your LendFlow dashboard.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 flex items-start gap-3 p-3.5 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-xl"
              >
                <FiAlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
                <p className="text-sm text-rose-700 dark:text-rose-300 font-medium">
                  {error}
                </p>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-gray-300 mb-1.5 block ml-1">
                  Email address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5 ml-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-gray-300">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <FiLock className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 ml-1">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="remember" className="text-sm text-slate-600 dark:text-gray-300 cursor-pointer">
                  Keep me signed in
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.99 }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md shadow-indigo-500/20 hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <FiArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-slate-200 dark:bg-gray-800" />
                <span className="text-xs font-medium text-slate-400 dark:text-gray-500 uppercase tracking-wider">
                  or continue with
                </span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-gray-800" />
              </div>

              {/* Google Button */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-200 font-medium hover:bg-slate-50 dark:hover:bg-gray-800 hover:border-slate-300 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

            </form>

            {/* Register Link */}
            <p className="mt-8 text-center text-sm text-slate-500 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Create one
              </Link>
            </p>

            {/* Security Badge */}
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-gray-500">
              <FiShield className="w-3.5 h-3.5" />
              <span>Secured with 256-bit encryption</span>
            </div>

          </motion.div>
        </div>
      </div>

    </div>
  );
};

export default Login;