import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2
    }));
    setParticles(newParticles);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Please fill in all fields');
      }
      console.log('[LOGIN] Form submission:', { email });
      const u = await authLogin(email, password);
      console.log('[LOGIN] Success - determining redirect');
      // If admin, always go to Admin Dashboard; otherwise go to intended page or user dashboard
      if (u && (u.role === 'admin' || u.is_staff)) {
        navigate('/admin', { replace: true });
      } else {
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('[LOGIN] Error:', err.message);
      setError(err.message || 'Login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-white opacity-20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animation: `float ${particle.duration}s ease-in-out infinite ${particle.delay}s`
          }}
        />
      ))}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-40px) translateX(-10px); }
          75% { transform: translateY(-20px) translateX(5px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); }
          50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.8); }
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .animate-slide-in {
          animation: slideInUp 0.6s ease-out forwards;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>

      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-slide-in" style={{ animationDelay: '0.1s' }}>
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 rounded-2xl animate-pulse-glow flex items-center justify-center transform rotate-12 transition-transform duration-500 hover:rotate-0 hover:scale-110">
            <Sparkles className="text-white w-10 h-10" />
          </div>
        </div>
        <h2 className="mt-8 text-center text-4xl font-extrabold text-white tracking-tight">
          Welcome Back
        </h2>
        <p className="mt-2 text-center text-sm text-purple-200">
          Sign in to continue your journey
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-slide-in" style={{ animationDelay: '0.3s' }}>
        <div className="backdrop-blur-2xl bg-white/10 py-10 px-6 shadow-2xl sm:rounded-3xl sm:px-12 border border-white/20 relative overflow-hidden">
          <div className="absolute inset-0 shimmer pointer-events-none" />
          
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-400/50 text-red-100 px-4 py-3 rounded-xl animate-slide-in backdrop-blur-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="transform transition-all duration-300 hover:scale-105">
              <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-300" />
                Email address
              </label>
              <input
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full bg-white/5 border border-white/20 text-white rounded-xl shadow-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent placeholder-gray-400 transition-all duration-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="you@example.com"
              />
            </div>

            <div className="transform transition-all duration-300 hover:scale-105">
              <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-300" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full bg-white/5 border border-white/20 text-white rounded-xl shadow-lg py-3 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent placeholder-gray-400 transition-all duration-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>


            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-purple-200 hover:text-white transition-colors cursor-pointer">
                <input type="checkbox" className="mr-2 rounded" />
                Remember me
              </label>
              <a href="#" className="font-medium text-purple-300 hover:text-purple-100 transition-colors">
                Forgot password?
              </a>
            </div>

            <div>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <Sparkles className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gradient-to-r from-transparent via-purple-900 to-transparent text-purple-200">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="w-full inline-flex justify-center py-3 px-4 rounded-xl shadow-lg bg-white/5 border border-white/20 hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                <span className="text-white font-medium">Google</span>
              </button>
              <button className="w-full inline-flex justify-center py-3 px-4 rounded-xl shadow-lg bg-white/5 border border-white/20 hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                <span className="text-white font-medium">GitHub</span>
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
              <p className="text-sm text-purple-200">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-purple-300 hover:text-purple-100 transition-colors">
                  Sign up now
                </Link>
              </p>
          </div>
        </div>
      </div>
    </div>
  );
}