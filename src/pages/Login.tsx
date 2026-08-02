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
  FiAlertCircle
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden 
      bg-gradient-to-br from-indigo-100 via-white to-purple-100 
      dark:from-black dark:via-gray-950 dark:to-gray-900">

        {/* BACKGROUND */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 14, repeat: Infinity }}
            className="absolute w-[520px] h-[520px] bg-indigo-500/30 blur-[150px] top-[-180px] left-[-180px] rounded-full"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2] }}
            transition={{ duration: 18, repeat: Infinity }}
            className="absolute w-[520px] h-[520px] bg-purple-500/30 blur-[150px] bottom-[-180px] right-[-180px] rounded-full"
          />
        </div>

      {/* THEME TOGGLE */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-6 right-6 z-50 p-3 rounded-full 
        bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl 
        border border-white/20 dark:border-gray-700 shadow-md"
      >
        {darkMode ? <FiSun /> : <FiMoon />}
      </button>

      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div className="relative p-10 rounded-3xl shadow-2xl 
          bg-white/60 dark:bg-gray-900/60 backdrop-blur-3xl 
          border border-white/20 dark:border-gray-700">

            {/* glow */}
            <div className="absolute inset-0 rounded-3xl 
              bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
              opacity-10 blur-2xl pointer-events-none" />

            {/* HEADER */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold tracking-tight 
                bg-gradient-to-r from-indigo-600 to-purple-600 
                bg-clip-text text-transparent">
                Money Lender
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">
                Secure access to your dashboard
              </p>
            </div>

            {/* ERROR BOX */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-4 flex items-center gap-2 text-sm text-red-600 
                bg-red-100 dark:bg-red-500/10 p-2 rounded-lg border border-red-300"
              >
                <FiAlertCircle />
                {error}
              </motion.div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* EMAIL */}
              <div className="relative">
                <FiMail className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="peer w-full pl-10 pt-5 pb-2 rounded-xl 
                  bg-white/70 dark:bg-gray-800/60 
                  border border-gray-300 dark:border-gray-700
                  focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder=" "
                />
                <label className="absolute left-10 top-2 text-gray-500 text-sm
                  peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base
                  peer-focus:top-1 peer-focus:text-sm peer-focus:text-indigo-500">
                  Email
                </label>
              </div>

              {/* PASSWORD */}
              <div className="relative">
                <FiLock className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="peer w-full pl-10 pr-10 pt-5 pb-2 rounded-xl 
                  bg-white/70 dark:bg-gray-800/60 
                  border border-gray-300 dark:border-gray-700
                  focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder=" "
                />
                <label className="absolute left-10 top-2 text-gray-500 text-sm
                  peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base
                  peer-focus:top-1 peer-focus:text-sm peer-focus:text-indigo-500">
                  Password
                </label>

                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 cursor-pointer text-gray-500 hover:text-indigo-500"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </div>
              </div>

              {/* BUTTON */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold 
                bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 
                shadow-lg hover:shadow-2xl transition"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </motion.button>

              {/* DIVIDER */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
                <span className="text-xs text-gray-500">OR</span>
                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
              </div>

              {/* GOOGLE */}
              <button
                type="button"
                className="w-full py-3 rounded-xl 
                bg-white/70 dark:bg-gray-800/60 
                border border-gray-300 dark:border-gray-700
                hover:shadow-md transition"
              >
                Continue with Google
              </button>

              {/* REGISTER */}
              <div className="text-center">
                <Link
                  to="/register"
                  className="text-sm font-medium text-indigo-600 hover:text-purple-600"
                >
                  Don’t have an account? Register →
                </Link>
              </div>

            </form>
          </div>
        </motion.div>

    </div>
  );
};

export default Login;