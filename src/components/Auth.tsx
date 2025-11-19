import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { validateUsername, validateEmail, validatePassword } from '../utils/validation';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        // Reset password
        const emailValidation = validateEmail(email);
        if (!emailValidation.valid) {
          throw new Error(emailValidation.error);
        }

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (resetError) throw resetError;

        showToast('Password reset email sent! Check your inbox.', 'success');
        setIsForgotPassword(false);
        setEmail('');
      } else {
        // Validate inputs
        const emailValidation = validateEmail(email);
        if (!emailValidation.valid) {
          throw new Error(emailValidation.error);
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
          throw new Error(passwordValidation.error);
        }

        if (isSignUp) {
          const usernameValidation = validateUsername(username);
          if (!usernameValidation.valid) {
            throw new Error(usernameValidation.error);
          }
          await signUp(email, password, username);
          showToast('Account created successfully!', 'success');
        } else {
          await signIn(email, password);
          showToast('Welcome back!', 'success');
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="glass-effect rounded-3xl shadow-2xl w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {isForgotPassword ? 'Reset Password' : isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-white/70 text-lg">
            {isForgotPassword 
              ? 'Enter your email to receive reset link' 
              : isSignUp 
              ? 'Join the marketplace' 
              : 'Sign in to continue'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && !isForgotPassword && (
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-effect border border-white/20 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 outline-none transition text-white placeholder-white/50"
                placeholder="username"
                required={isSignUp}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-effect border border-white/20 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 outline-none transition text-white placeholder-white/50"
              placeholder="you@example.com"
              required
            />
          </div>

          {!isForgotPassword && (
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-effect border border-white/20 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/50 outline-none transition text-white placeholder-white/50"
                placeholder="••••••••"
                required
              />
            </div>
          )}

          {error && (
            <div className="glass-effect border border-red-400/50 text-red-300 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-glow hover:scale-105 relative overflow-hidden group"
          >
            <span className="relative z-10">
              {loading 
                ? 'Please wait...' 
                : isForgotPassword 
                ? 'Send Reset Link' 
                : isSignUp 
                ? 'Sign Up' 
                : 'Sign In'}
            </span>
            <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          {!isForgotPassword && !isSignUp && (
            <button
              onClick={() => setIsForgotPassword(true)}
              className="text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors block w-full"
            >
              Forgot password?
            </button>
          )}
          
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setIsForgotPassword(false);
              setError('');
            }}
            className="text-white/80 hover:text-white text-sm font-medium transition-colors block w-full"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>

          {isForgotPassword && (
            <button
              onClick={() => {
                setIsForgotPassword(false);
                setError('');
              }}
              className="text-white/80 hover:text-white text-sm font-medium transition-colors block w-full"
            >
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
