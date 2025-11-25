import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Shield, TrendingUp, Zap, ArrowRight, CheckCircle } from 'lucide-react'

export default function Landing(){
  const [particles, setParticles] = useState([])
  
  useEffect(() => {
    setParticles(Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 2
    })))
  }, [])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes float-slow { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 50% { transform: translate(10px, -20px) rotate(5deg); } }
        @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); } 50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.8); } }
        @keyframes slide-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-in { animation: slide-in-up 0.8s ease-out forwards; }
        .shimmer { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); background-size: 1000px 100%; animation: shimmer 3s infinite; }
      `}</style>
      
      {particles.map((p) => (
        <div key={p.id} className="absolute rounded-full bg-white/20" style={{left: `${p.x}%`, top: `${p.y}%`, width: `${p.size}px`, height: `${p.size}px`, animation: `float ${p.duration}s ease-in-out infinite ${p.delay}s`}} />
      ))}
      
      <div className="container mx-auto px-6 py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <section className="animate-slide-in" style={{animationDelay: '0.1s'}}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-400/30 backdrop-blur-sm mb-6 animate-pulse-glow">
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span className="text-sm text-purple-200 font-semibold">AI-Powered Case Management</span>
            </div>
            
            <h1 className="text-7xl font-black leading-tight mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 animate-pulse">Smarter case analysis</span>
              <br /> 
              <span className="text-white">with AI insights</span>
            </h1>
            <p className="text-xl text-purple-100 leading-relaxed mb-8">Create, analyze, and report on cases faster. Extract keywords, sentiment, auto-categorize, and surface similar cases using modern NLP.</p>

            <div className="flex gap-4 mb-12">
              <Link to="/register" className="group px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 font-bold flex items-center gap-2">
                Get started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/dashboard" className="px-8 py-4 backdrop-blur-xl bg-white/10 border border-white/20 text-white rounded-2xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 font-semibold">View demo</Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[{icon: Shield, text: 'Role-based access'}, {icon: Zap, text: 'AI summaries'}, {icon: TrendingUp, text: 'Smart analytics'}].map((item, i) => (
                <div key={i} className="p-5 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 transform hover:scale-105 animate-slide-in" style={{animationDelay: `${0.3 + i*0.1}s`}}>
                  <item.icon className="w-6 h-6 text-purple-300 mb-2" />
                  <div className="text-sm text-purple-100 font-medium">{item.text}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="animate-slide-in" style={{animationDelay: '0.4s'}}>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition duration-1000 animate-pulse" />
              <div className="relative backdrop-blur-2xl bg-white/10 p-8 rounded-3xl border border-white/20 overflow-hidden">
                <div className="absolute inset-0 shimmer pointer-events-none" />
                <div className="absolute -right-20 -top-20 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-30 animate-pulse" />
                <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-pink-500 rounded-full blur-3xl opacity-30 animate-pulse" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center animate-pulse-glow">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Live Demo</h3>
                  </div>
                  <p className="text-purple-100 mb-6 leading-relaxed">Create a case, upload evidence, and see an AI-generated summary and suggested category in real-time.</p>
                  
                  <div className="space-y-3 mb-8">
                    {['Auto-categorization', 'Sentiment analysis', 'Smart recommendations'].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 text-purple-100">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-3">
                    <Link to="/cases/new" className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 text-center">Create a case</Link>
                    <Link to="/cases" className="flex-1 px-6 py-3 border border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 text-center">Browse cases</Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        
        <div className="mt-24 text-center animate-slide-in" style={{animationDelay: '0.6s'}}>
          <p className="text-purple-200 text-sm mb-8">Trusted by teams in public safety & investigations</p>
          <div className="flex justify-center gap-8 items-center flex-wrap">
            {['Org A', 'Org B', 'Org C'].map((org, i) => (
              <div key={i} className="w-32 h-12 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white font-semibold hover:bg-white/10 transition-all duration-300 transform hover:scale-110">{org}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

