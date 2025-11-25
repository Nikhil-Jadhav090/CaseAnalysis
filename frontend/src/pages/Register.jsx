import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Sparkles } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    setParticles(Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 4 + 4,
      delay: Math.random() * 2
    })))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!name || !email || !password || !confirmPassword) {
        throw new Error('Please fill in all fields');
      }
      if (password !== confirmPassword) {
        throw new Error("Passwords don't match");
      }
      
      console.log('[REGISTER] Form submission:', { name, email });
      await register(name, email, password);
      console.log('[REGISTER] Success - redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('[REGISTER] Error:', err.message);
      setError(err.message || 'Failed to create an account');
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden flex items-center justify-center py-12 px-4">
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); } 50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.8); } }
        .shimmer { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); background-size: 1000px 100%; animation: shimmer 3s infinite; }
      `}</style>
      
      {particles.map((p) => (
        <div key={p.id} className="absolute rounded-full bg-white/20" style={{left: `${p.x}%`, top: `${p.y}%`, width: `${p.size}px`, height: `${p.size}px`, animation: `float ${p.duration}s ease-in-out infinite ${p.delay}s`}} />
      ))}
      
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl items-center justify-center shadow-2xl shadow-purple-500/50 animate-pulse-glow mb-4">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-black text-white mb-2">Create Account</h2>
          <p className="text-purple-200">Join us and start managing cases smarter</p>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-xl opacity-75" />
          <div className="relative backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 shimmer pointer-events-none" />
            
            {error && (
              <div className="mb-6 bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl backdrop-blur-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div>
                <label className="block text-sm font-semibold text-purple-100 mb-2">Full name</label>
                <input
                  type="text"
                  required
                  disabled={isLoading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent placeholder-purple-300/50 disabled:opacity-50 transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-purple-100 mb-2">Email address</label>
                <input
                  type="email"
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent placeholder-purple-300/50 disabled:opacity-50 transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-purple-100 mb-2">Password</label>
                <input
                  type="password"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent placeholder-purple-300/50 disabled:opacity-50 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-purple-100 mb-2">Confirm Password</label>
                <input
                  type="password"
                  required
                  disabled={isLoading}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent placeholder-purple-300/50 disabled:opacity-50 transition-all"
                  placeholder="••••••••"
                />
              </div>


              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white rounded-xl font-bold shadow-2xl hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Create Account
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-purple-200">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-pink-300 hover:text-white transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


