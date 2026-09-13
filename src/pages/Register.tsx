import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  FiUser,
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
  FiCheckCircle,
  FiArrowRight,
  FiZap,
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const validate = () => {
    if (!name.trim()) return 'Name is required';
    if (!email.includes('@')) return 'Enter valid email';
    if (password.length < 4) return 'Password too short';
    if (password !== confirmPassword) return 'Passwords do not match';
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
    const result = await register(name, email, password);
    setLoading(false);

    if (result.success) {
      navigate('/login');
    } else {
      setError('Registration failed');
    }
  };

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  }, [password]);

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const features = [
    { icon: <FiZap className="w-4 h-4" />, text: "Get started in under 2 minutes" },
    { icon: <FiShield className="w-4 h-4" />, text: "Your data is encrypted end-to-end" },
    { icon: <FiBell className="w-4 h-4" />, text: "Automatic reminders, zero effort" },
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
              Start managing
              <br />
              <span className="bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent">
                your loans today.
              </span>
            </h1>
            <p className="mt-5 text-base text-indigo-100/80 leading-relaxed max-w-md">
              Join hundreds of small business owners who use LendFlow to organize their lending, track payments, and grow with confidence.
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

          {/* Trust / Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold text-white">10k+</p>
                <p className="text-xs text-indigo-200/70 mt-0.5">Loans tracked</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">₹2.4Cr</p>
                <p className="text-xs text-indigo-200/70 mt-0.5">Payments managed</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-indigo-100/80">
              <FiCheckCircle className="w-3.5 h-3.5 text-emerald-300" />
              <span>Free forever for personal use</span>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ==================== RIGHT PANEL (FORM) ==================== */}
      <div className="flex-1 flex flex-col relative overflow-hidden">

        {/* Mobile background orbs */}
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
                Create your account
              </h2>
              <p className="text-sm text-slate-500 dark:text-gray-400 mt-1.5">
                Get started with LendFlow in less than a minute.
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
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-gray-300 mb-1.5 block ml-1">
                  Full name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-indigo-500"
                  />
                </div>
              </div>

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

              {/* Password + Strength Meter */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-gray-300 mb-1.5 block ml-1">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
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

                {/* Strength Meter */}
                {password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 ml-1"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              i <= passwordStrength.score
                                ? passwordStrength.color
                                : 'bg-slate-200 dark:bg-gray-700'
                            }`}
                          />
                        ))}
                      </div>
                      <span
                        className={`text-[11px] font-semibold ${
                          passwordStrength.score <= 1
                            ? 'text-rose-600 dark:text-rose-400'
                            : passwordStrength.score === 2
                            ? 'text-amber-600 dark:text-amber-400'
                            : passwordStrength.score === 3
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-1">
                      Use 8+ characters with uppercase, numbers & symbols.
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-gray-300 mb-1.5 block ml-1">
                  Confirm password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className={`w-full pl-12 pr-12 py-3 rounded-xl border bg-slate-50 text-slate-900 outline-none transition focus:bg-white focus:ring-4 dark:bg-gray-900 dark:text-white ${
                      confirmPassword.length > 0
                        ? passwordsMatch
                          ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/10 dark:border-emerald-600'
                          : 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10 dark:border-rose-600'
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 dark:border-gray-700 dark:focus:border-indigo-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showConfirm ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>

                  {/* Match Indicator */}
                  {confirmPassword.length > 0 && (
                    <div className="absolute right-12 top-3.5">
                      {passwordsMatch ? (
                        <FiCheckCircle className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <FiAlertCircle className="w-5 h-5 text-rose-500" />
                      )}
                    </div>
                  )}
                </div>
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="text-[11px] text-rose-500 mt-1 ml-1 font-medium">
                    Passwords do not match
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.99 }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md shadow-indigo-500/20 hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
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

            {/* Login Link */}
            <p className="mt-8 text-center text-sm text-slate-500 dark:text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Sign in
              </Link>
            </p>

            {/* Terms + Security Badge */}
            <div className="mt-8 space-y-3">
              <p className="text-[11px] text-center text-slate-400 dark:text-gray-500 leading-relaxed">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="underline hover:text-indigo-600 dark:hover:text-indigo-400">
                  Terms
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="underline hover:text-indigo-600 dark:hover:text-indigo-400">
                  Privacy Policy
                </Link>
                .
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-gray-500">
                <FiShield className="w-3.5 h-3.5" />
                <span>Secured with 256-bit encryption</span>
              </div>
            </div>

          </motion.div>
        </div>
      </div>

    </div>
  );
};

export default Register;