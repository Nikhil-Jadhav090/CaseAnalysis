import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Shield, TrendingUp, Zap, ArrowRight, CheckCircle, FileText, Users, BarChart3, Lock, Globe, Brain } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 relative overflow-hidden">
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes float-slow { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 50% { transform: translate(10px, -20px) rotate(5deg); } }
        @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); } 50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.8); } }
        @keyframes slide-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-in { animation: slide-in-up 0.8s ease-out forwards; }
        .shimmer { background: linear-gradient(90deg, transparent, rgba(168,85,247,0.1), transparent); background-size: 1000px 100%; animation: shimmer 3s infinite; }
      `}</style>
      
      {particles.map((p) => (
        <div key={p.id} className="absolute rounded-full bg-purple-300/30" style={{left: `${p.x}%`, top: `${p.y}%`, width: `${p.size}px`, height: `${p.size}px`, animation: `float ${p.duration}s ease-in-out infinite ${p.delay}s`}} />
      ))}
      
      <div className="container mx-auto px-6 py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <section className="animate-slide-in" style={{animationDelay: '0.1s'}}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 border border-purple-200 mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-700 font-semibold">AI-Powered Case Management</span>
            </div>
            
            <h1 className="text-7xl font-black leading-tight mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600">Smarter case analysis</span>
              <br /> 
              <span className="text-gray-900">with AI insights</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">Create, analyze, and report on cases faster. Extract keywords, sentiment, auto-categorize, and surface similar cases using modern NLP.</p>

            <div className="flex gap-4 mb-12">
              <Link to="/register" className="group px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-bold flex items-center gap-2">
                Get started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/dashboard" className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 hover:border-purple-300 transition-all duration-300 transform hover:scale-105 font-semibold shadow-sm">View demo</Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[{icon: Shield, text: 'Role-based access', color: 'bg-blue-50 border-blue-200'}, {icon: Zap, text: 'AI summaries', color: 'bg-yellow-50 border-yellow-200'}, {icon: TrendingUp, text: 'Smart analytics', color: 'bg-green-50 border-green-200'}].map((item, i) => (
                <div key={i} className={`p-5 ${item.color} border rounded-xl hover:shadow-md transition-all duration-300 transform hover:scale-105 animate-slide-in bg-white/50 backdrop-blur-sm`} style={{animationDelay: `${0.3 + i*0.1}s`}}>
                  <item.icon className="w-6 h-6 text-purple-600 mb-2" />
                  <div className="text-sm text-gray-700 font-medium">{item.text}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="animate-slide-in" style={{animationDelay: '0.4s'}}>
            <div className="relative">
              {/* Floating decorative elements */}
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-yellow-200 to-orange-300 rounded-full opacity-40 blur-2xl animate-pulse" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-200 to-cyan-300 rounded-full opacity-40 blur-2xl" style={{animation: 'float-slow 8s ease-in-out infinite'}} />
              
              {/* Main illustration card */}
              <div className="relative bg-white p-10 rounded-3xl border-2 border-gray-200 overflow-hidden shadow-2xl">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <circle cx="20" cy="20" r="1" fill="#9333ea"/>
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid)"/>
                  </svg>
                </div>
                
                {/* Animated illustration */}
                <div className="relative z-10 space-y-6">
                  {/* Header with icon */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-30 animate-pulse" />
                      <div className="relative w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Brain className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-gray-900">AI Dashboard</h3>
                      <p className="text-gray-600">Powered by Google Gemini</p>
                    </div>
                  </div>
                  
                  {/* Feature cards grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {icon: FileText, label: 'Case Analysis', color: 'from-blue-500 to-cyan-500', stat: '1.2k+'},
                      {icon: Users, label: 'Active Users', color: 'from-green-500 to-emerald-500', stat: '500+'},
                      {icon: BarChart3, label: 'Reports', color: 'from-orange-500 to-red-500', stat: '3.5k+'},
                      {icon: Lock, label: 'Secure', color: 'from-purple-500 to-pink-500', stat: '100%'}
                    ].map((item, i) => (
                      <div key={i} className="group relative p-6 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl hover:border-purple-300 hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1" style={{animationDelay: `${0.5 + i*0.1}s`, animation: 'slide-in-up 0.6s ease-out forwards'}}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
                        <div className="relative">
                          <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-3 shadow-md`}>
                            <item.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-3xl font-black text-gray-900 mb-1">{item.stat}</div>
                          <div className="text-sm text-gray-600">{item.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Feature list */}
                  <div className="space-y-3 pt-4">
                    {[
                      {text: '7-Step Case Creation Wizard', color: 'text-blue-700'},
                      {text: 'Real-time AI Analysis', color: 'text-green-700'},
                      {text: 'PDF Report Generation', color: 'text-orange-700'},
                      {text: 'Secure Document Storage', color: 'text-purple-700'}
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 group hover:translate-x-2 transition-transform duration-300">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className={`font-medium ${feature.color}`}>{feature.text}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* CTA buttons */}
                  <div className="flex gap-3 pt-6">
                    <Link to="/cases/new" className="group flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-center flex items-center justify-center gap-2">
                      <FileText className="w-5 h-5" />
                      Create Case
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link to="/cases" className="flex-1 px-6 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:border-purple-300 transition-all duration-300 text-center hover:scale-105 transform shadow-sm">View All</Link>
                  </div>
                </div>
                
                {/* Decorative glow effects */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-200 rounded-full blur-3xl opacity-30 animate-pulse" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-pink-200 rounded-full blur-3xl opacity-30" style={{animation: 'pulse-glow 3s ease-in-out infinite'}} />
              </div>
            </div>
          </section>
        </div>
        
        {/* Features Section with Graphics */}
        <div className="mt-32 animate-slide-in" style={{animationDelay: '0.8s'}}>
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-gray-900 mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">Everything you need</span>
            </h2>
            <p className="text-xl text-gray-600">Powerful features for modern case management</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'AI-Powered Analysis',
                desc: 'Get comprehensive legal analysis with 7 detailed sections including justice pathway, police action, FIR guidance, and compensation info.',
                gradient: 'from-purple-500 to-pink-500',
                bgColor: 'bg-purple-50',
                illustration: (
                  <div className="relative h-48 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl" />
                    <div className="relative">
                      <div className="w-32 h-32 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                        <Brain className="w-16 h-16 text-white" />
                      </div>
                      <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                )
              },
              {
                icon: Shield,
                title: 'Secure & Compliant',
                desc: 'Role-based access control, JWT authentication, and encrypted data storage ensure your cases are protected and compliant.',
                gradient: 'from-blue-500 to-cyan-500',
                bgColor: 'bg-blue-50',
                illustration: (
                  <div className="relative h-48 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl" />
                    <div className="relative grid grid-cols-2 gap-4">
                      {[Lock, Shield, Users, Globe].map((Icon, i) => (
                        <div key={i} className={`w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg`} style={{animation: `float ${2 + i*0.5}s ease-in-out infinite ${i*0.2}s`}}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              },
              {
                icon: BarChart3,
                title: 'Smart Analytics',
                desc: 'Track case progress, analyze trends, and generate comprehensive PDF reports with beautiful visualizations.',
                gradient: 'from-green-500 to-emerald-500',
                bgColor: 'bg-green-50',
                illustration: (
                  <div className="relative h-48 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl" />
                    <div className="relative flex gap-2 items-end">
                      {[40, 70, 50, 90, 60].map((height, i) => (
                        <div key={i} className={`w-8 bg-gradient-to-t from-green-500 to-emerald-500 rounded-t-lg shadow-lg`} style={{height: `${height}%`, animation: `slide-in-up ${0.5 + i*0.1}s ease-out ${i*0.1}s both`}} />
                      ))}
                    </div>
                  </div>
                )
              }
            ].map((feature, i) => (
              <div key={i} className={`group relative p-8 ${feature.bgColor} border-2 border-gray-200 rounded-3xl hover:border-purple-300 hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 bg-white/50 backdrop-blur-sm`} style={{animationDelay: `${0.9 + i*0.1}s`, animation: 'slide-in-up 0.8s ease-out forwards'}}>
                
                {/* Illustration */}
                <div className="mb-6">
                  {feature.illustration}
                </div>
                
                {/* Content */}
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-24 text-center animate-slide-in" style={{animationDelay: '0.6s'}}>
          <p className="text-gray-600 text-sm mb-8">Trusted by teams in public safety & investigations</p>
          <div className="flex justify-center gap-8 items-center flex-wrap">
            {['Org A', 'Org B', 'Org C'].map((org, i) => (
              <div key={i} className="w-32 h-12 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center text-gray-700 font-semibold hover:border-purple-300 hover:shadow-md transition-all duration-300 transform hover:scale-110">{org}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

